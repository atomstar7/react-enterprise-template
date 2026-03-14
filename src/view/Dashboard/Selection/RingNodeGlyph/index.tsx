// @ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import InnerGraph from '../InnerGraph';
import {seriesColor} from '@/constants/enum';
import {Node} from '@/api/viewRequest';
import {cellStore} from '@/store/CellData';

interface RingNodeGlyphProps {
    nodeData: Node;
    refreshDag: () => void;
}

const RingNodeGlyph: React.FC<RingNodeGlyphProps> = ({nodeData}) => {
    const gRef = useRef(null);
    const [g, setG] = useState<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);
        setG(g);

        const innerRadius = 40;
        const outerRadius = 60;

        // Use seriesColor c1-cN based on the number of sectors
        const colors = Object.values(seriesColor);

        // Modified to color by index as per previous request
        const colorScale = d3.scaleOrdinal(colors);

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
            .attr('fill', (d, i) => colorScale(i.toString()));

        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', 'black');
        g.append('circle').attr('r', outerRadius).attr('fill', 'none').attr('stroke', 'black');

        // Add outer ring for average score
        const avgScoreOuterRadius = outerRadius + 9;
        const avgScoreArc = d3
            .arc()
            .innerRadius(outerRadius)
            .outerRadius(avgScoreOuterRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        const avgScore = nodeData.average_score || 0;
        const avgColorScale = d3
            .scaleLinear<string>()
            .domain([0, 1])
            .range([colors[0], colors[colors.length - 1]]);

        g.append('path').attr('d', avgScoreArc).attr('fill', avgColorScale(avgScore));

        return () => {
            g.selectAll('*').remove();
        };
    }, [nodeData]);

    const handleGlyphClick = () => {
        // Update the global selected_action_id in cellStore
        cellStore.setSelectedActionId(nodeData.id);
        // alert(`Selected Action ID updated to: ${nodeData.id}`);
    };

    return (
        <>
            <g ref={gRef} onClick={handleGlyphClick} style={{cursor: 'pointer'}}>
                {g && nodeData.innerGraphData && <InnerGraph g={g} data={nodeData.innerGraphData} />}
            </g>
        </>
    );
};

export default RingNodeGlyph;
