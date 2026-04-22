// import {makeObservable, observable, action, computed, flow} from 'mobx';
import {makeAutoObservable} from 'mobx';

class CellData {
    selected_action_id: string = 'action_1';
    centroids: number[][] = [];
    chat_panel_actions: string[] = [];
    show_action8: boolean = false;

    // 官方文档: https://zh.mobx.js.org/observable-state.html#%E5%8F%AF%E7%94%A8%E7%9A%84%E6%B3%A8%E8%A7%A3
    constructor() {
        makeAutoObservable(this);
    }

    setShowAction8(show: boolean) {
        this.show_action8 = show;
    }

    setSelectedActionId(actionId: string) {
        this.selected_action_id = actionId;
    }

    setCentroids(centroids: number[][]) {
        this.centroids = centroids;
    }

    addChatPanelAction(actionId: string) {
        if (!this.chat_panel_actions.includes(actionId)) {
            this.chat_panel_actions.push(actionId);
        }
    }

    removeChatPanelAction(actionId: string) {
        this.chat_panel_actions = this.chat_panel_actions.filter((id) => id !== actionId);
    }
    clearChatPanelActions() {
        this.chat_panel_actions = [];
    }
}

const cellStore = new CellData();
export {cellStore};
