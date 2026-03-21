import React, {useMemo, useState, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {Checkbox} from 'antd';
import './index.less';
import actions from '@/store/index';
import {convertActionsToCombinationData, Combination} from '@/utils/combinationConverter';
import GeneGlyph from './GeneGlyph';
import F1ScoreGlyph from './F1ScoreGlyph';
import {cellStore} from '@/store/CellData';
import {clusterColorStore} from '@/store/colorMapping';

const CombinationView = observer(() => {
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

    // Group data by cluster for vertical layout
    const dataByCluster = useMemo(() => {
        const grouped: {[key: string]: Combination[]} = {};
        interactiveData.forEach((item) => {
            if (!grouped[item.clusterId]) {
                grouped[item.clusterId] = [];
            }
            grouped[item.clusterId].push(item);
        });
        return grouped;
    }, [interactiveData]);

    return (
        <div className='combination-root'>
            <div className='combination-title'>Marker Gene View</div>
            <div className='combination-body-vertical'>
                {Object.entries(dataByCluster).map(([clusterId, combinations]) => (
                    <div key={clusterId} className='cluster-column'>
                        {combinations.map((combo) => (
                            <div key={combo.id} className='cluster-cell'>
                                <div className='cluster-header'>
                                    <div className='cluster-tag' style={{backgroundColor: combo.clusterColor}}>
                                        {combo.clusterId}
                                    </div>
                                    <div className='cell-type-tag'>{combo.cellType}</div>
                                </div>
                                <div className='markers-container'>
                                    {combo.markers.map((marker, idx) => (
                                        <div
                                            key={idx}
                                            className={`marker-row ${marker.isSelected ? 'selected' : ''}`}
                                            onClick={() => handleCheckboxChange(combo.id, marker.label)}
                                        >
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
                                {/* <div className='f1-score-container'>
                                    <F1ScoreGlyph score={combo.f1Score} />
                                </div> */}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default CombinationView;
