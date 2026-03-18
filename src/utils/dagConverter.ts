import {Node, Link, DagData, NodeData} from '@/api/viewRequest';
import {myCoords, myCategories} from '@/store';
import {clusterColorStore} from '@/store/colorMapping';

// Define types for store data
interface Coords {
    x: number;
    y: number;
}

interface Categories {
    key: string;
    value: string[];
}

const calculateInnerGraphData = (node: Node, allCategories: Categories[], allCoords: Coords[]) => {
    const categoryEntry = allCategories.find((c) => c.key === node.id);

    if (categoryEntry && categoryEntry.value && allCoords && allCoords.length > 0) {
        const categories = categoryEntry.value;
        const points = allCoords.map((p) => [p.x, p.y]);
        const clusterNames = node.cluster_score.map((c) => c.cluster_name);

        const groupedData = clusterNames.map((name) => {
            return points.filter((_, i) => categories[i] === name);
        });

        const centroids = groupedData.map((group) => {
            if (group.length === 0) return [0, 0];
            const sum = group.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
            return [sum[0] / group.length, sum[1] / group.length];
        });

        if (centroids.length > 0) {
            const xs = centroids.map((c) => c[0]);
            const ys = centroids.map((c) => c[1]);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const maxDist = Math.max(maxX - minX, maxY - minY) / 2 || 1;
            const scale = 15 / maxDist; // Scale to fit within ~15 radius (leaving padding for 30)

            const normalizedCentroids = centroids.map((c, i) => ({
                id: i,
                x: (c[0] - centerX) * scale,
                y: (c[1] - centerY) * scale,
                category: clusterNames[i] // Add category here
            }));

            const edges: {source: number; target: number; distance: number}[] = [];
            for (let i = 0; i < centroids.length; i++) {
                for (let j = i + 1; j < centroids.length; j++) {
                    const dx = centroids[i][0] - centroids[j][0];
                    const dy = centroids[i][1] - centroids[j][1];
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    edges.push({source: i, target: j, distance});
                }
            }

            edges.sort((a, b) => a.distance - b.distance);

            const parent = new Array(centroids.length).fill(0).map((_, i) => i);
            const find = (i: number): number => {
                if (parent[i] === i) return i;
                return (parent[i] = find(parent[i]));
            };
            const union = (i: number, j: number) => {
                const rootI = find(i);
                const rootJ = find(j);
                if (rootI !== rootJ) {
                    parent[rootI] = rootJ;
                    return true;
                }
                return false;
            };

            const mstLinks: {source: number; target: number}[] = [];
            for (const edge of edges) {
                if (union(edge.source, edge.target)) {
                    mstLinks.push({source: edge.source, target: edge.target});
                }
                if (mstLinks.length === centroids.length - 1) break;
            }

            return {
                nodes: normalizedCentroids,
                links: mstLinks
            };
        }
    }
    return undefined;
};

export interface ActionRecord {
    action_id: string;
    action_name: string;
    parent_action_id: string;
    according: {
        according_history_actions: {
            history_reason_summary: string;
        };
    };
    mapping: Record<string, ClusterDetail>[];
}

export interface ClusterDetail {
    calc_marker_combination: {
        F1_score: string | number;
    };
}

export const convertActionsToDagData = (actions: ActionRecord[]): DagData => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    actions.forEach((action) => {
        const categoryEntry = (myCategories as Categories[]).find((c) => c.key === action.action_id);
        const actionCategories = categoryEntry ? categoryEntry.value : [];

        // Build Node
        const clusterScore: NodeData[] = [];
        let totalScore = 0;
        let count = 0;

        // Assuming mapping is an array with one object containing all clusters for this action
        if (action.mapping && action.mapping.length > 0) {
            const mappingObj = action.mapping[0];

            Object.entries(mappingObj).forEach(([clusterId, detail]) => {
                const scoreVal = detail.calc_marker_combination.F1_score;
                const score = typeof scoreVal === 'string' ? parseFloat(scoreVal) : scoreVal;

                clusterScore.push({
                    cluster_name: clusterId,
                    count: 1, // Set count to 1 for even distribution
                    score: score || 0,
                    color: clusterColorStore.getColor(clusterId) // Assign color from the new scale
                });

                if (!isNaN(score)) {
                    totalScore += score;
                    count++;
                }
            });
        }

        const averageScore = count > 0 ? totalScore / count : 0;

        const node: Node = {
            id: action.action_id,
            action_name: action.action_name,
            reasoning: action.according.according_history_actions.history_reason_summary || '',
            cluster_score: clusterScore,
            average_score: averageScore
        };

        // Calculate and add innerGraphData
        (node as any).innerGraphData = calculateInnerGraphData(
            node,
            myCategories as Categories[],
            myCoords as Coords[]
        );

        nodes.push(node);

        // Build Link (if parent exists)
        if (action.parent_action_id) {
            links.push({
                source: action.parent_action_id,
                target: action.action_id,
                type: action.action_name,
                reasoning: action.according.according_history_actions.history_reason_summary || ''
            });
        }
    });

    return {nodes, links};
};
