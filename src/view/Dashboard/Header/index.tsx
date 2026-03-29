import React from 'react';
import {Select, Space} from 'antd';
import {SettingOutlined} from '@ant-design/icons';
import SvgIcon from '@/components/SvgIcon';
import './index.less';

const Header = () => {
    const handleDataChange = (value: string) => {
        console.log(`selected data: ${value}`);
    };

    const handleModelChange = (value: string) => {
        console.log(`selected model: ${value}`);
    };

    return (
        <div className='header-root'>
            <div className='header-left-content'>
                <SvgIcon svgName='cell' svgClass='header-logo' color='#333' />
                <div className='header-title'>CellDecipher</div>
            </div>
            <div className='header-right-content'>
                <div className='header-controls'>
                    <Space wrap>
                        <Select
                            defaultValue='PBMC'
                            style={{width: 100, height: 22, fontSize: '0.75rem'}}
                            onChange={handleDataChange}
                            options={[{value: 'PBMC', label: 'PBMC'}]}
                        />
                        <Select
                            defaultValue='Gemini'
                            style={{width: 100, height: 22, fontSize: '0.75rem'}}
                            onChange={handleModelChange}
                            options={[
                                {value: 'Qwen', label: 'Qwen'},
                                {value: 'Gemini', label: 'Gemini'},
                                {value: 'GPT4o', label: 'GPT4o'}
                            ]}
                        />
                    </Space>
                </div>
                <div className='header-actions'>
                    <SettingOutlined style={{fontSize: '1rem'}} />
                </div>
            </div>
        </div>
    );
};

export default Header;
