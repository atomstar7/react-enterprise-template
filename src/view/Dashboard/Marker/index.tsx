import React, {useState} from 'react';
import {Select} from 'antd';
import './index.less';
import paper1 from '@/assets/paper/1.png';
import paper2 from '@/assets/paper/2.png';

interface PaperInfo {
    id: string;
    title: string;
    year: string;
    citation: string;
    field: string;
    authors: string;
    doi: string;
    analysis: string;
    images: string[];
}

const papers: PaperInfo[] = [
    {
        id: '1',
        title: 'Single-cell analysis of human pancreas',
        year: '2016',
        citation: '125',
        field: 'Biology',
        authors: 'Muraro et al.',
        doi: '10.1016/j.cels.2016.09.002',
        analysis: 'This paper analyzed the single-cell transcriptome of human pancreas using scRNA-seq technology.',
        images: [paper1, paper2]
    },
    {
        id: '2',
        title: 'Another interesting paper about cells',
        year: '2018',
        citation: '89',
        field: 'Bioinformatics',
        authors: 'Smith et al.',
        doi: '10.1038/s41586-018-0000-0',
        analysis: 'This paper analyzed the single-cell transcriptome of human pancreas using scRNA-seq technology.',
        images: [paper2, paper1]
    }
];

const Marker = () => {
    const [selectedPaperId, setSelectedPaperId] = useState<string>(papers[0].id);
    const selectedPaper = papers.find((p) => p.id === selectedPaperId) || papers[0];

    const handlePaperChange = (value: string) => {
        setSelectedPaperId(value);
    };

    return (
        <div className='marker-root'>
            <div className='marker-title'>Paper Check View</div>
            <div className='marker-header-select'>
                <Select
                    style={{width: '100%'}}
                    value={selectedPaperId}
                    onChange={handlePaperChange}
                    options={papers.map((p) => ({value: p.id, label: p.title}))}
                />
            </div>
            <div className='marker-content'>
                <div className='marker-left-panel'>
                    <div className='image-list-container'>
                        {selectedPaper.images.map((img, index) => (
                            <div key={index} className='image-item-wrapper'>
                                <img src={img} alt={`Paper figure ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className='marker-right-panel'>
                    <div className='paper-info'>
                        <div className='info-item'>
                            <span className='label'>Year:</span>
                            <span className='value'>{selectedPaper.year}</span>
                        </div>
                        <div className='info-item'>
                            <span className='label'>Citation:</span>
                            <span className='value'>{selectedPaper.citation}</span>
                        </div>
                        <div className='info-item'>
                            <span className='label'>Field:</span>
                            <span className='value'>{selectedPaper.field}</span>
                        </div>
                        <div className='info-item'>
                            <span className='label'>Authors:</span>
                            <span className='value'>{selectedPaper.authors}</span>
                        </div>
                        <div className='info-item'>
                            <span className='label'>Doi:</span>
                            <span className='value'>{selectedPaper.doi}</span>
                        </div>
                        <div className='info-item'>
                            <span className='label'>analysis:</span>
                            <span className='value'>{selectedPaper.analysis}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Marker;
