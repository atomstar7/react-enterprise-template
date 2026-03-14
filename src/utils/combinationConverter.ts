export interface Marker {
    label: string;
    gene: string;
    bgColor: string;
    log2FC: number;
    pVal: number;
    pts: number;
}

export interface Combination {
    id: string;
    markers: Marker[];
    f1Score: number;
}

export interface ActionRecord {
    action_id: string;
    mapping: Record<string, ClusterDetail>[];
}

export interface ClusterDetail {
    candidate_marker_list: CandidateMarker[];
    calc_marker_combination: {
        F1_score: string | number;
    };
}

export interface CandidateMarker {
    gene_name: string;
    log2FC: string | number;
    pval_adj: string | number;
    pts: string | number;
}

export const convertActionsToCombinationData = (actions: ActionRecord[]): Combination[] => {
    const combinations: Combination[] = [];

    actions.forEach((action) => {
        if (action.mapping && action.mapping.length > 0) {
            const mappingObj = action.mapping[0];
            Object.entries(mappingObj).forEach(([clusterId, detail]) => {
                const f1ScoreVal = detail.calc_marker_combination.F1_score;
                const f1Score = typeof f1ScoreVal === 'string' ? parseFloat(f1ScoreVal) : f1ScoreVal;

                const markers: Marker[] = detail.candidate_marker_list.map((marker, index) => {
                    const log2FC = typeof marker.log2FC === 'string' ? parseFloat(marker.log2FC) : marker.log2FC;
                    const pVal = typeof marker.pval_adj === 'string' ? parseFloat(marker.pval_adj) : marker.pval_adj;
                    const pts = typeof marker.pts === 'string' ? parseFloat(marker.pts) : (marker.pts || 0);

                    return {
                        label: marker.gene_name, // Using gene_name as label for now
                        gene: marker.gene_name,
                        bgColor: index % 2 === 0 ? '#fce4ec' : '#e8eaf6', // Alternating colors
                        log2FC: log2FC,
                        pVal: pVal,
                        pts: pts
                    };
                });

                combinations.push({
                    id: `${action.action_id}-${clusterId}`, // Composite ID to be unique
                    markers: markers,
                    f1Score: isNaN(f1Score) ? 0 : f1Score
                });
            });
        }
    });

    return combinations;
};
