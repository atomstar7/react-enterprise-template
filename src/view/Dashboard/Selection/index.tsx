import React, {useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import './index.less';
import RingNodeDag from './RingNodeDag';
import {cellStore} from '@/store/CellData';
import {myCategories} from '@/store';
import {clusterColorStore} from '@/store/colorMapping';

const Selection = observer(() => {
    // Calculate cluster counts based on the currently selected action
    const clusterCounts = useMemo(() => {
        const selectedActionId = cellStore.selected_action_id;
        if (!selectedActionId) return [];

        const categoryEntry = (myCategories as any[]).find((c) => c.key === selectedActionId);
        if (!categoryEntry || !categoryEntry.value) return [];

        // Count occurrences of each cluster
        const counts: Record<string, number> = {};
        categoryEntry.value.forEach((clusterId: string) => {
            if (clusterId === '-1') return; // Skip unclustered or invalid
            counts[clusterId] = (counts[clusterId] || 0) + 1;
        });

        // Convert to array and get colors
        return Object.entries(counts).map(([clusterId, count]) => ({
            clusterId,
            count,
            color: clusterColorStore.getColor(clusterId)
        }));
    }, [cellStore.selected_action_id, myCategories]);

    return (
        <div className='selection-root'>
            <div className='selection-title'>
                <div>Exploration View</div>
                <div className='cluster-counts'>
                    {clusterCounts.map((item) => (
                        <div key={item.clusterId} className='cluster-count-item'>
                            <div className='color-circle' style={{backgroundColor: item.color}}></div>
                            <span>{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className='selection-body'>
                <RingNodeDag />
            </div>
        </div>
    );
});

export default Selection;
