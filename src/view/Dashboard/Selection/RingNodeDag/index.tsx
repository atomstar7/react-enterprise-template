// @ts-nocheck
import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import RingNodeGlyph from '../RingNodeGlyph';
import {seriesColor} from '@/constants/enum';
import './index.less';

const Legend = () => {
    const colors = Object.values(seriesColor);

    return (
        <g transform='translate(20, 20)'>
            {colors.slice(0, 10).map((color, i) => (
                <rect key={color} x={i * 15} y={0} width={15} height={20} fill={color} />
            ))}
            <text x='0' y='35' fontSize='12' fill='#333'>
                0.0
            </text>
            <text x={10 * 15} y='35' fontSize='12' fill='#333' textAnchor='end'>
                1.0
            </text>
        </g>
    );
};

const dagData = {
    nodes: [
        {
            id: 'root',
            x: 50,
            y: 300,
            label: '',
            type: 'root',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.5'},
                    {count: 1, 'f1-score': '0.2'}
                ]
            }
        },
        {
            id: '1',
            x: 250,
            y: 150,
            label: '1',
            type: 'U',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.1'},
                    {count: 2, 'f1-score': '0.2'},
                    {count: 1, 'f1-score': '0.8'},
                    {count: 2, 'f1-score': '0.6'},
                    {count: 1, 'f1-score': '0.9'}
                ]
            }
        },
        {
            id: '2',
            x: 450,
            y: 150,
            label: '2',
            type: 'S',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.3'},
                    {count: 3, 'f1-score': '0.4'},
                    {count: 4, 'f1-score': '0.9'},
                    {count: 2, 'f1-score': '0.5'}
                ]
            }
        },
        {
            id: '3',
            x: 650,
            y: 150,
            label: '3',
            type: 'U',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.5'},
                    {count: 2, 'f1-score': '0.6'},
                    {count: 2, 'f1-score': '0.1'},
                    {count: 1, 'f1-score': '0.8'}
                ]
            }
        },
        {
            id: '4',
            x: 850,
            y: 150,
            label: '4',
            type: 'S',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.7'},
                    {count: 2, 'f1-score': '0.8'},
                    {count: 1, 'f1-score': '0.95'}
                ]
            }
        },
        {
            id: '5',
            x: 250,
            y: 300,
            label: '5',
            type: 'S',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.85'},
                    {count: 1, 'f1-score': '0.9'},
                    {count: 3, 'f1-score': '0.92'}
                ]
            }
        },
        {
            id: '6',
            x: 450,
            y: 300,
            label: '6',
            type: 'S',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.9'},
                    {count: 1, 'f1-score': '0.95'},
                    {count: 1, 'f1-score': '1.0'}
                ]
            }
        },
        {
            id: '7',
            x: 650,
            y: 300,
            label: '7',
            type: 'U',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.2'},
                    {count: 1, 'f1-score': '0.9'},
                    {count: 1, 'f1-score': '0.98'}
                ]
            }
        },
        {
            id: '8',
            x: 850,
            y: 300,
            label: '8',
            type: 'M',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.4'},
                    {count: 1, 'f1-score': '0.5'},
                    {count: 1, 'f1-score': '0.6'}
                ]
            }
        },
        {
            id: '9',
            x: 250,
            y: 450,
            label: '9',
            type: 'S',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.9'},
                    {count: 1, 'f1-score': '0.9'},
                    {count: 1, 'f1-score': '0.9'}
                ]
            }
        },
        {
            id: '10',
            x: 450,
            y: 450,
            label: '10',
            type: 'U',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.1'},
                    {count: 1, 'f1-score': '0.95'},
                    {count: 1, 'f1-score': '0.95'}
                ]
            }
        },
        {
            id: '11',
            x: 650,
            y: 450,
            label: '11',
            type: 'M',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.7'},
                    {count: 1, 'f1-score': '0.7'},
                    {count: 1, 'f1-score': '0.7'}
                ]
            }
        },
        {
            id: '12',
            x: 850,
            y: 450,
            label: '12',
            type: 'U',
            data: {
                'cluster-score': [
                    {count: 1, 'f1-score': '0.3'},
                    {count: 1, 'f1-score': '0.3'},
                    {count: 1, 'f1-score': '0.3'}
                ]
            }
        }
    ],
    links: [
        {source: 'root', target: '1', style: 'solid'},
        {source: '1', target: '2', style: 'solid'},
        {source: '2', target: '3', style: 'solid'},
        {source: '3', target: '4', style: 'solid'},
        {source: 'root', target: '5', style: 'solid'},
        {source: '5', target: '6', style: 'solid'},
        {source: '6', target: '7', style: 'solid'},
        {source: '7', target: '8', style: 'solid'},
        {source: 'root', target: '9', style: 'solid'},
        {source: '9', target: '10', style: 'solid'},
        {source: '10', target: '11', style: 'solid'},
        {source: '11', target: '12', style: 'solid'},
        {source: '1', target: '7', style: 'dashed'},
        {source: '5', target: '10', style: 'dashed'}
    ]
};

const RingNodeDag = () => {
    const svgRef = useRef(null);
    const gRef = useRef(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);

        const zoom = d3.zoom().on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

        svg.call(zoom);

        // Set initial transform
        const initialTransform = d3.zoomIdentity.translate(50, -100);
        svg.call(zoom.transform, initialTransform);
    }, []);

    const nodeMap = new Map(dagData.nodes.map((node) => [node.id, node]));

    const processedLinks = dagData.links.map((link) => ({
        source: nodeMap.get(link.source),
        target: nodeMap.get(link.target),
        style: link.style
    }));

    return (
        <svg ref={svgRef} width='100%' height='100%' className='ring-node-dag'>
            <defs>
                <marker
                    id='arrow'
                    viewBox='0 -5 10 10'
                    refX={58}
                    refY={0}
                    markerWidth={6}
                    markerHeight={6}
                    orient='auto'
                >
                    <path d='M0,-5L10,0L0,5' fill='#999' />
                </marker>
            </defs>
            <Legend />
            <g ref={gRef}>
                <g className='links'>
                    {processedLinks.map((link, i) => (
                        <line
                            key={i}
                            x1={link.source.x}
                            y1={link.source.y}
                            x2={link.target.x}
                            y2={link.target.y}
                            stroke='#999'
                            strokeDasharray={link.style === 'dashed' ? '5,5' : 'none'}
                            markerEnd='url(#arrow)'
                        />
                    ))}
                </g>
                <g className='nodes'>
                    {dagData.nodes.map((node) => (
                        <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                            <text x='-55' y='-55' textAnchor='middle' fontSize='14'>
                                {node.label}
                            </text>
                            <RingNodeGlyph nodeData={node} />
                        </g>
                    ))}
                </g>
            </g>
        </svg>
    );
};

export default RingNodeDag;
