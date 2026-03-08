// @ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {fetchDagData, DagData, Node} from '@/api/viewRequest';
import RingNodeGlyph from '../RingNodeGlyph';
import {seriesColor} from '@/constants/enum';
import './index.less';

// Wrapper for D3 hierarchy to include incoming edge info
interface TreeNode extends Node {
    children?: TreeNode[];
    incomingReasoning?: string;
}

const Legend = () => {
    // The image shows a gradient from light purple/pink to dark blue
    // and labels <0.8, 0.96, 1
    // seriesColor has c1..c12
    const colors = Object.values(seriesColor);

    // Create a gradient definition
    // Since seriesColor is discrete steps, we can simulate gradient with multiple rects or a linearGradient
    // Let's use a linearGradient in defs and a rect to display it

    return (
        <g transform='translate(20, 20)'>
            <defs>
                <linearGradient id='legendGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
                    {/* Map the series colors to the gradient stops */}
                    {colors.map((color, i) => (
                        <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
                    ))}
                </linearGradient>
            </defs>
            <rect x='0' y='0' width='150' height='20' fill='url(#legendGradient)' />
            <text x='0' y='35' fontSize='14' fontWeight='bold' fill='#000' textAnchor='start'>
                &lt;0.8
            </text>
            <text x='75' y='35' fontSize='14' fontWeight='bold' fill='#000' textAnchor='middle'>
                0.96
            </text>
            <text x='150' y='35' fontSize='14' fontWeight='bold' fill='#000' textAnchor='end'>
                1
            </text>
        </g>
    );
};

const RingNodeDag = () => {
    const [dagData, setDagData] = useState<DagData | null>(null);
    const [layoutRoot, setLayoutRoot] = useState<d3.HierarchyPointNode<TreeNode> | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const gRef = useRef<SVGGElement>(null);

    // 1. Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = (await fetchDagData()).data;
                if (response.data) {
                    setDagData(response.data);
                }
            } catch (err: any) {
                console.error('Failed to fetch DAG data:', err);
            }
        };

        loadData();
    }, []);

    // 2. Process Data & Calculate Layout
    useEffect(() => {
        if (!dagData) return;
        const {nodes, links} = dagData;
        if (nodes.length === 0) return;

        // Map for quick lookup
        const nodeMap = new Map<string, Node>(nodes.map((n) => [n.id, n]));

        // Build adjacency list
        const adj = new Map<string, {target: string; reasoning: string}[]>();
        const inDegree = new Map<string, number>();

        nodes.forEach((n) => {
            adj.set(n.id, []);
            inDegree.set(n.id, 0);
        });

        links.forEach((l) => {
            // adj.get(l.source)?.push({target: l.target, reasoning: l.reasoning});
            adj.get(l.source)?.push({target: l.target, reasoning: l.type});
            inDegree.set(l.target, (inDegree.get(l.target) || 0) + 1);
        });

        // Identify root(s)
        const roots = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);

        if (roots.length === 0) {
            console.warn('No root node found (cycle?)');
            return;
        }

        // Recursive function to build tree structure
        const buildTree = (nodeId: string, incomingReasoning?: string): TreeNode | null => {
            const node = nodeMap.get(nodeId);
            if (!node) return null;

            const children = adj
                .get(nodeId)
                ?.map((edge) => buildTree(edge.target, edge.reasoning))
                .filter(Boolean) as TreeNode[];

            return {
                ...node,
                incomingReasoning,
                children: children.length > 0 ? children : undefined
            };
        };

        const rootNode = buildTree(roots[0].id);
        if (!rootNode) return;

        // D3 Layout
        const root = d3.hierarchy<TreeNode>(rootNode);

        // Node size: [height, width] -> corresponds to [y-spacing, x-spacing] in vertical layout
        // But since we swap x/y for horizontal layout, we need to think:
        // d3.tree outputs x (vertical in our case) and y (horizontal in our case).
        // So nodeSize([height, width]) means spacing in vertical (x) and horizontal (y).
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
    }, [layoutRoot]);

    return (
        <svg ref={svgRef} width='100%' height='100%' className='ring-node-dag'>
            <defs>
                <marker
                    id='arrow-head'
                    viewBox='0 -5 10 10'
                    refX={48} // Offset to clear the node radius (approx 48)
                    refY={0}
                    markerWidth={6}
                    markerHeight={6}
                    orient='auto'
                >
                    <path d='M0,-5L10,0L0,5' fill='#999' />
                </marker>
            </defs>
            {/* Render Legend Fixed at top-left, unaffected by zoom */}
            <Legend />
            <g ref={gRef}>
                {layoutRoot && (
                    <>
                        <g className='links'>
                            {layoutRoot.links().map((link, i) => {
                                const d = d3
                                    .linkHorizontal()
                                    .x((d: any) => d.y)
                                    .y((d: any) => d.x)(link as any);
                                return (
                                    <g key={i}>
                                        <path
                                            d={d || ''}
                                            fill='none'
                                            stroke='#999'
                                            strokeWidth={1.5}
                                            markerEnd='url(#arrow-head)'
                                        />
                                        <text
                                            x={(link.source.y + link.target.y) / 2}
                                            y={(link.source.x + link.target.x) / 2 - 10}
                                            textAnchor='middle'
                                            fill='#666'
                                            fontWeight='bold'
                                            fontSize='14px'
                                        >
                                            {(link.target.data as TreeNode).incomingReasoning}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                        <g className='nodes'>
                            {layoutRoot.descendants().map((node, i) => (
                                <g key={i} transform={`translate(${node.y},${node.x})`}>
                                    <RingNodeGlyph nodeData={node.data} />
                                </g>
                            ))}
                        </g>
                    </>
                )}
            </g>
        </svg>
    );
};

export default RingNodeDag;
