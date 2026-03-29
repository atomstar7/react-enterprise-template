// @ts-nocheck
import React, {useEffect, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import * as d3 from 'd3';
import {sankey, sankeyLinkHorizontal} from 'd3-sankey';
import './index.less';
import actions, {myCategories} from '@/store';
import {clusterColorStore} from '@/store/colorMapping';
import {exportCellTypeData} from '@/utils/exportCelltyoe';
import {cellStore} from '@/store/CellData';

const cellTypeData = exportCellTypeData(actions as any);
const cellTypeMap = new Map();
cellTypeData.forEach((action) => {
    if (action.mapping && action.mapping.length > 0) {
        Object.entries(action.mapping[0]).forEach(([clusterId, mappingInfo]) => {
            const cellType = mappingInfo.predicted_cell_type?.cell_type;
            if (cellType) {
                cellTypeMap.set(`${action.action_id}_${clusterId}`, cellType);
            }
        });
    }
});

// Helper function to trace back parent actions
const getActionPath = (targetActionId) => {
    const path = [];
    let currentId = targetActionId;

    // Create a map for quick lookup
    const actionMap = new Map();
    (actions as any).forEach((action) => {
        actionMap.set(action.action_id, action);
    });

    while (currentId && actionMap.has(currentId)) {
        path.unshift(currentId);
        const currentAction = actionMap.get(currentId);
        currentId = currentAction.parent_action_id;
    }

    return path;
};

// Function to process the category data into a format suitable for a Sankey diagram
const convertDataForSankey = (categories, selectedActionId) => {
    if (categories.length < 2) {
        return {nodes: [], links: []};
    }

    // Get the path of actions from root to the selected action
    const actionPath = getActionPath(selectedActionId);

    if (actionPath.length < 2) {
        return {nodes: [], links: []};
    }

    const nodeSet = new Set();
    const linksMap = {};

    // Filter categories to only include those in our path, and keep them in order
    const filteredCategories = actionPath.map((actionId) => categories.find((c) => c.key === actionId)).filter(Boolean);

    for (let i = 0; i < filteredCategories.length - 1; i++) {
        const sourceAction = filteredCategories[i];
        const targetAction = filteredCategories[i + 1];

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
        value: Math.max(0.001, l.value), // Ensure value is strictly positive to prevent D3 layout errors
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

    // Handle empty data to prevent d3-sankey layout errors
    if (!data.nodes || data.nodes.length === 0 || !data.links || data.links.length === 0) {
        return;
    }

    let nodes, links;
    try {
        ({nodes, links} = sankeyLayout(data));
    } catch (e) {
        console.error('Sankey layout error:', e);
        return;
    }

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
            const category = d.source.id.split('_').slice(2).join('_');
            return clusterColorStore.getColor(category);
        });

    gradients
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (d) => {
            const category = d.target.id.split('_').slice(2).join('_');
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
            const category = d.id.split('_').slice(2).join('_');
            return clusterColorStore.getColor(category);
        })
        .attr('fill-opacity', 0.8) // Added transparency to nodes
        .append('title')
        .text((d) => {
            const originalValue = Math.max(
                d3.sum(d.sourceLinks, (l) => l.originalValue),
                d3.sum(d.targetLinks, (l) => l.originalValue)
            );
            const cellType = cellTypeMap.get(d.id);
            const labelName = cellType || d.id.split('_').slice(2).join('_');
            return `${labelName}\n${originalValue}`;
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
        .text((d) => {
            const cellType = cellTypeMap.get(d.id);
            return cellType || d.id.split('_').slice(2).join('_');
        });
};

const Sankey = observer(() => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [currentPath, setCurrentPath] = React.useState<string[]>([]);

    useEffect(() => {
        if (svgRef.current && myCategories.length > 0 && cellStore.selected_action_id) {
            const sankeyData = convertDataForSankey(myCategories, cellStore.selected_action_id);
            setCurrentPath(getActionPath(cellStore.selected_action_id));

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
    }, [myCategories, cellStore.selected_action_id]);

    return (
        <div className='sankey-root'>
            <div className='sankey-title'>
                <div>Label Flow View</div>
                <div className='action-path'>
                    {currentPath.map((actionId, index) => {
                        // Extract number from "action_X"
                        const numMatch = actionId.match(/\d+/);
                        const label = numMatch ? `A${numMatch[0]}` : actionId;
                        return (
                            <React.Fragment key={actionId}>
                                <div className='action-node' title={actionId}>
                                    {label}
                                </div>
                                {index < currentPath.length - 1 && <span className='action-arrow'>→</span>}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <div className='sankey-body'>
                <svg ref={svgRef} style={{width: '100%', height: '100%'}}></svg>
            </div>
        </div>
    );
});

export default Sankey;
