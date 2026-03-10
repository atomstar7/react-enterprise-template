// @ts-nocheck

import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {fetchUmapCoords, fetchUmapCategory} from '@/api/viewRequest';
import './index.less';

const drawEmbedding = (svgElement: SVGSVGElement, coords: number[][], category: string[]) => {
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    const margin = {top: 20, right: 20, bottom: 20, left: 20};

    const svg = d3
        .select(svgElement)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const xExtent = d3.extent(coords, (d) => d[0]) as [number, number];
    const yExtent = d3.extent(coords, (d) => d[1]) as [number, number];

    const xScale = d3
        .scaleLinear()
        .domain([xExtent[0] - 1, xExtent[1] + 1])
        .range([margin.left, width - margin.right]);

    const yScale = d3
        .scaleLinear()
        .domain([yExtent[0] - 1, yExtent[1] + 1])
        .range([height - margin.bottom, margin.top]);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .selectAll('line.horizontal')
        .data(yScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'horizontal')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);

    svg.append('g')
        .attr('class', 'grid')
        .selectAll('line.vertical')
        .data(xScale.ticks(5))
        .enter()
        .append('line')
        .attr('class', 'vertical')
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .attr('x1', (d) => xScale(d))
        .attr('x2', (d) => xScale(d))
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1);

    // Process data into groups based on category
    const uniqueCategories = Array.from(new Set(category));
    // Ensure the order matches the original categories if present, or just use occurrence order.
    // Since uniqueCategories from Set preserves insertion order, and we construct category array
    // by iterating data which follows 'blood', 'brain', 'bone' cycle, the order will be ['blood', 'brain', 'bone'].

    const groupedData = uniqueCategories.map((cat) => coords.filter((_, i) => category[i] === cat));

    // Calculate centroids
    const centroids = groupedData.map((points) => {
        const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
        return [sum[0] / points.length, sum[1] / points.length];
    });

    // Calculate MST for centroids connections
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

    const mstEdges: typeof edges = [];
    for (const edge of edges) {
        if (union(edge.source, edge.target)) {
            mstEdges.push(edge);
        }
        if (mstEdges.length === centroids.length - 1) break;
    }

    // Draw MST edges
    mstEdges.forEach((edge) => {
        const p1 = centroids[edge.source];
        const p2 = centroids[edge.target];
        svg.append('line')
            .attr('x1', xScale(p1[0]))
            .attr('y1', yScale(p1[1]))
            .attr('x2', xScale(p2[0]))
            .attr('y2', yScale(p2[1]))
            .attr('stroke', '#666')
            .attr('stroke-width', 2);
    });

    // Draw dotted outline for each cluster
    groupedData.forEach((points) => {
        const hull = d3.polygonHull(points);
        if (hull) {
            const line = d3
                .line()
                .x((d) => xScale(d[0]))
                .y((d) => yScale(d[1]))
                .curve(d3.curveLinearClosed);

            svg.append('path')
                .datum(hull)
                .attr('d', line)
                .attr('fill', 'none')
                .attr('stroke', '#999')
                .attr('stroke-width', 1.5)
                .attr('stroke-dasharray', '4,4');
        }
    });

    // Draw points
    svg.selectAll('circle.point')
        .data(coords)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', (d) => xScale(d[0]))
        .attr('cy', (d) => yScale(d[1]))
        .attr('r', 5)
        .attr('fill', '#b0b0b0')
        .attr('stroke', '#808080')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8);

    // Draw centroids and labels
    centroids.forEach((centroid, i) => {
        svg.append('circle')
            .attr('cx', xScale(centroid[0]))
            .attr('cy', yScale(centroid[1]))
            .attr('r', 6)
            .attr('fill', 'black');

        // Adjust label position based on category to match the image
        let labelX = xScale(centroid[0]);
        let labelY = yScale(centroid[1]);
        let textAnchor = 'middle';
        const currentCategory = uniqueCategories[i];

        if (currentCategory === 'blood') {
            labelX -= 15;
            labelY -= 10;
            textAnchor = 'end';
        } else if (currentCategory === 'brain') {
            labelX += 15;
            labelY -= 10;
            textAnchor = 'start';
        } else if (currentCategory === 'bone') {
            labelX -= 15;
            labelY += 10;
            textAnchor = 'end';
        }

        svg.append('text')
            .attr('x', labelX)
            .attr('y', labelY)
            .text(currentCategory)
            .attr('text-anchor', textAnchor)
            .attr('font-size', '16px')
            .attr('font-family', 'Arial, sans-serif')
            .attr('fill', 'black');
    });
};

const Embedding = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [coords, setCoords] = useState<number[][]>([]);
    const [category, setCategory] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const coordsResponse = (await fetchUmapCoords()).data;
                if (coordsResponse.status !== 200) {
                    throw new Error('Failed to fetch Umap coords: ' + coordsResponse.status);
                }
                const coordsData = coordsResponse.data.map((p) => [p.x, p.y]);
                setCoords(coordsData);
                const categoryResponse = (await fetchUmapCategory('leiden')).data;
                if (categoryResponse.status !== 200) {
                    throw new Error('Failed to fetch Umap category: ' + categoryResponse.status);
                }
                setCategory(categoryResponse.data);

                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'An error occurred');
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!svgRef.current || loading || error || coords.length === 0 || category.length === 0) return;

        // Initial draw
        drawEmbedding(svgRef.current, coords, category);

        const resizeObserver = new ResizeObserver(() => {
            if (svgRef.current) {
                drawEmbedding(svgRef.current, coords, category);
            }
        });
        resizeObserver.observe(svgRef.current);

        return () => resizeObserver.disconnect();
    }, [loading, error, coords, category]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className='embedding-root'>
            <div className='embedding-title'>Embedding View</div>
            <div className='embedding-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
};

export default Embedding;
