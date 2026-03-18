import React, {useState, useLayoutEffect, useRef} from 'react';
import './index.less';
import {Trash, List, PaperPlaneTilt, Robot, User} from '@phosphor-icons/react';
import {initialMessages, Message} from '@/store/conversationData';

const Duihua = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [navMarkers, setNavMarkers] = useState<{top: number; index: number}[]>([]);
    const [svgHeight, setSvgHeight] = useState(0);
    const messageListRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (messageListRef.current) {
            const userMessages = Array.from(messageListRef.current.querySelectorAll('.message-item.user'));
            let userMessageIndex = 0;
            const markers = userMessages.map((el) => {
                userMessageIndex++;
                return {
                    top: (el as HTMLElement).offsetTop + 12, // Align with avatar
                    index: userMessageIndex
                };
            });
            setNavMarkers(markers);
            setSvgHeight(messageListRef.current.scrollHeight);
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages([...messages, {id: Date.now(), text: inputValue, sender: 'user'}]);
        setInputValue('');
    };

    return (
        <div className='duihua-root'>
            <div className='duihua-title'>
                <span>Agent</span>
                <Trash size={18} className='refresh-icon' />
            </div>
            <div className='duihua-body'>
                <div className='message-list' ref={messageListRef}>
                    <div className='navigation-line'>
                        <svg width='30' height={svgHeight}>
                            <line x1='15' y1='0' x2='15' y2={svgHeight} stroke='#ccc' strokeWidth='1' />
                            {navMarkers.map((marker) => (
                                <g key={marker.index} transform={`translate(15, ${marker.top})`}>
                                    <circle r='8' fill='white' stroke='#ccc' strokeWidth='1' />
                                    <text textAnchor='middle' dy='.3em' fontSize='10'>
                                        {marker.index}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-item ${msg.sender}`}>
                            <div className='avatar-icon'>
                                {msg.sender === 'agent' ? (
                                    <Robot size={24} weight='regular' />
                                ) : (
                                    <User size={24} weight='regular' />
                                )}
                            </div>
                            <div className='message-bubble'>{msg.text}</div>
                        </div>
                    ))}
                </div>
                <div className='input-area'>
                    <List size={20} className='action-icon' />
                    <input
                        className='input-field'
                        placeholder='How can I help you?'
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
