// @ts-nocheck

import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import * as d3 from 'd3';
import './index.less';
import {myCoords, myCategories} from '@/store';
import {cellStore} from '@/store/CellData';
import {embeddingColor} from '@/constants/enum';

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
        .attr('r', 1.5) // Slightly increased radius for better visibility
        .attr('fill', (_, i) => colorScale(category[i]))
        .attr('opacity', 0.8);

    // Optional: Add legend
    // const legend = svg.append('g').attr('transform', `translate(${width - 100}, ${margin.top})`);

    // uniqueCategories.forEach((cat, i) => {
    //     const legendRow = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

    //     legendRow.append('circle').attr('r', 5).attr('fill', colorScale(cat));

    //     legendRow
    //         .append('text')
    //         .attr('x', 10)
    //         .attr('y', 5)
    //         .text(cat)
    //         .attr('font-size', '12px')
    //         .attr('font-family', 'Arial, sans-serif')
    //         .attr('fill', '#333');
    // });
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
        if (!svgRef.current || coords.length === 0 || category.length === 0) return;

        // Initial draw
        drawEmbedding(svgRef.current, coords, category);

        const resizeObserver = new ResizeObserver(() => {
            if (svgRef.current) {
                drawEmbedding(svgRef.current, coords, category);
            }
        });
        resizeObserver.observe(svgRef.current);

        return () => resizeObserver.disconnect();
    }, [coords, category]);

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;

    return (
        <div className='embedding-root'>
            <div className='embedding-title'>Cell Clusters View</div>
            <div className='embedding-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
});

export default Embedding;
