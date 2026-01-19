import React from 'react';
import {observer} from 'mobx-react-lite';
import './index.less';

const Dashboard = () => {
    return (
        <div className='dashboard-root'>
            <span className='header-root'> 1 </span>
            <span className='view1'> 2 </span>
            <span className='view2'> 3 </span>
            <span className='view3'> 4 </span>
        </div>
    );
};

export default observer(Dashboard);
