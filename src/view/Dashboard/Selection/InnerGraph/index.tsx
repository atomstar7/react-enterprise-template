import React, {useEffect} from 'react';
import * as d3 from 'd3';

interface InnerGraphProps {
    g: d3.Selection<SVGGElement, unknown, null, undefined>;
    radius: number;
    nodeCount: number;
}

const InnerGraph: React.FC<InnerGraphProps> = ({g, radius, nodeCount}) => {
    useEffect(() => {
        const nodes = Array.from({length: nodeCount}, (_, i) => ({id: i + 1}));
        const links = [];
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                links.push({source: i + 1, target: j + 1});
            }
        }
        const graph = {nodes, links};

        const simulation = d3
            .forceSimulation(graph.nodes as any)
            .force(
                'link',
                d3.forceLink(graph.links).id((d: any) => d.id)
            )
            .force('charge', d3.forceManyBody().strength(-60))
            .force('center', d3.forceCenter(0, 0))
            .force('radial', d3.forceRadial(radius - 6));

        const link = g
            .append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graph.links)
            .enter()
            .append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6);

        const node = g
            .append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(graph.nodes)
            .enter()
            .append('circle')
            .attr('r', 6)
            .attr('fill', '#ccc');

        simulation.on('tick', () => {
            link.attr('x1', (d: any) => d.source.x)
                .attr('y1', (d: any) => d.source.y)
                .attr('x2', (d: any) => d.target.x)
                .attr('y2', (d: any) => d.target.y);

            node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
        });

        return () => {
            simulation.stop();
        };
    }, [g, radius]);

    return null;
};

export default InnerGraph;
