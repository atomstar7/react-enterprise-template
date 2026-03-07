import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {seriesColor} from '@/constants/enum';

interface BarChartProps {
    data: number[];
    width?: number | string;
    height: number;
}

const BarChart: React.FC<BarChartProps> = ({data, width = '100%', height}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Leave some empty space on the right so bars don't touch the edge
        const logicalWidth = 95;
        const xScale = d3
            .scaleBand()
            .domain(data.map((_, i) => i.toString()))
            .range([0, logicalWidth])
            .padding(0);

        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        // Map index to seriesColor keys
        const colors = Object.values(seriesColor);

        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', (_, i) => xScale(i.toString()) as number)
            .attr('y', (d) => yScale(d))
            .attr('width', xScale.bandwidth())
            .attr('height', (d) => height - yScale(d))
            .attr('fill', (_, i) => colors[i % colors.length]) // Cycle through colors if more than 10 bars
            .attr('stroke', 'none');

        // Add baseline
        svg.append('line')
            .attr('x1', 0)
            .attr('y1', height)
            .attr('x2', logicalWidth)
            .attr('y2', height)
            .attr('stroke', '#333')
            .attr('stroke-width', 1)
            .attr('vector-effect', 'non-scaling-stroke');
    }, [data, height]);

    return <svg ref={svgRef} width={width} height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio='none' />;
};

export default BarChart;
