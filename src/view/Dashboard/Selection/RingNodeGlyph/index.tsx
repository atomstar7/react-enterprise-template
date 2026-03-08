// @ts-nocheck
import React, {useEffect, useRef, useState} from 'react';
import {Modal, Input, Form, message} from 'antd';
import * as d3 from 'd3';
import InnerGraph from '../InnerGraph';
import {seriesColor} from '@/constants/enum';
import {Node, fetchAgentResponse, AgentCall} from '@/api/viewRequest';

interface RingNodeGlyphProps {
    nodeData: Node;
    refreshDag: () => void;
}

const RingNodeGlyph: React.FC<RingNodeGlyphProps> = ({nodeData, refreshDag}) => {
    const gRef = useRef(null);
    const [g, setG] = useState<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (!gRef.current) return;

        const g = d3.select(gRef.current);
        setG(g);

        const innerRadius = 30;
        const outerRadius = 48;

        // Use seriesColor c1-cN based on the number of sectors
        const colors = Object.values(seriesColor);

        // Modified to color by index as per previous request
        const colorScale = d3.scaleOrdinal(colors);

        const pie = d3
            .pie<any>()
            .value((d: any) => d.count)
            .padAngle(0.05);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

        // Check if cluster_score exists before using it
        const clusterScores = nodeData.cluster_score || [];

        const arcs = g.selectAll('.arc').data(pie(clusterScores)).enter().append('g').attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc as any)
            .attr('fill', (d, i) => colorScale(i.toString()));

        g.append('circle').attr('r', innerRadius).attr('fill', 'none').attr('stroke', 'black');
        g.append('circle').attr('r', outerRadius).attr('fill', 'none').attr('stroke', 'black');

        const averageF1Score = nodeData.average_score || 0;

        const radiusScale = d3.scaleLinear().domain([0, 1]).range([innerRadius, outerRadius]);
        const scoreRadius = radiusScale(averageF1Score);
        g.append('circle').attr('r', scoreRadius).attr('fill', 'none').attr('stroke', 'black').attr('stroke-width', 2);

        return () => {
            g.selectAll('*').remove();
        };
    }, [nodeData]);

    const handleGlyphClick = () => {
        setIsModalVisible(true);
        // Pre-fill some fields if possible, e.g. action_id from nodeData.id
        form.setFieldsValue({
            start_action_id: nodeData.id,
            layer: 0, // Default or derived value
            user_intent: ''
        });
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values: AgentCall) => {
                try {
                    // Ensure layer is a number
                    const payload = {
                        ...values,
                        layer: Number(values.layer)
                    };

                    const response = (await fetchAgentResponse(payload)).data;
                    console.log('Agent Response:', response);
                    message.success('Request sent successfully');
                    setIsModalVisible(false);
                    // Call refreshDag to update parent data
                    refreshDag();
                } catch (err: any) {
                    console.error('Failed to fetch agent response:', err);
                    message.error('Failed to send request');
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <g ref={gRef} onClick={handleGlyphClick} style={{cursor: 'pointer'}}>
                {g && <InnerGraph g={g} radius={30} nodeCount={(nodeData.cluster_score || []).length} />}
            </g>
            <Modal title='Agent Request' open={isModalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose>
                <Form form={form} layout='vertical'>
                    <Form.Item
                        name='layer'
                        label='Layer'
                        rules={[{required: true, message: 'Please input the layer!'}]}
                    >
                        <Input type='number' />
                    </Form.Item>
                    <Form.Item
                        name='start_action_id'
                        label='Action ID'
                        rules={[{required: true, message: 'Please input the action ID!'}]}
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name='user_intent'
                        label='User Intent'
                        rules={[{required: true, message: 'Please input the user intent!'}]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RingNodeGlyph;
