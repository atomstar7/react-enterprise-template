import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {ContextMenuPortal} from '../RingNodeGlyph';
import {cellStore} from '@/store/CellData';
import '../RingNodeGlyph/index.less';

const GreyGlyph: React.FC = () => {
    const gRef = useRef(null);
    const [contextMenu, setContextMenu] = useState<{visible: boolean; x: number; y: number} | null>(null);

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);

        const innerRadius = 24;
        const outerRadius = 40;
        const avgScoreOuterRadius = outerRadius + 5;

        // Inner circle
        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', '#ccc');

        // Outer ring (the area for sectors in the other glyph)
        const mainArc = d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        g.append('path').attr('d', mainArc).attr('fill', '#f0f0f0');

        // Avg score ring
        const avgScoreArc = d3
            .arc()
            .innerRadius(outerRadius)
            .outerRadius(avgScoreOuterRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        g.append('path').attr('d', avgScoreArc).attr('fill', '#e0e0e0');

        // Outer border
        g.append('circle').attr('r', avgScoreOuterRadius).attr('fill', 'none').attr('stroke', '#ccc');

        // Add inner content for unclustered cells
        const unclusteredRadius = innerRadius - 10;
        g.append('circle').attr('r', unclusteredRadius).attr('fill', '#e0e0e0');

        // // Generate points within the unclustered circle
        // const numPoints = 15;
        // const pointRadius = 3;
        // const points = d3.range(numPoints).map(() => {
        //     const angle = Math.random() * 2 * Math.PI;
        //     const radius = Math.sqrt(Math.random()) * (unclusteredRadius - pointRadius);
        //     return {x: radius * Math.cos(angle), y: radius * Math.sin(angle)};
        // });

        // g.selectAll('.unclustered-point')
        //     .data(points)
        //     .enter()
        //     .append('circle')
        //     .attr('class', 'unclustered-point')
        //     .attr('cx', (d) => d.x)
        //     .attr('cy', (d) => d.y)
        //     .attr('r', pointRadius)
        //     .attr('fill', '#888');

        return () => {
            g.selectAll('*').remove();
        };
    }, []);

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
        console.log(`Action ${action} triggered for root node`);
        if (action === 'add_to_chat') {
            cellStore.addChatPanelAction('root');
        }

        setContextMenu(null);
    };

    return (
        <>
            <g ref={gRef} onContextMenu={handleContextMenu} style={{cursor: 'context-menu'}} />
            <ContextMenuPortal contextMenu={contextMenu} handleMenuAction={handleMenuAction} nodeId='virtual_root' />
        </>
    );
};

export default GreyGlyph;
