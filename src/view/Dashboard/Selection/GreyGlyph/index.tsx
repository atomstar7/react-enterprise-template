import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';

const GreyGlyph: React.FC = () => {
    const gRef = useRef(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);

        const innerRadius = 24;
        const outerRadius = 40;
        const avgScoreOuterRadius = outerRadius + 5;

        // Inner circle
        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', '#ccc');

        // Outer ring (the area for sectors in the other glyph)
        const mainArc = d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        g.append('path').attr('d', mainArc).attr('fill', '#f0f0f0');

        // Avg score ring
        const avgScoreArc = d3
            .arc()
            .innerRadius(outerRadius)
            .outerRadius(avgScoreOuterRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        g.append('path').attr('d', avgScoreArc).attr('fill', '#e0e0e0');

        // Outer border
        g.append('circle').attr('r', avgScoreOuterRadius).attr('fill', 'none').attr('stroke', '#ccc');

        // Add inner content for unclustered cells
        const unclusteredRadius = innerRadius - 10;
        g.append('circle').attr('r', unclusteredRadius).attr('fill', '#e0e0e0');

        // // Generate points within the unclustered circle
        // const numPoints = 15;
        // const pointRadius = 3;
        // const points = d3.range(numPoints).map(() => {
        //     const angle = Math.random() * 2 * Math.PI;
        //     const radius = Math.sqrt(Math.random()) * (unclusteredRadius - pointRadius);
        //     return {x: radius * Math.cos(angle), y: radius * Math.sin(angle)};
        // });

        // g.selectAll('.unclustered-point')
        //     .data(points)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'unclustered-point')
        //     .attr('cx', (d) => d.x)
        //     .attr('cy', (d) => d.y)
        //     .attr('r', pointRadius)
        //     .attr('fill', '#888');

        return () => {
            g.selectAll('*').remove();
        };
    }, []);

    return <g ref={gRef} />;
};

export default GreyGlyph;
