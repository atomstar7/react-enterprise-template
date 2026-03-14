import React, {useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {Table, Checkbox, Progress} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import './index.less';
import actions from '@/store/index';
import {convertActionsToCombinationData, Combination} from '@/utils/combinationConverter';
import {cellStore} from '@/store/CellData';

// const UpTriangleBorder = ({children}: {children: React.ReactNode}) => (
//     <div style={{position: 'relative', display: 'inline-block', padding: '4px 8px'}}>
//         <svg
//             width='100%'
//             height='100%'
//             style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}
//             viewBox='0 0 100 100'
//             preserveAspectRatio='none'
//         >
//             {/* Top-left triangle */}
//             <path d='M10,0 L0,10 L0,0 Z' fill='none' stroke='black' strokeWidth='2' />
//             {/* Border lines leaving gap for triangle */}
//             <path d='M10,0 L100,0 L100,100 L0,100 L0,10' fill='none' stroke='black' strokeWidth='2' />
//         </svg>
//         {children}
//     </div>
// );

// const DownTriangleBorder = ({children}: {children: React.ReactNode}) => (
//     <div style={{position: 'relative', display: 'inline-block', padding: '4px 8px'}}>
//         <svg
//             width='100%'
//             height='100%'
//             style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}
//             viewBox='0 0 100 100'
//             preserveAspectRatio='none'
//         >
//             {/* Top-left triangle pointing down */}
//             <path d='M0,0 L10,0 L5,8 Z' fill='none' stroke='black' strokeWidth='2' />
//             {/* Border lines */}
//             <path d='M10,0 L100,0 L100,100 L0,100 L0,0' fill='none' stroke='black' strokeWidth='2' />
//         </svg>
//         {children}
//     </div>
// );

// Simplified Border Components using standard CSS/SVG combination for better responsiveness
const ScientificNotation = ({value}: {value: number}) => {
    const exponential = value.toExponential(2);
    const [base, exponent] = exponential.split('e');
    return (
        <span>
            {base}×10<sup>{parseInt(exponent)}</sup>
        </span>
    );
};

const ValueBorder = ({value, children}: {value: number; children: React.ReactNode}) => {
    const isUp = value >= 1;
    const outerBorderColor = '#999'; // Lighter color for outer border
    const innerBorderColor = '#555'; // Slightly darker for inner triangle border

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
                padding: '2px', // Space for outer border
                border: `1px solid ${outerBorderColor}`,
                borderRadius: '3px',
                width: '64px', // Fixed width to match PValBorder
                textAlign: 'center',
                backgroundColor: 'white'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    padding: '2px 0', // Reduced horizontal padding to fit fixed width
                    border: `2px solid ${outerBorderColor}`,
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '24px' // Fixed height for consistency
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '-7px',
                        left: '-4px',
                        width: '14px',
                        height: '14px',
                        backgroundColor: 'white', // Mask the border behind
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                    }}
                >
                    <svg width='12' height='12' viewBox='0 0 12 12'>
                        {isUp ? (
                            // Up triangle
                            <path d='M6 2 L10 10 L2 10 Z' fill='none' stroke={innerBorderColor} strokeWidth='1.5' />
                        ) : (
                            // Down triangle
                            <path d='M2 2 L10 2 L6 10 Z' fill='none' stroke={innerBorderColor} strokeWidth='1.5' />
                        )}
                    </svg>
                </div>
                {children}
            </div>
        </div>
    );
};

const PValBorder = ({value, children}: {value: number; children: React.ReactNode}) => {
    const isSignificant = value < 0.05;
    const outerBorderColor = '#999';
    const innerBorderColor = '#555';

    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
                padding: '2px',
                border: `1px solid ${outerBorderColor}`,
                borderRadius: '3px',
                width: '64px', // Fixed width to match ValueBorder
                textAlign: 'center',
                backgroundColor: 'white'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    padding: '2px 0', // Reduced horizontal padding
                    border: `2px solid ${outerBorderColor}`,
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '24px' // Fixed height for consistency
                }}
            >
                {isSignificant && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '-7px',
                            left: '-4px',
                            width: '14px',
                            height: '14px',
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                        }}
                    >
                        <span style={{color: innerBorderColor, fontSize: '14px', lineHeight: 1, fontWeight: 'bold'}}>
                            *
                        </span>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

const CombinationView = observer(() => {
    const allData = useMemo(() => convertActionsToCombinationData(actions as any), []);

    const filteredData = useMemo(() => {
        const selectedId = cellStore.selected_action_id;
        if (!selectedId) return [];
        // Filter combinations where ID starts with the selected action ID
        // The ID format in converter is `${action.action_id}-${clusterId}`
        return allData.filter((item) => item.id.startsWith(`${selectedId}-`));
    }, [allData, cellStore.selected_action_id]);

    // Parent Table Columns (Cluster, Marker Table, F1_Score)
    const columns: ColumnsType<Combination> = [
        {
            title: 'Cluster',
            dataIndex: 'id',
            key: 'id',
            className: 'cluster-column',
            width: '15%',
            align: 'center',
            render: (text) => {
                // Extract cluster ID from composite ID (action_id-clusterId)
                const parts = text.split('-');
                return parts.length > 1 ? `#${parts[parts.length - 1]}` : text;
            }
        },
        {
            title: 'Marker genes',
            className: 'marker-group-header',
            width: '70%', // Sum of nested columns (25+15+15+15)
            children: [
                {
                    title: (
                        <div className='marker-nested-header'>
                            <div style={{width: '27%', textAlign: 'center'}}>name</div>
                            <div style={{width: '26%', textAlign: 'center'}}>log2FC</div>
                            <div style={{width: '26%', textAlign: 'center'}}>p-val</div>
                            <div style={{width: '20%', textAlign: 'center'}}>pts</div>
                        </div>
                    ),
                    key: 'markers',
                    className: 'marker-nested-container',
                    render: (_, record) => (
                        <div className='marker-scroll-container'>
                            {record.markers.map((marker, idx) => (
                                <div key={idx} className='marker-row'>
                                    <div className='marker-cell name-cell'>
                                        <Checkbox />
                                        <a href='#' className='marker-link'>
                                            {marker.label}
                                        </a>
                                    </div>
                                    <div className='marker-cell metric-cell'>
                                        <ValueBorder value={marker.log2FC}>
                                            <strong>{marker.log2FC}</strong>
                                        </ValueBorder>
                                    </div>
                                    <div className='marker-cell metric-cell'>
                                        <PValBorder value={marker.pVal}>
                                            <ScientificNotation value={marker.pVal} />
                                        </PValBorder>
                                    </div>
                                    <div className='marker-cell metric-cell'>
                                        <div
                                            style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                width: 32,
                                                height: 32
                                            }}
                                        >
                                            <Progress
                                                type='circle'
                                                percent={marker.pts * 100}
                                                width={32}
                                                showInfo={false}
                                                strokeWidth={10}
                                                strokeColor='#1890ff'
                                            />
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: 10,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {marker.pts}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            ]
        },
        {
            title: 'F1_score',
            dataIndex: 'f1Score',
            key: 'f1Score',
            className: 'score-column',
            width: '15%',
            align: 'center'
        }
    ];

    return (
        <div className='combination-root'>
            <div className='combination-title'>Marker Genes View</div>
            <div className='combination-body'>
                <Table<Combination>
                    dataSource={filteredData}
                    columns={columns}
                    pagination={false}
                    bordered
                    scroll={{y: 320}}
                    rowKey='id'
                    size='small'
                />
            </div>
        </div>
    );
});

export default CombinationView;
