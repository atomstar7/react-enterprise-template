import React, {useMemo, useState, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {Table, Checkbox} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import './index.less';
import actions from '@/store/index';
import {convertActionsToCombinationData, Combination} from '@/utils/combinationConverter';
import GeneGlyph from './GeneGlyph';
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
            width: '25%',
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
            render: (_, record) => {
                const isExpanded = expandedRowKeys.includes(record.id);
                return (
                    <div className={`marker-scroll-container ${isExpanded ? 'expanded' : ''}`}>
                        {record.markers.map((marker, idx) => (
                            <div key={idx} className='marker-row'>
                                <Checkbox
                                    checked={marker.isSelected}
                                    onChange={() => handleCheckboxChange(record.id, marker.label)}
                                />
                                <GeneGlyph
                                    gene_name={marker.gene_name}
                                    log2FC={marker.log2FC}
                                    pval_adj={marker.pval_adj}
                                    pts={marker.pts}
                                    pts_rest={marker.pts_rest}
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
