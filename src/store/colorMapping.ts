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
        const uniqueClusterIds = Array.from(new Set(clusterIds)).sort();
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
