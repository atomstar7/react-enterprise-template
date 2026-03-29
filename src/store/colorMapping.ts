import {makeObservable, observable, action} from 'mobx';
import * as d3 from 'd3';
import {embeddingColor} from '@/constants/enum';

class ColorMapper {
    colorScale: d3.ScaleOrdinal<string, string> = d3.scaleOrdinal<string, string>();
    isInitialized = false;

    constructor() {
        makeObservable(this, {
            colorScale: observable,
            isInitialized: observable,
            initializeScale: action
        });
    }

    initializeScale(clusterIds: string[]) {
        if (this.isInitialized) return;

        // Handle all basic IDs (numbers as strings like "0", "1")
        const basicIds = Array.from(new Set(clusterIds)).filter((id) => !id.includes('+'));

        // Parse and sort the basic IDs correctly as integers
        const sortedBasicIds = basicIds.sort((a, b) => parseInt(a) - parseInt(b));

        // Find all complex IDs (like "1+4", "0+1+6+7")
        const complexIds = Array.from(new Set(clusterIds)).filter((id) => id.includes('+'));

        // Combine them: first all basic IDs sorted, then complex IDs
        const uniqueClusterIds = [...sortedBasicIds, ...complexIds];

        const colors = Object.values(embeddingColor);

        this.colorScale = d3.scaleOrdinal<string>().domain(uniqueClusterIds).range(colors);
        this.isInitialized = true;
    }

    getColor(clusterId: string): string {
        return this.colorScale(clusterId);
    }

    getScale(): d3.ScaleOrdinal<string, string> {
        return this.colorScale;
    }
}

export const clusterColorStore = new ColorMapper();
