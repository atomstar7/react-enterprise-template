import React from 'react';
import {Select, Space} from 'antd';
import {SettingOutlined} from '@ant-design/icons';
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
            <div className='header-title'>CellDecipher</div>
            <div className='header-right-content'>
                <div className='header-controls'>
                    <Space wrap>
                        <Select
                            defaultValue='PBMC'
                            style={{width: 140}}
                            onChange={handleDataChange}
                            options={[{value: 'PBMC', label: 'PBMC'}]}
                        />
                        <Select
                            defaultValue='Gemini'
                            style={{width: 140}}
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
                    <SettingOutlined style={{fontSize: '20px'}} />
                </div>
            </div>
        </div>
    );
};

export default Header;
