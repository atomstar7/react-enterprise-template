import React from 'react';

interface GeneGlyphProps {
    name: string;
    log2FC: number;
    pVal: number;
    pts: number;
}

const GeneGlyph: React.FC<GeneGlyphProps> = ({name, log2FC, pVal, pts}) => {
    const width = 100;
    const height = 60;
    const strokeWidth = 1.5;

    const headerY = 5;
    const headerHeight = 15;
    const headerWidth = 90;
    const headerX = 5;

    const boxWidth = headerWidth / 4;
    const boxes = [
        {id: 1, cx: headerX + boxWidth * 0.5},
        {id: 2, cx: headerX + boxWidth * 1.5},
        {id: 3, cx: headerX + boxWidth * 2.5},
        {id: 4, cx: headerX + boxWidth * 3.5}
    ];
    const symbolCenterY = headerY + headerHeight / 2;

    const fillColor = '#5F92B6';
    const fillWidth = pts * headerWidth;
    const fillStartX = headerX + headerWidth / 2 - fillWidth / 2;

    const starPath =
        'M 0 -5 L 1.18 -1.54 L 4.76 -1.54 L 1.91 0.59 L 3.09 4.05 L 0 2.5 L -3.09 4.05 L -1.91 0.59 L -4.76 -1.54 L -1.18 -1.54 Z';
    const symbolColor = '#044777ff';

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <rect x={fillStartX} y={headerY} width={fillWidth} height={headerHeight} fill={fillColor} />

            {log2FC > 5 ? (
                <path
                    d={`M ${boxes[0].cx},${symbolCenterY - 4} L ${boxes[0].cx - 4},${symbolCenterY + 4} L ${boxes[0].cx + 4},${symbolCenterY + 4} Z`}
                    fill={symbolColor}
                />
            ) : log2FC > 1 ? (
                <path
                    d={`M ${boxes[1].cx},${symbolCenterY - 4} L ${boxes[1].cx - 4},${symbolCenterY + 4} L ${boxes[1].cx + 4},${symbolCenterY + 4} Z`}
                    fill={symbolColor}
                />
            ) : null}

            {pVal < 0.001 ? (
                <path
                    d={starPath}
                    fill={symbolColor}
                    transform={`translate(${boxes[2].cx}, ${symbolCenterY}) scale(0.9)`}
                />
            ) : pVal < 0.01 ? (
                <path
                    d={starPath}
                    fill={symbolColor}
                    transform={`translate(${boxes[3].cx}, ${symbolCenterY}) scale(0.9)`}
                />
            ) : null}

            <rect
                x={headerX}
                y={headerY}
                width={headerWidth}
                height={height - 10}
                fill='none'
                stroke='#333'
                strokeWidth={strokeWidth}
            />
            <line
                x1={headerX}
                y1={headerY + headerHeight}
                x2={headerX + headerWidth}
                y2={headerY + headerHeight}
                stroke='#333'
                strokeWidth={strokeWidth}
            />
            <line
                x1={boxes[0].cx + boxWidth / 2}
                y1={headerY}
                x2={boxes[0].cx + boxWidth / 2}
                y2={headerY + headerHeight}
                stroke='#333'
                strokeWidth={strokeWidth}
            />
            <line
                x1={boxes[1].cx + boxWidth / 2}
                y1={headerY}
                x2={boxes[1].cx + boxWidth / 2}
                y2={headerY + headerHeight}
                stroke='#333'
                strokeWidth={strokeWidth}
            />
            <line
                x1={boxes[2].cx + boxWidth / 2}
                y1={headerY}
                x2={boxes[2].cx + boxWidth / 2}
                y2={headerY + headerHeight}
                stroke='#333'
                strokeWidth={strokeWidth}
            />

            <text x={width / 2} y='37.5' textAnchor='middle' fontSize='16' dominantBaseline='middle'>
                {name.substring(0, 6)}
            </text>
        </svg>
    );
};

export default GeneGlyph;
