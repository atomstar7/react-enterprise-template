import React, {useState} from 'react';
import './index.less';
import {ArrowsClockwise, List, PaperPlaneTilt, ChatCircleDots} from '@phosphor-icons/react';

const Duihua = () => {
    const [messages, setMessages] = useState([{id: 1, text: 'Hello, how can I help you?', sender: 'agent'}]);
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages([...messages, {id: Date.now(), text: inputValue, sender: 'user'}]);
        setInputValue('');
    };

    return (
        <div className='duihua-root'>
            <div className='duihua-title'>
                <span>Agent</span>
                <ArrowsClockwise size={18} className='refresh-icon' />
            </div>
            <div className='duihua-body'>
                <div className='message-list'>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-item ${msg.sender}`}>
                            <div className='avatar-icon'>
                                <ChatCircleDots size={24} weight='regular' />
                            </div>
                            <div className='message-bubble'>{msg.text}</div>
                        </div>
                    ))}
                </div>
                <div className='input-area'>
                    <List size={20} className='action-icon' />
                    <input
                        className='input-field'
                        placeholder='How can I'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <PaperPlaneTilt size={20} className='send-icon' onClick={handleSend} />
                </div>
            </div>
        </div>
    );
};

export default Duihua;
