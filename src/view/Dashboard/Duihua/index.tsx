import React, {useState, useLayoutEffect, useRef} from 'react';
import './index.less';
import {Trash, List, PaperPlaneTilt, Robot, User, CaretDown, CaretUp} from '@phosphor-icons/react';
import {initialMessages, Message} from '@/store/conversationData';

const MessageBubble = ({msg}: {msg: Message}) => {
    const [expanded, setExpanded] = useState(false);
    const textRef = useRef<HTMLPreElement>(null);
    const [showExpandIcon, setShowExpandIcon] = useState(false);

    useLayoutEffect(() => {
        if (textRef.current) {
            // Check if the actual text height is larger than the clamped height
            if (textRef.current.scrollHeight > 120) {
                // 100px is the max-height
                setShowExpandIcon(true);
            }
        }
    }, [msg.text]);

    return (
        <div className={`message-bubble ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className='message-content-wrapper'>
                <pre ref={textRef} style={{marginTop: 0, marginBottom: 0}}>
                    {msg.text}
                </pre>
            </div>
            {showExpandIcon && (
                <div className='expand-icon-wrapper' onClick={() => setExpanded(!expanded)}>
                    {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </div>
            )}
        </div>
    );
};

const Duihua = () => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [navMarkers, setNavMarkers] = useState<{top: number; index: number; content: string}[]>([]);
    const [svgHeight, setSvgHeight] = useState(0);
    const messageListRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (messageListRef.current) {
            const userMessages = Array.from(messageListRef.current.querySelectorAll('.message-item.user'));

            // Extract the user messages from state to match with DOM elements
            const userMessagesData = messages.filter((msg) => msg.sender === 'user');

            const markers = userMessages.map((el, idx) => {
                return {
                    top: (el as HTMLElement).offsetTop + 12, // Align with avatar
                    index: idx + 1,
                    content: userMessagesData[idx]?.content || `A${idx + 1}`
                };
            });
            setNavMarkers(markers);
            setSvgHeight(messageListRef.current.scrollHeight);
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages([...messages, {id: Date.now(), text: inputValue, sender: 'user', content: ''}]);
        setInputValue('');
    };

    return (
        <div className='duihua-root'>
            <div className='duihua-title'>
                <span>Chat Panel</span>
                <Trash size={16} className='refresh-icon' />
            </div>
            <div className='duihua-body'>
                <div className='message-list' ref={messageListRef}>
                    <div className='navigation-line'>
                        <svg width='24' height={svgHeight}>
                            <line x1='13' y1='0' x2='13' y2={svgHeight} stroke='#ccc' strokeWidth='1' />
                            {navMarkers.map((marker) => (
                                <g key={marker.index} transform={`translate(15, ${marker.top})`}>
                                    <circle r='9' fill='#e0e0e0' />
                                    <text textAnchor='middle' dy='.4em' fontSize='0.65rem' fontWeight={500}>
                                        {marker.content}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-item ${msg.sender}`}>
                            <div className='avatar-icon'>
                                {msg.sender === 'agent' ? (
                                    <Robot size={16} weight='regular' />
                                ) : (
                                    <User size={16} weight='regular' />
                                )}
                            </div>
                            {/* <div className='message-bubble'>{msg.text}</div> */}
                            <MessageBubble msg={msg} />
                        </div>
                    ))}
                </div>
                <div className='input-area'>
                    <List size={16} className='action-icon' />
                    <input
                        className='input-field'
                        placeholder='How can I help you?'
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <PaperPlaneTilt size={16} className='send-icon' onClick={handleSend} />
                </div>
            </div>
        </div>
    );
};

export default Duihua;
