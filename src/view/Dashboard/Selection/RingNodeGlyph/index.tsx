// @ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import InnerGraph from '../InnerGraph';
import {seriesColor} from '@/constants/enum';
import {Node} from '@/api/viewRequest';

interface RingNodeGlyphProps {
    nodeData: Node;
}

const RingNodeGlyph: React.FC<RingNodeGlyphProps> = ({nodeData}) => {
    const gRef = useRef(null);
    const [g, setG] = useState<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);
        setG(g);

        const innerRadius = 30;
        const outerRadius = 48;

        // Use seriesColor c1-cN based on the number of sectors
        const colors = Object.values(seriesColor);

        // Map f1-score (0-1) to colors (c1-c10)
        const getColorByF1Score = (score: number) => {
            const index = Math.floor(score * 10);
            return colors[Math.min(index, 9)]; // Ensure index doesn't exceed 9 (for score 1.0)
        };

        const pie = d3
            .pie<any>()
            .value((d: any) => d.count)
            .padAngle(0.05);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

        // Check if cluster_score exists before using it
        const clusterScores = nodeData.cluster_score || [];

        const arcs = g.selectAll('.arc').data(pie(clusterScores)).enter().append('g').attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc as any)
            .attr('fill', (d) => getColorByF1Score(d.data.score));

        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', 'black');
        g.append('circle').attr('r', outerRadius).attr('fill', 'none').attr('stroke', 'black');

        const averageF1Score = nodeData.average_score || 0;

        const radiusScale = d3.scaleLinear().domain([0, 1]).range([innerRadius, outerRadius]);
        const scoreRadius = radiusScale(averageF1Score);
        g.append('circle').attr('r', scoreRadius).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', 2);

        return () => {
            g.selectAll('*').remove();
        };
    }, [nodeData]);

    return <g ref={gRef}>{g && <InnerGraph g={g} radius={30} nodeCount={(nodeData.cluster_score || []).length} />}</g>;
};

export default RingNodeGlyph;
