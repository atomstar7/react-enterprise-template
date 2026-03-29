// @ts-nocheck
import React, {useEffect, useRef, useState, useCallback} from 'react';
import * as d3 from 'd3';
import {DagData, Node} from '@/api/viewRequest';
import RingNodeGlyph from '../RingNodeGlyph';
import GreyGlyph from '../GreyGlyph';

import './index.less';
import actions from '@/store/index';
import {convertActionsToDagData, ActionRecord} from '@/utils/dagConverter';
import {clusterColorStore} from '@/store/colorMapping';

// Wrapper for D3 hierarchy to include incoming edge info
interface TreeNode extends Node {
    children?: TreeNode[];
    _children?: TreeNode[]; // Keep track of collapsed children
    incomingReasoning?: string;
    incomingType?: string;
    innerGraphData?: {
        nodes: {id: number; x: number; y: number; category: string}[];
        links: {source: number; target: number}[];
    };
}

interface TooltipState {
    visible: boolean;
    x: number;
    y: number;
    content: string;
}

const RingNodeDag = () => {
    const [dagData, setDagData] = useState<DagData | null>(null);
    const [layoutRoot, setLayoutRoot] = useState<d3.HierarchyPointNode<TreeNode> | null>(null);
    const [tooltip, setTooltip] = useState<TooltipState>({visible: false, x: 0, y: 0, content: ''});
    // Add state to track which nodes are collapsed
    const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);

    // Initialize color scale once
    useEffect(() => {
        const allClusterIds: string[] = [];
        (actions as ActionRecord[]).forEach((action) => {
            if (action.mapping && action.mapping.length > 0) {
                const mappingObj = action.mapping[0];
                Object.keys(mappingObj).forEach((clusterId) => {
                    if (!allClusterIds.includes(clusterId)) {
                        allClusterIds.push(clusterId);
                    }
                });
            }
        });
        clusterColorStore.initializeScale(allClusterIds);
    }, []);

    const loadData = useCallback(async () => {
        try {
            const data = convertActionsToDagData(actions as any);

            if (data) {
                setDagData(data);
            }
        } catch (err: any) {
            console.error('Failed to process local DAG data:', err);
        }
    }, []);

    // 1. Load Data
    useEffect(() => {
        loadData();
    }, [loadData]);

    // 2. Process Data & Calculate Layout
    useEffect(() => {
        if (!dagData) return;
        const {nodes, links} = dagData;
        if (nodes.length === 0) return;

        // Map for quick lookup
        const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));

        // Build adjacency list
        const adj = new Map<string, {target: string; reasoning: string; type: string}[]>();
        const inDegree = new Map<string, number>();

        nodes.forEach((n) => {
            adj.set(n.id, []);
            inDegree.set(n.id, 0);
        });

        links.forEach((l) => {
            adj.get(l.source)?.push({target: l.target, reasoning: l.reasoning, type: l.type});
            inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
        });

        // Identify root(s)
        const roots = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);

        if (roots.length === 0) {
            console.warn('No root node found (cycle?)');
            return;
        }

        // Recursive function to build tree structure
        const buildTree = (nodeId: string, incomingReasoning?: string, incomingType?: string): TreeNode | null => {
            const node = nodeMap.get(nodeId);
            if (!node) return null;

            const children = adj
                .get(nodeId)
                ?.map((edge) => buildTree(edge.target, edge.reasoning, edge.type))
                .filter(Boolean) as TreeNode[];

            return {
                ...node,
                incomingReasoning: incomingReasoning || node.reasoning,
                incomingType: incomingType || node.action_name, // Use node's own name for root nodes
                children: children.length > 0 ? children : undefined,
                innerGraphData: (node as any).innerGraphData
            };
        };

        let rootNode: TreeNode | null = null;
        const isMultiRoot = roots.length > 1;

        if (isMultiRoot) {
            // Create a virtual root to hold all actual roots
            const children = roots.map((r) => buildTree(r.id)).filter(Boolean) as TreeNode[];
            rootNode = {
                id: 'virtual_root',
                cluster_score: [],
                average_score: 0,
                children: children
            };
        } else {
            rootNode = buildTree(roots[0].id);
        }

        if (!rootNode) return;

        // Apply collapse state to the tree structure BEFORE calculating layout
        const applyCollapseState = (node: TreeNode) => {
            if (collapsedNodes.has(node.id)) {
                // If it's collapsed, hide children
                if (node.children) {
                    node._children = node.children;
                    node.children = undefined;
                }
            } else {
                // If it's expanded, restore children
                if (node._children) {
                    node.children = node._children;
                    node._children = undefined;
                }
            }

            // Recursively apply to children
            if (node.children) {
                node.children.forEach(applyCollapseState);
            }
        };

        applyCollapseState(rootNode);

        // D3 Layout
        const root = d3.hierarchy<TreeNode>(rootNode);
        const treeLayout = d3
            .tree<TreeNode>()
            .nodeSize([500, 280])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

        treeLayout(root);

        const layerGap = 110;
        const depthMap = d3.group(root.descendants(), (node) => node.depth);
        const sortedDepths = Array.from(depthMap.keys()).sort((a, b) => a - b);

        sortedDepths.forEach((depth) => {
            const layerNodes = depthMap.get(depth) || [];
            const sortedLayerNodes = [...layerNodes].sort((a, b) => {
                const parentXDiff = (a.parent?.x || 0) - (b.parent?.x || 0);
                if (parentXDiff !== 0) return parentXDiff;
                return a.x - b.x;
            });

            let nextX = 0;
            sortedLayerNodes.forEach((node) => {
                const minX = node.parent ? node.parent.x : 0;
                const constrainedX = Math.max(minX, nextX);
                node.x = constrainedX;
                nextX = constrainedX + layerGap;
            });
        });

        setLayoutRoot(root);
    }, [dagData, collapsedNodes]);

    // 3. Setup Zoom
    useEffect(() => {
        if (!layoutRoot || !svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Initial Center with 30% scale down (scale factor 0.7)
        // Adjust the translate slightly if needed to keep it centered when scaled down
        const initialTransform = d3.zoomIdentity.translate(100, 80).scale(0.6);
        svg.call(zoom.transform, initialTransform);
    }, [layoutRoot]);

    const handleLinkMouseEnter = (event: React.MouseEvent, content: string) => {
        setTooltip({
            visible: true,
            x: event.clientX + 10,
            y: event.clientY + 10,
            content
        });
    };

    const handleLinkMouseMove = (event: React.MouseEvent) => {
        setTooltip((prev) => ({
            ...prev,
            x: event.clientX + 10,
            y: event.clientY + 10
        }));
    };

    const handleLinkMouseLeave = () => {
        setTooltip((prev) => ({...prev, visible: false}));
    };

    const createLinkPoints = (source: {x: number; y: number}, target: {x: number; y: number}, steps: number) => {
        const c1 = {x: (source.x + target.x) / 2, y: source.y};
        const c2 = {x: (source.x + target.x) / 2, y: target.y};
        return Array.from({length: steps + 1}, (_, index) => {
            const t = index / steps;
            const mt = 1 - t;
            const x = mt * mt * mt * source.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * target.x;
            const y = mt * mt * mt * source.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * target.y;
            return {x, y};
        });
    };

    const getNodeAverageScore = (node: TreeNode) => {
        const directScore = Number(node.average_score);
        if (Number.isFinite(directScore)) return directScore;
        if (!node.cluster_score || node.cluster_score.length === 0) return 0;
        const validScores = node.cluster_score
            .map((item) => Number(item.score))
            .filter((score) => Number.isFinite(score));
        if (validScores.length === 0) return 0;
        return validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    };

    const handleLinkClick = (event: React.MouseEvent, targetId: string) => {
        setCollapsedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(targetId)) {
                next.delete(targetId); // Expand
            } else {
                next.add(targetId); // Collapse
            }
            return next;
        });
    };

    return (
        <div className='ring-node-dag' style={{width: '100%', height: '100%', position: 'relative'}}>
            <svg ref={svgRef} width='100%' height='100%'>
                <defs>
                    <filter id='shadow' x='-50%' y='-50%' width='200%' height='200%'>
                        <feDropShadow dx='0' dy='2' stdDeviation='3' floodColor='#000000' floodOpacity='0.15' />
                    </filter>
                </defs>
                <g ref={gRef}>
                    {layoutRoot && (
                        <>
                            <g className='links'>
                                {layoutRoot.links().map((link, i) => {
                                    const R_NODE = 69; // Corresponds to the outermost radius of the glyph

                                    const p1 = {x: link.source.y, y: link.source.x};
                                    const p2 = {x: link.target.y, y: link.target.x};

                                    // Unified start and end points for a cleaner tree structure
                                    const newP1 = {x: p1.x + R_NODE, y: p1.y};
                                    const newP2 = {x: p2.x - R_NODE, y: p2.y};

                                    const d = d3
                                        .linkHorizontal()
                                        .x((d: any) => d.x)
                                        .y((d: any) => d.y)({
                                        source: newP1,
                                        target: newP2
                                    } as any);

                                    const targetNode = link.target.data as TreeNode;
                                    const sourceNode = link.source.data as TreeNode;
                                    const reasoning = targetNode.incomingReasoning || '';
                                    const type = targetNode.incomingType || '';
                                    const sourceScore = getNodeAverageScore(sourceNode);
                                    const targetScore = getNodeAverageScore(targetNode);
                                    const shouldEncode = link.source.depth > 0 && sourceNode.id !== 'virtual_root';
                                    const scoreDiff = targetScore - sourceScore;
                                    const epsilon = 1e-6;
                                    const isIncreasing = scoreDiff > epsilon;
                                    const isDecreasing = scoreDiff < -epsilon;
                                    const startWidth = isIncreasing ? 1.2 : isDecreasing ? 4 : 2.5;
                                    const endWidth = isIncreasing ? 4 : isDecreasing ? 1.2 : 2.5;
                                    const points = createLinkPoints(newP1, newP2, 18);

                                    return (
                                        <g key={i}>
                                            {shouldEncode ? (
                                                points.slice(0, -1).map((point, segmentIndex) => {
                                                    const nextPoint = points[segmentIndex + 1];
                                                    const ratio = (segmentIndex + 0.5) / (points.length - 1);
                                                    const strokeWidth = startWidth + (endWidth - startWidth) * ratio;
                                                    return (
                                                        <line
                                                            key={`seg-${segmentIndex}`}
                                                            x1={point.x}
                                                            y1={point.y}
                                                            x2={nextPoint.x}
                                                            y2={nextPoint.y}
                                                            stroke='#999'
                                                            strokeWidth={strokeWidth}
                                                            strokeLinecap='round'
                                                            markerEnd={
                                                                segmentIndex === points.length - 2
                                                                    ? 'url(#arrow-head)'
                                                                    : undefined
                                                            }
                                                        />
                                                    );
                                                })
                                            ) : (
                                                <path
                                                    d={d || ''}
                                                    fill='none'
                                                    stroke='#999'
                                                    strokeWidth={1.5}
                                                    markerEnd='url(#arrow-head)'
                                                />
                                            )}
                                            {/* Invisible wide path for hover interaction */}
                                            <path
                                                d={d || ''}
                                                fill='none'
                                                stroke='transparent'
                                                strokeWidth={15}
                                                style={{cursor: 'pointer'}}
                                                onMouseEnter={(e) => handleLinkMouseEnter(e, reasoning)}
                                                onMouseMove={handleLinkMouseMove}
                                                onMouseLeave={handleLinkMouseLeave}
                                                onClick={(e) => handleLinkClick(e, targetNode.id)}
                                            />
                                            {/* Text and background for type (e.g. split, merge) */}
                                            {type && (
                                                <g
                                                    transform={`translate(${(newP1.x + newP2.x) / 2}, ${(newP1.y + newP2.y) / 2})`}
                                                >
                                                    {/* Background rect for text */}
                                                    <rect
                                                        x={-25} // Adjust width based on expected text length
                                                        y={-10}
                                                        width={50}
                                                        height={20}
                                                        rx={10} // Rounded corners
                                                        ry={10}
                                                        fill='#f5f5f5' // Light gray background
                                                        stroke='#e0e0e0' // Optional subtle border
                                                        strokeWidth={1}
                                                    />
                                                    <text
                                                        dy='0.35em' // Center vertically relative to rect
                                                        textAnchor='middle'
                                                        fill='#666'
                                                        fontWeight='bold'
                                                        fontSize='12px' // Slightly smaller to fit nicely in rect
                                                        style={{pointerEvents: 'none'}} // Let hover pass through to the wide path
                                                    >
                                                        {type}
                                                    </text>
                                                </g>
                                            )}
                                        </g>
                                    );
                                })}
                            </g>
                            <g className='nodes'>
                                {layoutRoot.descendants().map((node, i) => (
                                    <g
                                        key={i}
                                        transform={`translate(${node.y},${node.x})`}
                                        style={{filter: 'url(#shadow)'}} // Apply shadow filter
                                    >
                                        {node.data.id === 'virtual_root' ? (
                                            <GreyGlyph />
                                        ) : (
                                            <RingNodeGlyph nodeData={node.data} refreshDag={loadData} />
                                        )}
                                    </g>
                                ))}
                            </g>
                        </>
                    )}
                </g>
            </svg>
            {tooltip.visible && (
                <div className='dag-tooltip' style={{top: tooltip.y, left: tooltip.x}}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default RingNodeDag;
