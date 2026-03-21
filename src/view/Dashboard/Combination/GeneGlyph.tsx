import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';

interface GeneGlyphProps {
    gene_name: string;
    log2FC: number;
    pval_adj: number;
    pts: number;
    pts_rest: number;
}

const GeneGlyph: React.FC<GeneGlyphProps> = ({gene_name, log2FC, pval_adj, pts, pts_rest}) => {
    const ref = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{visible: boolean; content: string; x: number; y: number}>({
        visible: false,
        content: '',
        x: 0,
        y: 0
    });
    const width = 100;
    const height = 100;
    const radius = Math.min(width, height) / 2 - 2; // Adjusted for labels

    useEffect(() => {
        if (!ref.current) return;

        const svg = d3.select(ref.current);
        svg.selectAll('*').remove(); // Clear previous render

        const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

        const features = ['pts', 'p_value', 'pts_rest', 'log2fc'];
        const originalData = {log2fc: log2FC, p_value: pval_adj, pts: pts, pts_rest: pts_rest};
        const pValueToNormalized = (pValue) => {
            if (pValue < 0.001) return 1;
            if (pValue < 0.01) return 2 / 3;
            if (pValue < 0.05) return 1 / 3;
            return 0;
        };

        const data = {
            log2fc: Math.max(0, Math.min(log2FC, 10)) / 10, // Normalize log2FC (0-10 range)
            p_value: pValueToNormalized(pval_adj),
            pts: pts,
            pts_rest: pts_rest
        };

        const angleSlice = (Math.PI * 2) / features.length;

        const centerCircleRadius = 20;

        // --- Draw Axes and Labels ---
        const axes = g.selectAll('.axis').data(features).enter().append('g').attr('class', 'axis');

        const axisStartRadius = radius / 3; // Innermost grid line
        const axisEndRadius = radius; // Outermost grid line

        axes.append('line')
            .attr('x1', (d, i) => axisStartRadius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y1', (d, i) => axisStartRadius * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('x2', (d, i) => axisEndRadius * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y2', (d, i) => axisEndRadius * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('stroke', 'black')
            .attr('stroke-width', '0.1px');

        // --- Draw Ticks ---
        axes.each(function (d, i) {
            const axis = d3.select(this);
            const axisLength = axisEndRadius - axisStartRadius;
            const angle = angleSlice * i - Math.PI / 2;
            const isHorizontal = Math.abs(Math.cos(angle)) > 0.9;

            // Ticks at 1/3 and 2/3 along the axis segment
            for (let j = 1; j <= 2; j++) {
                const tickRadius = axisStartRadius + (axisLength * j) / 3;
                axis.append('line')
                    .attr('x1', tickRadius * Math.cos(angle) - (isHorizontal ? 0 : 2))
                    .attr('y1', tickRadius * Math.sin(angle) - (isHorizontal ? 2 : 0))
                    .attr('x2', tickRadius * Math.cos(angle) + (isHorizontal ? 0 : 2))
                    .attr('y2', tickRadius * Math.sin(angle) + (isHorizontal ? 2 : 0))
                    .attr('stroke', 'black')
                    .attr('stroke-width', '0.5px');
            }
        });

        // --- Draw Spiderweb Grid ---
        for (let j = 1; j <= 3; j++) {
            // For 33% and 67%
            const level = radius * (j / 3);
            g.selectAll(`.grid-level-${j}`)
                .data(features)
                .enter()
                .append('line')
                .attr('class', `grid-level-${j}`)
                .attr('x1', (d, i) => level * Math.cos(angleSlice * i - Math.PI / 2))
                .attr('y1', (d, i) => level * Math.sin(angleSlice * i - Math.PI / 2))
                .attr('x2', (d, i) => level * Math.cos(angleSlice * (i + 1) - Math.PI / 2))
                .attr('y2', (d, i) => level * Math.sin(angleSlice * (i + 1) - Math.PI / 2))
                .attr('stroke', 'grey')
                .attr('stroke-width', '0.5px')
                .attr('stroke-dasharray', '2,2');
        }

        // --- Draw Outer Circle ---
        // g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', radius).attr('fill', 'none').attr('stroke', 'black');

        // --- Draw Data Shape ---
        const radarLine = d3
            .lineRadial<string>()
            .angle((d, i) => i * angleSlice)
            .radius((d) => {
                // Ensure the data line starts from the center circle boundary
                const value = data[d] * (radius - centerCircleRadius) + centerCircleRadius;
                return value;
            })
            .curve(d3.curveLinearClosed);

        g.append('path')
            .datum(features)
            .attr('d', radarLine)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5px');

        // --- Draw Center Circle and Text ---
        const diamondPoints: [number, number][] = [
            [0, -centerCircleRadius], // top
            [centerCircleRadius, 0], // right
            [0, centerCircleRadius], // bottom
            [-centerCircleRadius, 0] // left
        ];

        // g.append('path')
        //     .datum(diamondPoints)
        //     .attr('d', d3.line().curve(d3.curveLinearClosed))
        //     .attr('fill', 'none')
        //     .attr('stroke', 'black');

        g.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em').style('font-size', '7px').text(gene_name);

        // --- Interaction ---
        g.on('mouseover', () => {
            setTooltip((prev) => ({...prev, visible: true}));
        })
            .on('mousemove', (event) => {
                const [x, y] = d3.pointer(event, g.node());
                let angle = Math.atan2(y, x) + Math.PI / 2;
                if (angle < 0) angle += Math.PI * 2;
                const closestFeatureIndex = Math.round(angle / angleSlice) % features.length;
                const featureName = features[closestFeatureIndex];
                const featureValue = originalData[featureName];

                setTooltip({
                    visible: true,
                    content: `${featureName}: ${featureValue.toFixed(3)}`,
                    x: event.pageX + 10,
                    y: event.pageY - 10
                });
            })
            .on('mouseleave', () => {
                setTooltip((prev) => ({...prev, visible: false}));
            });
    }, [gene_name, log2FC, pval_adj, pts, pts_rest, radius]);

    return (
        <div className='glyph-container' style={{position: 'relative'}}>
            <svg ref={ref} width={width} height={height}></svg>
            {tooltip.visible && (
                <div
                    className='glyph-tooltip'
                    style={{
                        position: 'absolute',
                        pointerEvents: 'none',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '5px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        left: tooltip.x,
                        top: tooltip.y
                    }}
                >
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default GeneGlyph;
