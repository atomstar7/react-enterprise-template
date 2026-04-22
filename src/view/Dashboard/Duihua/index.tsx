import React, {useState, useLayoutEffect, useRef} from 'react';
import './index.less';
import {Trash, List, PaperPlaneTilt, Robot, User, CaretDown, CaretUp, X} from '@phosphor-icons/react';
import {initialMessages, Message} from '@/store/conversationData';
import {cellStore} from '@/store/CellData';
import {observer} from 'mobx-react-lite';

const MessageBubble = ({msg, onHeightChange}: {msg: Message; onHeightChange?: () => void}) => {
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

    const toggleExpand = () => {
        setExpanded(!expanded);
        // Notify parent of potential height change after a small delay to allow CSS transition
        if (onHeightChange) {
            setTimeout(onHeightChange, 350); // Match or exceed CSS transition time
        }
    };

    return (
        <div className={`message-bubble ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className='message-content-wrapper'>
                <pre ref={textRef} style={{marginTop: 0, marginBottom: 0}}>
                    {msg.text}
                </pre>
            </div>
            {showExpandIcon && (
                <div className='expand-icon-wrapper' onClick={toggleExpand}>
                    {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
                </div>
            )}
        </div>
    );
};

const Duihua = observer(() => {
    const [messages, setMessages] = useState<Message[]>(initialMessages.filter((msg) => msg.id !== 7 && msg.id !== 8));
    const [inputValue, setInputValue] = useState('');
    const [navMarkers, setNavMarkers] = useState<{top: number; index: number; content: string}[]>([]);
    const [svgHeight, setSvgHeight] = useState(0);
    const messageListRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const updateLayout = () => {
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
    };

    useLayoutEffect(() => {
        updateLayout();

        // Use ResizeObserver to detect changes in children's sizes (e.g. expanding bubbles)
        const observer = new ResizeObserver(() => {
            updateLayout();
        });

        if (messageListRef.current) {
            observer.observe(messageListRef.current);
            // Also observe children to ensure we catch all height changes
            Array.from(messageListRef.current.children).forEach((child) => {
                observer.observe(child);
            });
        }

        return () => observer.disconnect();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() && cellStore.chat_panel_actions.length === 0) return;

        let fullMessage = inputValue;
        if (cellStore.chat_panel_actions.length > 0) {
            const actionText = cellStore.chat_panel_actions
                .map((id) => {
                    if (id === 'root' || id === 'virtual_root') return '(root)';
                    if (id.startsWith('gene_')) return `(${id.replace('gene_', '')})`;
                    const numMatch = id.match(/\d+/);
                    return numMatch ? `(action${numMatch[0]})` : `(${id})`;
                })
                .join(' ');
            fullMessage = `${actionText} ${inputValue}`.trim();
            cellStore.clearChatPanelActions();
        }

        setMessages([...messages, {id: Date.now(), text: fullMessage, sender: 'user', content: 'G'}]);
        setInputValue('');

        if (fullMessage.startsWith('(action7)')) {
            setTimeout(() => {
                cellStore.setShowAction8(true);
            }, 3000); // Wait a few seconds before rendering action8
        }

        const msg8 = initialMessages.find((m) => m.id === 8);
        if (msg8 && !messages.some((m) => m.id === 8)) {
            setTimeout(() => {
                setMessages((prev) => [...prev, msg8]);
            }, 1500);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
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
                            <MessageBubble msg={msg} onHeightChange={updateLayout} />
                        </div>
                    ))}
                </div>
                <div className='input-area'>
                    <List size={16} className='action-icon' />
                    <div
                        className={`input-wrapper ${isDragging ? 'dragging' : ''}`}
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    >
                        {cellStore.chat_panel_actions.length > 0 && (
                            <div className='action-tags'>
                                {cellStore.chat_panel_actions.map((actionId) => {
                                    const numMatch = actionId.match(/\d+/);
                                    const label =
                                        actionId === 'root' || actionId === 'virtual_root'
                                            ? 'root'
                                            : actionId.startsWith('gene_')
                                              ? actionId.replace('gene_', '')
                                              : numMatch
                                                ? `action${numMatch[0]}`
                                                : actionId;
                                    return (
                                        <div key={actionId} className='action-tag'>
                                            <span>({label})</span>
                                            <X
                                                size={12}
                                                className='remove-tag'
                                                onClick={() => cellStore.removeChatPanelAction(actionId)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <input
                            className='input-field'
                            placeholder={cellStore.chat_panel_actions.length > 0 ? '' : 'How can I help you?'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                    </div>
                    <PaperPlaneTilt size={16} className='send-icon' onClick={handleSend} />
                </div>
            </div>
        </div>
    );
});

export default Duihua;
