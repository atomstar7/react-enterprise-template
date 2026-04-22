// @ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import InnerGraph from '../InnerGraph';
import {Node} from '@/api/viewRequest';
import {cellStore} from '@/store/CellData';
import './index.less';

interface RingNodeGlyphProps {
    nodeData: Node;
    refreshDag: () => void;
}

const RingNodeGlyph: React.FC<RingNodeGlyphProps> = ({nodeData}) => {
    const gRef = useRef(null);
    const [g, setG] = useState<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
    const [contextMenu, setContextMenu] = useState<{visible: boolean; x: number; y: number} | null>(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);
        setG(g);

        const innerRadius = 24;
        const outerRadius = 40;

        // Scale for the sector radius based on the score
        const radiusScale = d3.scaleLinear().domain([0, 1]).range([innerRadius, outerRadius]);

        const pie = d3
            .pie<any>()
            .value((d: any) => d.count) // Evenly sized sectors
            .padAngle(0.05);

        // Arc generator now uses the radius scale for the outer radius
        const arc = d3
            .arc<any>()
            .innerRadius(innerRadius)
            .outerRadius((d) => radiusScale(d.data.score));

        const clusterScores = nodeData.cluster_score || [];

        const arcs = g.selectAll('.arc').data(pie(clusterScores)).enter().append('g').attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', (d) => d.data.color); // Use color from data

        // Add text labels to each sector
        // arcs.append('text')
        //     .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
        //     .attr('dy', '0.35em')
        //     .attr('text-anchor', 'middle')
        //     .style('font-size', '10px')
        //     .style('fill', '#333')
        //     .text((d: any) => d.data.cluster_name);

        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', 'black');
        g.append('circle').attr('r', outerRadius).attr('fill', 'none').attr('stroke', 'black');

        // Add outer ring for average score
        const avgScoreOuterRadius = outerRadius + 5;
        const avgScore = nodeData.average_score || 0;

        // Background for the outer ring
        const backgroundArc = d3
            .arc()
            .innerRadius(outerRadius)
            .outerRadius(avgScoreOuterRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        g.append('path').attr('d', backgroundArc).attr('fill', '#e0e0e0');

        // Foreground arc representing the score
        const scoreArc = d3
            .arc()
            .innerRadius(outerRadius)
            .outerRadius(avgScoreOuterRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI * avgScore);

        g.append('path').attr('d', scoreArc).attr('fill', '#999999');

        return () => {
            g.selectAll('*').remove();
        };
    }, [nodeData]);

    const handleGlyphClick = () => {
        // Update the global selected_action_id in cellStore
        cellStore.setSelectedActionId(nodeData.id);
        // alert(`Selected Action ID updated to: ${nodeData.id}`);
        setContextMenu(null); // Close context menu on left click
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        // Prevent default browser context menu
        e.preventDefault();
        // Stop event from bubbling up to document and triggering handleClickOutside
        e.stopPropagation();

        // Use client coordinates for fixed positioning
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            // Only close if we actually have a menu open
            if (contextMenu?.visible) {
                setContextMenu(null);
            }
        };

        // Important: Wait a tick before attaching listeners to prevent immediate closure
        // from the click event that opened it
        let timeoutId: ReturnType<typeof setTimeout>;

        if (contextMenu?.visible) {
            timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
                document.addEventListener('contextmenu', handleClickOutside);
            }, 10);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('contextmenu', handleClickOutside);
        };
    }, [contextMenu]);

    const handleMenuAction = (action: string) => {
        console.log(`Action ${action} triggered for ${nodeData.id}`);
        if (action === 'add_to_chat') {
            cellStore.addChatPanelAction(nodeData.id);
        }

        setContextMenu(null);
    };

    return (
        <>
            <g ref={gRef} onClick={handleGlyphClick} onContextMenu={handleContextMenu} style={{cursor: 'pointer'}}>
                {g && nodeData.innerGraphData && <InnerGraph g={g} data={nodeData.innerGraphData} />}
            </g>
            <ContextMenuPortal contextMenu={contextMenu} handleMenuAction={handleMenuAction} nodeId={nodeData.id} />
        </>
    );
};

// Extract context menu to a portal so it's rendered outside the SVG transform hierarchy
// This fixes positioning issues when the SVG is scaled/panned
import {createPortal} from 'react-dom';

export const ContextMenuPortal = ({
    contextMenu,
    handleMenuAction,
    nodeId
}: {
    contextMenu: {visible: boolean; x: number; y: number} | null;
    handleMenuAction: (action: string) => void;
    nodeId: string;
}) => {
    if (!contextMenu?.visible) return null;

    return createPortal(
        <div
            className='glyph-context-menu'
            style={{
                left: contextMenu.x,
                top: contextMenu.y,
                position: 'fixed', // Ensure it's fixed to the viewport
                zIndex: 9999
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className='menu-item' onClick={() => handleMenuAction('add_to_chat')}>
                Add to Chat Panel
            </div>
        </div>,
        document.body
    );
};

export default RingNodeGlyph;
