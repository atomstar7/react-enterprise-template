// @ts-nocheck
import React, {useEffect, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import * as d3 from 'd3';
import {sankey, sankeyLinkHorizontal} from 'd3-sankey';
import './index.less';
import {myCategories} from '@/store';
import {clusterColorStore} from '@/store/colorMapping';

// Function to process the category data into a format suitable for a Sankey diagram
const convertDataForSankey = (categories) => {
    if (categories.length < 2) {
        return {nodes: [], links: []};
    }

    const nodeSet = new Set();
    const linksMap = {};

    for (let i = 0; i < categories.length - 1; i++) {
        const sourceAction = categories[i];
        const targetAction = categories[i + 1];

        for (let j = 0; j < sourceAction.value.length; j++) {
            const sourceCategory = `${sourceAction.key}_${sourceAction.value[j]}`;
            const targetCategory = `${targetAction.key}_${targetAction.value[j]}`;

            nodeSet.add(sourceCategory);
            nodeSet.add(targetCategory);

            const linkKey = `${sourceCategory}->${targetCategory}`;
            if (!linksMap[linkKey]) {
                linksMap[linkKey] = {
                    source: sourceCategory,
                    target: targetCategory,
                    value: 0
                };
            }
            linksMap[linkKey].value++;
        }
    }

    const nodeList = Array.from(nodeSet).map((nodeId) => ({id: nodeId, sourceLinks: [], targetLinks: []}));
    const nodeById = new Map(nodeList.map((d) => [d.id, d]));

    const linkList = Object.values(linksMap).map((link) => {
        const logValue = Math.log1p(link.value);
        const sourceNode = nodeById.get(link.source);
        const targetNode = nodeById.get(link.target);
        const newLink = {
            ...link,
            originalValue: link.value,
            value: logValue,
            source: sourceNode, // Temporarily link for balancing
            target: targetNode
        };
        sourceNode.sourceLinks.push(newLink);
        targetNode.targetLinks.push(newLink);
        return newLink;
    });

    // Balance the node values to fix log scale issues
    for (const node of nodeList) {
        const sumSource = d3.sum(node.sourceLinks, (l) => l.value);
        const sumTarget = d3.sum(node.targetLinks, (l) => l.value);

        if (sumSource > sumTarget && sumTarget > 0) {
            const scale = sumSource / sumTarget;
            for (const link of node.targetLinks) {
                link.value *= scale;
            }
        } else if (sumTarget > sumSource && sumSource > 0) {
            const scale = sumTarget / sumSource;
            for (const link of node.sourceLinks) {
                link.value *= scale;
            }
        }
    }

    // Clean up links for d3-sankey (it expects string IDs, not objects)
    const finalLinks = linkList.map((l) => ({
        source: l.source.id,
        target: l.target.id,
        value: l.value,
        originalValue: l.originalValue
    }));
    const finalNodes = nodeList.map((n) => ({id: n.id}));

    return {nodes: finalNodes, links: finalLinks};
};

const drawSankey = (svgElement, data) => {
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    const margin = {top: 10, right: 20, bottom: 10, left: 20};

    const svg = d3
        .select(svgElement)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove(); // Clear previous render

    const sankeyLayout = sankey()
        .nodeId((d) => d.id)
        .nodeWidth(15)
        .nodePadding(10)
        .extent([
            [margin.left, margin.top],
            [width - margin.right, height - margin.bottom]
        ]);

    const {nodes, links} = sankeyLayout(data);

    // Create a unique ID for each gradient
    const gradients = svg.append('defs').selectAll('linearGradient').data(links).join('linearGradient');

    gradients
        .attr('id', (d, i) => `gradient-${i}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (d) => d.source.x1)
        .attr('x2', (d) => d.target.x0);

    gradients
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (d) => {
            const category = d.source.id.split('_').slice(1).join('_');
            return clusterColorStore.getColor(category);
        });

    gradients
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (d) => {
            const category = d.target.id.split('_').slice(1).join('_');
            return clusterColorStore.getColor(category);
        });

    // Draw links
    svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-opacity', 0.3) // Increased transparency
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('d', sankeyLinkHorizontal())
        .attr('stroke', (d, i) => `url(#gradient-${i})`) //渐变
        // .attr('stroke', 'grey')
        .attr('stroke-width', (d) => Math.max(1, d.width));

    // Draw nodes
    svg.append('g')
        .attr('stroke', '#d6d5d5ff')
        .selectAll('rect')
        .data(nodes)
        .join('rect')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('fill', (d) => {
            const category = d.id.split('_').slice(1).join('_');
            return clusterColorStore.getColor(category);
        })
        .attr('fill-opacity', 0.8) // Added transparency to nodes
        .append('title')
        .text((d) => {
            const originalValue = Math.max(
                d3.sum(d.sourceLinks, (l) => l.originalValue),
                d3.sum(d.targetLinks, (l) => l.originalValue)
            );
            return `${d.id.replace('_', ': ')}\n${originalValue}`;
        });

    // Add labels to nodes
    svg.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .selectAll('text')
        .data(nodes)
        .join('text')
        .attr('x', (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr('y', (d) => (d.y1 + d.y0) / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', (d) => (d.x0 < width / 2 ? 'start' : 'end'))
        .text((d) => d.id.split('_').slice(1).join('_'));
};

const Sankey = observer(() => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (svgRef.current && myCategories.length > 0) {
            const sankeyData = convertDataForSankey(myCategories);

            // Initial draw
            drawSankey(svgRef.current, sankeyData);

            // Redraw on resize
            const resizeObserver = new ResizeObserver(() => {
                if (svgRef.current) {
                    drawSankey(svgRef.current, sankeyData);
                }
            });
            resizeObserver.observe(svgRef.current);

            return () => resizeObserver.disconnect();
        }
    }, [myCategories]);

    return (
        <div className='sankey-root'>
            <div className='sankey-title'>Label Flow View</div>
            <div className='sankey-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
});

export default Sankey;
