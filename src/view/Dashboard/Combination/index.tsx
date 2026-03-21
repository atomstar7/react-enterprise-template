import React, {useMemo, useState, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {Table, Checkbox} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import './index.less';
import actions from '@/store/index';
import {convertActionsToCombinationData, Combination, Marker} from '@/utils/combinationConverter';
import F1ScoreGlyph from './F1ScoreGlyph';
import {cellStore} from '@/store/CellData';
import {clusterColorStore} from '@/store/colorMapping';

// Simplified Border Components using standard CSS/SVG combination for better responsiveness

const CombinationView = observer(() => {
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [interactiveData, setInteractiveData] = useState<Combination[]>([]);

    const allData = useMemo(() => {
        if (!clusterColorStore.isInitialized) return [];
        return convertActionsToCombinationData(actions as any);
    }, [clusterColorStore.isInitialized]);

    const filteredData = useMemo(() => {
        const selectedId = cellStore.selected_action_id;
        if (!selectedId) return [];
        return allData.filter((item) => item.id.startsWith(`${selectedId}-`));
    }, [allData, cellStore.selected_action_id]);

    useEffect(() => {
        setInteractiveData(filteredData);
    }, [filteredData]);

    const toggleRowExpansion = (key: React.Key) => {
        setExpandedRowKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    };

    // Parent Table Columns (Cluster, Marker Table, F1_Score)
    const handleCheckboxChange = (combinationId: string, markerLabel: string) => {
        setInteractiveData((currentData) =>
            currentData.map((combo) => {
                if (combo.id === combinationId) {
                    const newMarkers = combo.markers.map((marker) => {
                        if (marker.label === markerLabel) {
                            return {...marker, isSelected: !marker.isSelected};
                        }
                        return marker;
                    });
                    return {...combo, markers: newMarkers};
                }
                return combo;
            })
        );
    };

    const columns: ColumnsType<Combination> = [
        {
            title: 'Cluster',
            dataIndex: 'id',
            key: 'id',
            className: 'cluster-column',
            width: '16%',
            align: 'center',
            render: (_, record) => (
                <div
                    onClick={() => toggleRowExpansion(record.id)}
                    style={{
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        alignItems: 'center'
                    }}
                >
                    <div
                        style={{
                            backgroundColor: record.clusterColor,
                            borderRadius: '4px',
                            padding: '2px 8px',
                            display: 'inline-block',
                            color: 'black'
                        }}
                    >
                        {record.clusterId}
                    </div>
                    <div
                        style={{
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            display: 'inline-block'
                        }}
                    >
                        {record.cellType}
                    </div>
                </div>
            )
        },
        {
            title: 'Marker genes',
            key: 'markers',
            width: '68%',
            className: 'marker-genes-cell', // Apply custom class
            render: (record: Combination) => {
                const isExpanded = expandedRowKeys.includes(record.id);
                const markerColumns: ColumnsType<Marker> = [
                    {
                        title: 'Gene',
                        dataIndex: 'gene_name',
                        key: 'gene_name',
                        render: (text, markerRecord) => (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center'
                                    // gap: '0px',
                                    // padding: '0px',
                                    // margin: '0px'
                                }}
                            >
                                <Checkbox
                                    checked={markerRecord.isSelected}
                                    onChange={() => handleCheckboxChange(record.id, markerRecord.label)}
                                />
                                <span style={{marginLeft: 8}}>{text}</span>
                            </div>
                        )
                    },
                    {
                        title: 'log2FC',
                        dataIndex: 'log2FC',
                        key: 'log2FC',
                        render: (val) => val.toFixed(4)
                    },
                    {
                        title: 'p-val adj',
                        dataIndex: 'pval_adj',
                        key: 'pval_adj',
                        render: (val) => val.toFixed(4)
                    },
                    {title: 'pts', dataIndex: 'pts', key: 'pts', render: (val) => val.toFixed(2)},
                    {
                        title: 'pts_rest',
                        dataIndex: 'pts_rest',
                        key: 'pts_rest',
                        render: (val) => val.toFixed(2)
                    }
                ];

                return (
                    <div className={`marker-scroll-container ${isExpanded ? 'expanded' : ''}`}>
                        <Table
                            columns={markerColumns}
                            dataSource={record.markers}
                            rowKey='label'
                            pagination={false}
                            size='small'
                            style={{width: '100%'}}
                        />
                    </div>
                );
            }
        },
        {
            title: 'F1_score',
            dataIndex: 'f1Score',
            key: 'f1Score',
            className: 'score-column',
            width: '16%',
            align: 'center',
            render: (score) => <F1ScoreGlyph score={score} />
        }
    ];

    return (
        <div className='combination-root'>
            <div className='combination-title'>Marker Gene View</div>
            <div className='combination-body'>
                <Table<Combination>
                    dataSource={interactiveData}
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
