// @ts-nocheck
import React, {useEffect, useRef, useState, useCallback} from 'react';
import * as d3 from 'd3';
import {DagData, Node} from '@/api/viewRequest';
import RingNodeGlyph from '../RingNodeGlyph';
import GreyGlyph from '../GreyGlyph';
import Embedding from '../../Embedding';

import './index.less';
import actions from '@/store/index';
import {convertActionsToDagData} from '@/utils/dagConverter';

// Wrapper for D3 hierarchy to include incoming edge info
interface TreeNode extends Node {
    children?: TreeNode[];
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
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);

    const loadData = useCallback(async () => {
        try {
            // Use local actions data instead of fetching
            // const response = (await fetchDagData()).data;
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

        // D3 Layout
        const root = d3.hierarchy<TreeNode>(rootNode);
        const treeLayout = d3
            .tree<TreeNode>()
            .nodeSize([150, 250])
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));

        treeLayout(root);

        setLayoutRoot(root);
    }, [dagData]);

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

        // Initial Center
        const initialTransform = d3.zoomIdentity.translate(100, svgRef.current.clientHeight / 2);
        svg.call(zoom.transform, initialTransform);
    }, [layoutRoot]); // layoutRoot dependency ensures zoom is re-applied/reset on data update?
    // Ideally we might want to PRESERVE zoom on update.
    // If we want to preserve zoom, we shouldn't re-create the zoom behavior or reset transform in this effect if g already has transform.
    // But since layoutRoot changes completely, a reset might be safer unless node positions are stable.
    // For now, let's keep it simple: it resets view on data update.

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

    return (
        <div className='ring-node-dag' style={{width: '100%', height: '100%', position: 'relative'}}>
            <svg ref={svgRef} width='100%' height='100%'>
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
                                    const reasoning = targetNode.incomingReasoning || '';
                                    const type = targetNode.incomingType || '';

                                    return (
                                        <g key={i}>
                                            {/* Visible path */}
                                            <path
                                                d={d || ''}
                                                fill='none'
                                                stroke='#999'
                                                strokeWidth={1.5}
                                                markerEnd='url(#arrow-head)'
                                            />
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
                                            />
                                            <text
                                                x={(newP1.x + newP2.x) / 2}
                                                y={(newP1.y + newP2.y) / 2 - 10}
                                                textAnchor='middle'
                                                fill='#666'
                                                fontWeight='bold'
                                                fontSize='14px'
                                                style={{pointerEvents: 'none'}} // Let hover pass through to the wide path
                                            >
                                                {type}
                                            </text>
                                        </g>
                                    );
                                })}
                            </g>
                            <g className='nodes'>
                                {layoutRoot.descendants().map((node, i) => (
                                    <g key={i} transform={`translate(${node.y},${node.x})`}>
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
            {/* <div className='embedding-container'>
                <Embedding />
            </div> */}
        </div>
    );
};

export default RingNodeDag;
