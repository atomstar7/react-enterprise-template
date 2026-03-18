import {clusterColorStore} from '@/store/colorMapping';

export interface Marker {
    label: string;
    gene_name: string;
    log2FC: number;
    pval_adj: number;
    pts: number;
    pts_rest: number;
    isSelected: boolean;
}

export interface Combination {
    id: string;
    markers: Marker[];
    f1Score: number;
    cellType: string;
    clusterId: string;
    clusterColor: string;
}

export interface ActionRecord {
    action_id: string;
    mapping: Record<string, ClusterDetail>[];
}

export interface ClusterDetail {
    candidate_marker_list: CandidateMarker[];
    calc_marker_combination: {
        F1_score: string | number;
        marker_combination: string[];
    };
    predicted_cell_type?: {
        cell_type: string;
    };
}

export interface CandidateMarker {
    gene_name: string;
    log2FC: string | number;
    pval_adj: string | number;
    pts: string | number;
    pts_rest: string | number;
}

export const convertActionsToCombinationData = (actions: ActionRecord[]): Combination[] => {
    const combinations: Combination[] = [];

    actions.forEach((action) => {
        if (action.mapping && action.mapping.length > 0) {
            const mappingObj = action.mapping[0];

            Object.entries(mappingObj).forEach(([clusterId, detail]) => {
                const f1ScoreVal = detail.calc_marker_combination.F1_score;
                const f1Score = typeof f1ScoreVal === 'string' ? parseFloat(f1ScoreVal) : f1ScoreVal;

                const combinationGenes = detail.calc_marker_combination.marker_combination || [];

                const markers: Marker[] = detail.candidate_marker_list.map((m) => ({
                    label: m.gene_name,
                    gene_name: m.gene_name,
                    log2FC: typeof m.log2FC === 'string' ? parseFloat(m.log2FC) : m.log2FC,
                    pval_adj: typeof m.pval_adj === 'string' ? parseFloat(m.pval_adj) : m.pval_adj,
                    pts: typeof m.pts === 'string' ? parseFloat(m.pts) : m.pts || 0,
                    pts_rest: typeof m.pts_rest === 'string' ? parseFloat(m.pts_rest) : m.pts_rest || 0,
                    isSelected: combinationGenes.includes(m.gene_name)
                }));

                const cellType = detail.predicted_cell_type?.cell_type || 'unknown';

                combinations.push({
                    id: `${action.action_id}-${clusterId}`,
                    markers,
                    f1Score,
                    cellType,
                    clusterId: `#${clusterId}`,
                    clusterColor: clusterColorStore.getColor(clusterId)
                });
            });
        }
    });

    return combinations;
};
