import React from 'react';
import {observer} from 'mobx-react-lite';
import './index.less';
import Header from './Header';
import Embedding from './Embedding';
import Selection from './Selection';
import Combination from './Combination';
import Duihua from './Duihua';
import Sankey from './Sankey';

const Dashboard = () => {
    return (
        <div className='dashboard-root'>
            <div className='header'>
                <Header />
            </div>
            <div className='embedding'>
                <Embedding />
            </div>
            <div className='table'>
                <Combination />
            </div>
            <div className='selection'>
                <Selection />
            </div>
            <div className='sankey'>
                <Sankey />
            </div>
            <div className='duihua'>
                <Duihua />
            </div>
        </div>
    );
};

export default observer(Dashboard);
