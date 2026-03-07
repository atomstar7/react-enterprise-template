import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import {lineColor} from '@/constants/enum';

interface LineChartProps {
    data: {
        red: number;
        black: number;
    };
    width?: number | string;
    height: number;
}

const LineChart: React.FC<LineChartProps> = ({data, width = '100%', height}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Logical width for calculation (coordinate system)
        const logicalWidth = 100;

        // Scale for the peak value (0 to 1 mapped to 0 to logicalWidth)
        const xScale = d3.scaleLinear().domain([0, 1]).range([0, logicalWidth]);

        const drawSingleLine = (peakValue: number, color: string) => {
            const peakX = xScale(peakValue);
            const pathData = `M 0,0 L ${peakX},${height / 2} L 0,${height}`;

            svg.append('path')
                .attr('d', pathData)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 1.5)
                .attr('stroke-linejoin', 'round');
        };

        drawSingleLine(data.black, lineColor.log2fc);
        drawSingleLine(data.red, lineColor.p);
    }, [data, height]);

    return <svg ref={svgRef} width={width} height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio='none' />;
};

export default LineChart;
