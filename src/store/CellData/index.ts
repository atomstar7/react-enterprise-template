// import {makeObservable, observable, action, computed, flow} from 'mobx';
import {makeAutoObservable} from 'mobx';

class CellData {
    selected_action_id: string = 'action_1';
    centroids: number[][] = [];

    // 官方文档: https://zh.mobx.js.org/observable-state.html#%E5%8F%AF%E7%94%A8%E7%9A%84%E6%B3%A8%E8%A7%A3
    constructor() {
        makeAutoObservable(this);
    }

    setSelectedActionId(actionId: string) {
        this.selected_action_id = actionId;
    }

    setCentroids(centroids: number[][]) {
        this.centroids = centroids;
    }
}

const cellStore = new CellData();
export {cellStore};
