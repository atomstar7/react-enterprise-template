import React from 'react';

interface F1ScoreGlyphProps {
    score: number;
}

const F1ScoreGlyph: React.FC<F1ScoreGlyphProps> = ({score}) => {
    const size = 60;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - score * circumference;

    const formattedScore = score.toFixed(2);

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke='#e6e6e6' strokeWidth={strokeWidth} />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill='none'
                stroke='#5F92B6'
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap='butt'
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
            <text x='50%' y='50%' textAnchor='middle' dy='.3em' fontSize='14' fontWeight='bold'>
                {formattedScore}
            </text>
        </svg>
    );
};

export default F1ScoreGlyph;
