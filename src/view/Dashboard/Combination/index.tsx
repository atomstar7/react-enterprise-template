import React from 'react';
import {Table} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import './index.less';

interface Marker {
    label: string;
    gene: string;
    bgColor: string;
}

interface Combination {
    id: string;
    markers: Marker[];
    f1Score: number;
}

interface TableRow {
    key: string;
    clusterId: string;
    markerLabel: string;
    markerGene: string;
    markerBgColor: string;
    f1Score: number;
    rowSpan: number;
    isGroupEnd: boolean;
}

const mockData: Combination[] = [
    {
        id: '#1',
        markers: [
            {label: 'CD1', gene: 'ENSMICG00000034860', bgColor: '#fce4ec'},
            {label: 'CD2', gene: 'ENSMICG00000034861', bgColor: '#d1c4e9'},
            {label: 'CD2', gene: 'ENSMICG00000034861', bgColor: '#d1c4e9'}
        ],
        f1Score: 0.71
    },
    {
        id: '#2',
        markers: [
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'},
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'}
        ],
        f1Score: 0.98
    },
    {
        id: '#3',
        markers: [
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'},
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'}
        ],
        f1Score: 0.98
    },
    {
        id: '#4',
        markers: [
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'},
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'}
        ],
        f1Score: 0.98
    },
    {
        id: '#5',
        markers: [
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'},
            {label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'}
        ],
        f1Score: 0.98
    },
    {
        id: '#6',
        markers: [{label: 'CD3', gene: 'ENSMICG00000034862', bgColor: '#c5cae9'}],
        f1Score: 0.98
    }
];

// Transform hierarchical data into flat rows for antd Table
const dataSource: TableRow[] = mockData.flatMap((group, groupIndex) =>
    group.markers.map((marker, markerIndex) => ({
        key: `${groupIndex}-${markerIndex}`,
        clusterId: group.id,
        markerLabel: marker.label,
        markerGene: marker.gene,
        markerBgColor: marker.bgColor,
        f1Score: group.f1Score,
        rowSpan: markerIndex === 0 ? group.markers.length : 0,
        isGroupEnd: markerIndex === group.markers.length - 1
    }))
);

const Combination = () => {
    const columns: ColumnsType<TableRow> = [
        {
            title: 'Cluster',
            dataIndex: 'clusterId',
            key: 'clusterId',
            className: 'cluster-column',
            width: 100,
            align: 'center',
            onCell: (record) => ({
                rowSpan: record.rowSpan
            })
        },
        {
            title: () => (
                <div className='marker-header'>
                    <div>Marker Combination</div>
                </div>
            ),
            key: 'marker',
            className: 'marker-column',
            render: (_, record) => (
                <div className='marker-content'>
                    <span className='marker-label'>{record.markerLabel}</span>
                    <span className='marker-gene' style={{backgroundColor: record.markerBgColor}}>
                        {record.markerGene}
                    </span>
                </div>
            )
        },
        {
            title: 'F1_score',
            dataIndex: 'f1Score',
            key: 'f1Score',
            className: 'score-column',
            width: 120,
            align: 'center',
            onCell: (record) => ({
                rowSpan: record.rowSpan
            })
        }
    ];

    return (
        <div className='combination-root'>
            <div className='combination-title'>Combination View</div>
            <div className='combination-body'>
                <Table<TableRow>
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    bordered
                    scroll={{y: 320}} // Let CSS handle the overflow within the constrained container
                    rowClassName={(record) => (record.isGroupEnd ? 'group-row-end' : '')}
                    size='small'
                />
            </div>
        </div>
    );
};

export default Combination;
