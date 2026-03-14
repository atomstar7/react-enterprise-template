import React from 'react';
import {observer} from 'mobx-react-lite';
import './index.less';
import Metainfo from './Metainfo';
import Header from './Header';
import Embedding from './Embedding';
import Selection from './Selection';
import Combination from './Combination';
// import Marker from './Marker';
import Duihua from './Duihua';

const Dashboard = () => {
    return (
        <div className='dashboard-root'>
            <div className='header'>
                <Header />
            </div>
            <div className='metainfo'>
                <Metainfo />
            </div>
            <div className='embedding'>
                <Embedding />
            </div>
            <div className='selection'>
                <Selection />
            </div>
            <div className='combination'>
                <Combination />
            </div>
            {/* <div className='marker'>
                <Marker />
            </div> */}
            <div className='duihua'>
                <Duihua />
            </div>
        </div>
    );
};

export default observer(Dashboard);
