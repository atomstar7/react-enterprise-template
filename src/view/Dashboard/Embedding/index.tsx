import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import {fetchUmapCoords, fetchUmapCategory} from '@/api/viewRequest';
import './index.less';

const data = [
    [-0.5887772, 9.524016],
    [-9.612331, 10.560163],
    [-0.134014, 12.059124],
    [0.289136, 11.875069],
    [1.7473782, 10.210354],
    [-1.1671625, 10.777444],
    [1.5217464, 10.428257],
    [-0.8035071, 8.652312],
    [-9.136385, 9.94536],
    [3.369186, 9.381034],
    [5.0337524, 7.453372],
    [1.3422036, 9.939638],
    [5.9299955, 8.522125],
    [2.180676, 11.350823],
    [-0.59812576, 9.164523],
    [5.684437, 7.8127007],
    [3.3416433, 10.2679],
    [1.5538999, 10.805606],
    [-9.172018, 10.884917],
    [2.9921079, 11.10517],
    [4.6981664, 7.151026],
    [1.7706531, 9.743687],
    [1.9923451, 11.581307],
    [5.3208838, 8.429524],
    [1.0696388, 9.598573],
    [0.47799107, 9.787508],
    [1.6367396, 11.22644],
    [5.0730577, 9.42832],
    [-9.71648, 10.051081],
    [2.5788517, 9.339368],
    [5.7681994, 8.394914],
    [4.728689, 6.707519],
    [0.15650989, 11.629514],
    [0.5988483, 11.279026],
    [1.9418284, 12.326042],
    [0.02860917, 9.99795],
    [-0.28589424, 9.21423],
    [5.492426, 7.0700707],
    [-9.400113, 9.9391575],
    [4.5930905, 7.9114256],
    [1.6084315, 9.173308],
    [4.9472766, 6.720429],
    [2.079362, 9.16269],
    [-0.08645279, 10.881103],
    [-0.1536621, 12.542744],
    [1.930729, 11.129511],
    [5.761117, 8.132736],
    [4.314207, 7.249171],
    [1.451106, 8.755182],
    [2.467702, 8.934615],
    [4.7891855, 8.982189],
    [0.7984878, 10.345344],
    [0.72019506, 8.581042],
    [-0.6886351, 10.540972],
    [-1.0469493, 9.9131365],
    [-8.789959, 10.577986],
    [6.2769833, 8.828574],
    [1.0365448, 11.164405],
    [-9.639867, 10.254236],
    [-1.1184995, 11.475255],
    [0.7741688, 11.187476],
    [-0.22171454, 10.707387],
    [-1.1591783, 9.305293],
    [-0.7076031, 10.09964],
    [1.3277221, 8.537835],
    [6.14894, 7.4985933],
    [5.932393, 9.2924185],
    [1.2597946, 12.403432],
    [4.9362206, 8.257953],
    [-0.77744085, 11.674365],
    [1.5670241, 12.042207],
    [6.543628, 8.110805],
    [4.124763, 8.747224],
    [5.494669, 9.215925],
    [0.8569157, 10.002211],
    [-0.12300164, 10.270736],
    [5.1443043, 7.715328],
    [0.57549846, 9.560488],
    [0.3447246, 11.022922],
    [-1.2054285, 9.462257],
    [0.18816172, 9.393658],
    [-1.559191, 10.542649],
    [-0.21309362, 9.816202],
    [-9.683079, 10.619404],
    [2.9670079, 10.584184],
    [0.7202191, 12.272869],
    [1.3507184, 9.231225],
    [-0.5615987, 12.254138],
    [-0.45769814, 11.340795],
    [2.4191718, 10.145419],
    [0.928758, 8.382497],
    [-8.986797, 10.129934],
    [0.20280066, 8.920727],
    [0.06394465, 8.538816],
    [2.4858558, 11.77759],
    [-0.5473145, 10.983842],
    [3.5757003, 10.564189],
    [2.6504738, 9.983193],
    [2.5835993, 10.5350895],
    [1.9768268, 10.493092],
    [2.2333364, 9.821812],
    [6.2447534, 8.958011],
    [-8.907524, 10.288842],
    [0.18059337, 10.691884],
    [5.689247, 8.997599],
    [-1.0381925, 8.880884],
    [-9.609583, 9.5922575],
    [1.1972513, 11.830169],
    [5.6373563, 7.480857],
    [0.47813398, 9.261704],
    [6.3582573, 8.305482]
];
const categories = ['blood', 'brain', 'bone'];

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

    // Draw connections between centroids
    const trianglePath = d3
        .line()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]))
        .curve(d3.curveLinearClosed);

    svg.append('path')
        .datum(centroids)
        .attr('d', trianglePath)
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('stroke-width', 2);

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
                // Fetch coordinates
                const coordsResponse = await fetchUmapCoords();
                if (coordsResponse.data.status !== 200) {
                    throw new Error('Failed to fetch Umap coords: ' + coordsResponse.message);
                }
                // The API returns an array of objects {x: number, y: number}, we need to convert it to number[][]
                const coordsData = coordsResponse.data.data.map((p) => [p.x, p.y]);
                setCoords(coordsData);

                const categoryResponse = await fetchUmapCategory('leiden');
                if (categoryResponse.status !== 200) {
                    throw new Error('Failed to fetch Umap category: ' + categoryResponse.message);
                }
                setCategory(categoryResponse.data.data);

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

        // Re-draw on resize
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
