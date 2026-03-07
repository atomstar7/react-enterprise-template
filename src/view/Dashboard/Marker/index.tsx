import React, {useState} from 'react';
import {Checkbox} from 'antd';
import LineChart from './LineChart';
import BarChart from './BarChart';
import './index.less';

interface MarkerData {
    id: string;
    name: string;
    lineData: {
        red: number;
        black: number;
    };
    barData: number[];
}

// Helper to generate just the peak value
const generatePeakValue = () => {
    return Math.random() * 0.8 + 0.2; // Peak value between 0.2 and 1.0
};

// Helper to generate bar data with 10 bars
const generateBarData = () => {
    return Array.from({length: 10}, () => Math.random());
};

const mockData: MarkerData[] = [
    {
        id: '1',
        name: 'CD34',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '2',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '3',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '4',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '5',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '6',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '7',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '8',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    },
    {
        id: '9',
        name: 'CDx',
        lineData: {red: generatePeakValue(), black: generatePeakValue()},
        barData: generateBarData()
    }
];

const Marker = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const allSelected = selected.length === mockData.length;

    const handleSelectAll = (e: {target: {checked: any}}) => {
        setSelected(e.target.checked ? mockData.map((item) => item.id) : []);
    };

    const handleSelect = (id: string) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    return (
        <div className='marker-root'>
            <div className='marker-title'>
                <Checkbox checked={allSelected} onChange={handleSelectAll} />
                <span className='title-text'>Marker List View</span>
            </div>
            <div className='marker-body'>
                <div className='marker-table'>
                    {mockData.map((item) => (
                        <div key={item.id} className='marker-row'>
                            <div className='marker-cell marker-name'>
                                <Checkbox checked={selected.includes(item.id)} onChange={() => handleSelect(item.id)} />
                                <span>{item.name}</span>
                            </div>
                            <div className='marker-cell marker-line-chart'>
                                <LineChart data={item.lineData} width={60} height={45} />
                            </div>
                            <div className='marker-cell marker-bar-chart'>
                                <BarChart data={item.barData} width='100%' height={45} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Marker;
