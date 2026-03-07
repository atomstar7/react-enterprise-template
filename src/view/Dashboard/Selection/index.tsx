import React from 'react';
import './index.less';
import RingNodeDag from './RingNodeDag';

const Selection = () => {
    return (
        <div className='selection-root'>
            <div className='selection-title'>Action OverView</div>
            <div className='selection-body'>
                <RingNodeDag />
            </div>
        </div>
    );
};

export default Selection;
