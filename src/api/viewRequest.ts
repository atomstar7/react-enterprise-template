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
