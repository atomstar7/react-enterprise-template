// @ts-nocheck

import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import * as d3 from 'd3';
import './index.less';
import {myCoords, myCategories} from '@/store';
import {cellStore} from '@/store/CellData';
import {embeddingColor} from '@/constants/enum';

const drawEmbedding = (svgElement: SVGSVGElement, coords: number[][], category: string[], actionId: string) => {
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    const margin = {top: 30, right: 10, bottom: 10, left: 10};

    const svg = d3
        .select(svgElement)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    // Title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(`${actionId} UMAP`);

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

    // Add X-Axis
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickValues([]));

    // Add Y-Axis
    svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(d3.axisLeft(yScale).tickValues([]));

    // Style the axis lines to be black
    svg.selectAll('.domain').attr('stroke', 'black');

    // // X-Axis Label
    // svg.append('text')
    //     .attr('x', width / 2)
    //     .attr('y', height - margin.bottom + 20)
    //     .attr('text-anchor', 'middle')
    //     .style('font-size', '12px')
    //     .text('UMAP1');

    // // Y-Axis Label
    // svg.append('text')
    //     .attr('transform', 'rotate(-90)')
    //     .attr('y', margin.left - 10)
    //     .attr('x', 0 - height / 2)
    //     .attr('text-anchor', 'middle')
    //     .style('font-size', '12px')
    //     .text('UMAP2');

    // Create a color scale mapping categories to embedding colors
    const uniqueCategories = Array.from(new Set(category)).sort();
    const colors = Object.values(embeddingColor);
    const colorScale = d3.scaleOrdinal<string>().domain(uniqueCategories).range(colors);

    // Draw points
    svg.selectAll('circle.point')
        .data(coords)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', (d) => xScale(d[0]))
        .attr('cy', (d) => yScale(d[1]))
        .attr('r', 1) // Smaller radius to match image
        .attr('fill', (_, i) => colorScale(category[i]))
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

            svg.append('text')
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
            <div className='embedding-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
});

export default Embedding;
