import request from './request';
interface UmapCoords {
    x: number;
    y: number;
}

export function fetchUmapCoords() {
    return request<ApiResponseData<UmapCoords[]>>({
        url: '/umap_coords',
        method: 'post'
    });
}
// data:cluster_id
export function fetchUmapCategory(data: string) {
    return request<ApiResponseData<string[]>>({
        url: '/umap_category',
        method: 'post',
        data
    });
}

export interface NodeData {
    cluster_name: string;
    /** 每个簇所含有的细胞数 */
    count: number;
    /** 每个簇所对应的 calc_marker_combination 中的 F1_score */
    score: number;
}

export interface Node {
    /** 对应 action_id */
    id: string;
    action_name?: string;
    reasoning?: string;
    cluster_score: NodeData[];
    /** 所有簇的 F1_score 的平均值 */
    average_score: number;
}

export interface Link {
    source: string;
    target: string;
    type: string;
    /** 对应 target 所表示的 action 的 according 字段 */
    reasoning: string;
}

export interface DagData {
    nodes: Node[];
    links: Link[];
}

export function fetchDagData() {
    return request<ApiResponseData<DagData>>({
        url: '/action_to_DAG',
        method: 'post'
    });
}

export interface AgentCall {
    layer: number;
    start_action_id: string;
    user_intent: string;
}

export function fetchAgentResponse(data: AgentCall) {
    return request<ApiResponseData<DagData>>({
        url: '/analyze',
        method: 'post',
        data
    });
}
