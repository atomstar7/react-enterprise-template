import React, {useEffect} from 'react';
import * as d3 from 'd3';

import {clusterColorStore} from '@/store/colorMapping';

interface InnerGraphData {
    nodes: {id: number; x: number; y: number; category: string}[];
    links: {source: number; target: number}[];
}

interface InnerGraphProps {
    g: d3.Selection<SVGGElement, unknown, null, undefined>;
    data: InnerGraphData;
}

const InnerGraph: React.FC<InnerGraphProps> = ({g, data}) => {
    useEffect(() => {
        if (!data || !g) return;

        // Container for the inner graph to avoid touching other elements in g
        const innerG = g.append('g').attr('class', 'inner-graph-container');

        const {nodes, links} = data;

        // Create a map for quick node lookup
        const nodeMap = new Map(nodes.map((n) => [n.id, n]));

        innerG
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('x1', (d: any) => nodeMap.get(d.source)?.x || 0)
            .attr('y1', (d: any) => nodeMap.get(d.source)?.y || 0)
            .attr('x2', (d: any) => nodeMap.get(d.target)?.x || 0)
            .attr('y2', (d: any) => nodeMap.get(d.target)?.y || 0);

        innerG
            .append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('r', 3)
            .attr('fill', (d: any) => clusterColorStore.getColor(d.category))
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y);

        return () => {
            // Cleanup only the inner graph
            innerG.remove();
        };
    }, [g, data]);

    return null;
};

export default InnerGraph;
