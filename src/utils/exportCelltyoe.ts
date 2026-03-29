import {ActionRecord} from './dagConverter';

export interface CellTypeMapping {
    predicted_cell_type: {
        cell_type: string;
        reasoning: string;
    };
}

export interface ExportedAction {
    action_id: string;
    action_name: string;
    parent_action_id: string;
    mapping: Record<string, CellTypeMapping>[];
}

export const exportCellTypeData = (actions: ActionRecord[]): ExportedAction[] => {
    return actions.map((action) => {
        const resultMapping: Record<string, CellTypeMapping> = {};

        if (action.mapping && action.mapping.length > 0) {
            const mappingObj = action.mapping[0];

            Object.entries(mappingObj).forEach(([clusterId, detail]: [string, any]) => {
                const predicted = detail?.predicted_cell_type || {};
                resultMapping[clusterId] = {
                    predicted_cell_type: {
                        cell_type: predicted.cell_type || '',
                        reasoning: predicted.reasoning || ''
                    }
                };
            });
        }

        return {
            action_id: action.action_id,
            action_name: action.action_name,
            parent_action_id: action.parent_action_id,
            mapping: [resultMapping]
        };
    });
};
