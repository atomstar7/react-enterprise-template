// @ts-nocheck

import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import * as d3 from 'd3';
import './index.less';
import {myCoords, myCategories} from '@/store';
import {cellStore} from '@/store/CellData';
import {clusterColorStore} from '@/store/colorMapping';

const drawEmbedding = (svgElement: SVGSVGElement, coords: number[][], category: string[], actionId: string) => {
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    const margin = {top: 0, right: 0, bottom: 0, left: 0};

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

    // Create a container group for all elements that need to be zoomed/panned
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 10]) // Set min and max zoom limits
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Draw points
    g.selectAll('circle.point')
        .data(coords)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', (d) => xScale(d[0]))
        .attr('cy', (d) => yScale(d[1]))
        .attr('r', 1) // Smaller radius to match image
        .attr('fill', (_, i) => clusterColorStore.getColor(category[i]))
        .attr('opacity', 0.8);

    // Calculate centroids and draw labels
    const clusters: {[key: string]: number[][]} = {};
    coords.forEach((coord, i) => {
        const cat = category[i];
        if (!clusters[cat]) {
            clusters[cat] = [];
        }
        clusters[cat].push(coord);
    });

    Object.keys(clusters).forEach((cat) => {
        const clusterCoords = clusters[cat];
        const scaledCoords = clusterCoords.map((d) => [xScale(d[0]), yScale(d[1])]);

        if (scaledCoords.length > 0) {
            const avgX = d3.mean(scaledCoords, (d) => d[0]);
            const avgY = d3.mean(scaledCoords, (d) => d[1]);

            g.append('text')
                .attr('x', avgX)
                .attr('y', avgY)
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .style('fill', '#333')
                .text(cat);
        }
    });
};

const Embedding = observer(() => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [coords, setCoords] = useState<number[][]>([]);
    const [category, setCategory] = useState<string[]>([]);

    useEffect(() => {
        const coordsData = myCoords.map((p) => [p.x, p.y]);
        setCoords(coordsData);
    }, []);

    // Update category based on selected_action_id
    useEffect(() => {
        const selectedActionId = cellStore.selected_action_id;

        const matchedCategory = myCategories.find((c) => c.key === selectedActionId);

        if (matchedCategory) {
            setCategory(matchedCategory.value);
        } else {
            // Fallback or default behavior if no match found
            console.warn(`No category found for action_id: ${selectedActionId}, using default`);
            if (myCategories.length > 0) {
                // You might want to default to the first one or keep previous
                // setCategory(myCategories[0].value);
            }
        }
    }, [cellStore.selected_action_id]);

    useEffect(() => {
        const actionId = cellStore.selected_action_id;
        if (!svgRef.current || coords.length === 0 || category.length === 0 || !actionId) return;

        // Initial draw
        drawEmbedding(svgRef.current, coords, category, actionId);

        const resizeObserver = new ResizeObserver(() => {
            if (svgRef.current) {
                drawEmbedding(svgRef.current, coords, category, actionId);
            }
        });
        resizeObserver.observe(svgRef.current);

        return () => resizeObserver.disconnect();
    }, [coords, category, cellStore.selected_action_id]);

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    return (
        <div className='embedding-root'>
            <div className='embedding-title'>
                <div>Cell Overview</div>
                <div className='cell-count-info'>
                    <div className='gray-circle'></div>
                    <span>{coords.length}</span>
                </div>
            </div>
            <div className='embedding-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
});

export default Embedding;
