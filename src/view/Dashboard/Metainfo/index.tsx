import React from 'react';
import './index.less';
import SvgIcon from '@/components/SvgIcon';

const tableData = [
    {label: 'Donor_Info', value: 'Male,62', icon: 'donor'},
    {label: 'Tissue_Source', value: 'Lung', icon: 'lung'},
    {label: 'Disease_Status', value: 'NSCLC', icon: 'loop'}, // Using loop as a placeholder
    {label: 'Treatment', value: 'Anti-PD-1 Immunotherapy,4weeks', icon: 'treatment'},
    {label: 'Processing', value: '10x Genomics Chromium v3.1', icon: 'sample'},
    {label: 'Sample_Time', value: '2024/5/10', icon: 'date'}
];

const Metainfo = () => {
    return (
        <div className='metainfo-root'>
            <div className='metainfo-title'>MetaData View</div>
            <div className='metainfo-body'>
                <div className='metainfo-selection'>
                    <div className='selection-item'>
                        <label className='selection-label'>Dataset:</label>
                        <select className='selection-input'>
                            <option value='Batch1'>Batch1</option>
                        </select>
                    </div>
                    <div className='selection-item'>
                        <label className='selection-label'>Model:</label>
                        <select className='selection-input'>
                            <option value='QWEN3MAX'>QWEN3MAX</option>
                        </select>
                    </div>
                </div>
                <div className='metainfo-table'>
                    {tableData.map((row, index) => (
                        <div className='table-row' key={index}>
                            <div className='table-label'>{row.label}</div>
                            <div className='table-value'>{row.value}</div>
                            <div className='table-icon'>
                                <SvgIcon svgName={row.icon} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Metainfo;
