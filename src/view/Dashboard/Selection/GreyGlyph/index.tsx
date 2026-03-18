import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';

const GreyGlyph: React.FC = () => {
    const gRef = useRef(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);

        const innerRadius = 40;
        const outerRadius = 60;
        const avgScoreOuterRadius = outerRadius + 9;

        // Inner circle
        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', '#ccc');

        // Outer ring (the area for sectors in the other glyph)
        const mainArc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius).startAngle(0).endAngle(2 * Math.PI);
        g.append('path').attr('d', mainArc).attr('fill', '#f0f0f0');

        // Avg score ring
        const avgScoreArc = d3.arc().innerRadius(outerRadius).outerRadius(avgScoreOuterRadius).startAngle(0).endAngle(2 * Math.PI);
        g.append('path').attr('d', avgScoreArc).attr('fill', '#e0e0e0');

        // Outer border
        g.append('circle').attr('r', avgScoreOuterRadius).attr('fill', 'none').attr('stroke', '#ccc');

        return () => {
            g.selectAll('*').remove();
        };
    }, []);

    return <g ref={gRef} />;
};

export default GreyGlyph;
