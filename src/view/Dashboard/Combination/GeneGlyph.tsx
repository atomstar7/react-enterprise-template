import React from 'react';

interface GeneGlyphProps {
    gene_name: string;
    log2FC: number;
    pval_adj: number;
    pts: number;
    pts_rest: number;
}

const GeneGlyph: React.FC<GeneGlyphProps> = ({gene_name, log2FC, pval_adj, pts, pts_rest}) => {
    const width = 120;
    const height = 60;
    const strokeWidth = 1;
    const barWidth = 12;

    const contentHeight = height - strokeWidth * 2;
    const ptsHeight = contentHeight * pts;
    const ptsRestHeight = contentHeight * pts_rest;

    // Vertical positioning: Center elements within their allocated vertical space
    const trianglesY = height * 0.125; // Center of top 25%
    const geneNameY = height * 0.5; // Center of middle 50%
    const starsY = height * 0.875; // Center of bottom 25%

    const trianglePath = 'M 0 -3 L 3 3 L -3 3 Z';
    const starPath =
        'M 0 -4 L 0.94 -1.23 L 3.8 -1.23 L 1.43 0.47 L 2.35 3.24 L 0 1.5 L -2.35 3.24 L -1.43 0.47 L -3.8 -1.23 L -0.94 -1.23 Z';

    const renderTriangles = () => {
        const triangles = [];
        let count = 0;
        if (log2FC > 5) count = 3;
        else if (log2FC > 2) count = 2;
        else if (log2FC > 1) count = 1;

        for (let i = 0; i < count; i++) {
            triangles.push(
                <path
                    key={i}
                    d={trianglePath}
                    fill='#333'
                    transform={`translate(${width / 2 - (count - 1) * 5 + i * 10}, ${trianglesY}) scale(1.2)`}
                />
            );
        }
        return triangles;
    };

    const renderStars = () => {
        const stars = [];
        let count = 0;
        if (pval_adj < 0.001) count = 3;
        else if (pval_adj < 0.01) count = 2;
        else if (pval_adj < 0.05) count = 1;

        for (let i = 0; i < count; i++) {
            stars.push(
                <path
                    key={i}
                    d={starPath}
                    fill='#333'
                    transform={`translate(${width / 2 - (count - 1) * 6 + i * 12}, ${starsY}) scale(1)`}
                />
            );
        }
        return stars;
    };

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Main container */}
            <rect
                x={strokeWidth / 2}
                y={strokeWidth / 2}
                width={width - strokeWidth}
                height={height - strokeWidth}
                fill='white'
                stroke='#333'
                strokeWidth={strokeWidth}
            />

            {/* Left bar (pts) */}
            <rect
                x={strokeWidth}
                y={height - strokeWidth - ptsHeight}
                width={barWidth}
                height={ptsHeight}
                fill='#6DD47E'
            />

            {/* Right bar (pts_rest) */}
            <rect
                x={width - barWidth - strokeWidth}
                y={height - strokeWidth - ptsRestHeight}
                width={barWidth}
                height={ptsRestHeight}
                fill='#E65555'
            />

            {/* Gene Name */}
            <text
                x={width / 2}
                y={geneNameY}
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize='0.8rem'
                fontWeight='500'
            >
                {gene_name}
            </text>

            {/* Triangles for log2FC */}
            <g>{renderTriangles()}</g>

            {/* Stars for pval_adj */}
            <g>{renderStars()}</g>

            {/* Vertical dividers */}
            <line
                x1={barWidth + strokeWidth}
                y1={strokeWidth}
                x2={barWidth + strokeWidth}
                y2={height - strokeWidth}
                stroke='#333'
                strokeWidth={strokeWidth}
            />
            <line
                x1={width - barWidth - strokeWidth}
                y1={strokeWidth}
                x2={width - barWidth - strokeWidth}
                y2={height - strokeWidth}
                stroke='#333'
                strokeWidth={strokeWidth}
            />
        </svg>
    );
};

export default GeneGlyph;
