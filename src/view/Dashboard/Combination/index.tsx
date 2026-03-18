import React, {useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Table, Checkbox} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import './index.less';
import actions from '@/store/index';
import {convertActionsToCombinationData, Combination} from '@/utils/combinationConverter';
import GeneGlyph from './GeneGlyph';
import F1ScoreGlyph from './F1ScoreGlyph';
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

const CombinationView = observer(() => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

    const allData = useMemo(() => convertActionsToCombinationData(actions as any), []);

    const filteredData = useMemo(() => {
        const selectedId = cellStore.selected_action_id;
        if (!selectedId) return [];
        // Filter combinations where ID starts with the selected action ID
        // The ID format in converter is `${action.action_id}-${clusterId}`
        return allData.filter((item) => item.id.startsWith(`${selectedId}-`));
    }, [allData, cellStore.selected_action_id]);

    const toggleRowExpansion = (key: React.Key) => {
        setExpandedRowKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    // Parent Table Columns (Cluster, Marker Table, F1_Score)
    const columns: ColumnsType<Combination> = [
        {
            title: 'Cluster',
            dataIndex: 'id',
            key: 'id',
            className: 'cluster-column',
            width: '25%',
            align: 'center',
            render: (_, record) => {
                const parts = record.id.split('-');
                const clusterId = parts.length > 1 ? `#${parts[parts.length - 1]}` : record.id;
                return (
                    <div onClick={() => toggleRowExpansion(record.id)} style={{cursor: 'pointer'}}>
                        <div>{clusterId}</div>
                        <div style={{borderTop: '1px solid black', margin: '4px 0'}}></div>
                        <div>{record.cellType}</div>
                    </div>
                );
            }
        },
        {
            title: 'Marker genes',
            key: 'markers',
            render: (_, record) => {
                const isExpanded = expandedRowKeys.includes(record.id);
                return (
                    <div className={`marker-scroll-container ${isExpanded ? 'expanded' : ''}`}>
                        {record.markers.map((marker, idx) => (
                            <div key={idx} className='marker-row'>
                                <Checkbox />
                                <GeneGlyph
                                    name={marker.label}
                                    log2FC={marker.log2FC}
                                    pVal={marker.pVal}
                                    pts={marker.pts}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'F1_score',
            dataIndex: 'f1Score',
            key: 'f1Score',
            className: 'score-column',
            width: '25%',
            align: 'center',
            render: (score) => <F1ScoreGlyph score={score} />
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
                    rowKey='id'
                    size='small'
                    showHeader={false}
                />
            </div>
        </div>
    );
});

export default CombinationView;
