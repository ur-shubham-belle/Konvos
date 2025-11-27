import React, { useState, useRef, useEffect } from 'react';
import {
    Chat,
    Channel,
    ChannelList,
    Window,
    ChannelHeader,
    MessageList,
    MessageInput,
    useChatContext,
    Message,
} from 'stream-chat-react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamCall } from '@stream-io/video-react-sdk';
import { CustomChannelListHeader } from './stream/CustomChannelListHeader';
import { UserList } from './stream/UserList';
import { CallInterface } from './stream/CallInterface';
import { CustomChannelPreview } from './stream/custom-channel-preview';
import { useAuth } from '../context/AuthContext';
import { Video, Phone, MoreVertical, Trash2, ArrowLeft, Smile } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './stream/stream-custom.css';

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '👏'];

const EmojiPicker: React.FC<{ onSelect: (emoji: string) => void; onClose: () => void }> = ({
    onSelect,
    onClose,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={ref} className="emoji-picker-container">
            <div className="emoji-grid">
                {EMOJI_LIST.map((emoji) => (
                    <button
                        key={emoji}
                        className="emoji-btn"
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ReplyBar: React.FC<{ message: any; onClear: () => void }> = ({ message, onClear }) => {
    const text = message?.text || '';
    const senderName = message?.user?.name || 'User';
    
    return (
        <div className="bg-gray-50 border-l-4 border-green-500 px-4 py-3 flex items-center justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Replying to {senderName}</p>
                <p className="text-sm text-gray-700 truncate">{text}</p>
            </div>
            <button
                onClick={onClear}
                className="ml-4 p-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
                ✕
            </button>
        </div>
    );
};

const CustomMessage: React.FC<any> = (props) => {
    const { onReply } = props;
    
    return (
        <Message 
            {...props}
            actions={props.messageActions}
            onReplyAction={() => {
                if (onReply) {
                    onReply(props.message);
                }
            }}
        />
    );
};

const EmojiInputWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showEmoji, setShowEmoji] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleEmojiSelect = (emoji: string) => {
        const inputElement = containerRef.current?.querySelector('input');
        if (inputElement) {
            const start = inputElement.selectionStart || 0;
            const end = inputElement.selectionEnd || 0;
            const text = inputElement.value;
            const newText = text.substring(0, start) + emoji + text.substring(end);
            inputElement.value = newText;
            inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            inputElement.focus();
            inputElement.setSelectionRange(start + emoji.length, start + emoji.length);
        }
        setShowEmoji(false);
    };

    return (
        <div className="flex items-center gap-2 relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-2 hover:bg-gray-100 rounded text-gray-600 flex-shrink-0"
                title="Add emoji"
            >
                <Smile size={20} />
            </button>
            <div className="flex-1 relative">
                {showEmoji && (
                    <div className="absolute bottom-full left-0 z-50 mb-2">
                        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmoji(false)} />
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};

const CustomChannelHeader: React.FC<any> = (props) => {
    const { client, setActiveChannel, channel: contextChannel } = useChatContext();
    const videoClient = useStreamVideoClient();
    const { setActiveCall } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    const channel = props.channel || contextChannel;

    const startCall = async (audioOnly: boolean = false) => {
        if (!videoClient || !channel) return;

        const members = Object.values(channel.state.members)
            .map((m: any) => m.user_id)
            .filter((id: string) => id !== client.userID);
        if (members.length === 0) return;

        const callId = Math.random().toString(36).substring(7);
        const call = videoClient.call('default', callId);

        try {
            await call.join({ create: true });
            if (audioOnly) {
                await call.camera.disable();
            }
            setActiveCall(call);
        } catch (e) {
            console.error('Failed to start call', e);
        }
    };

    const handleClearChat = async () => {
        if (!channel) return;
        try {
            await channel.truncate();
        } catch (e) {
            console.error('Clear chat error:', e);
        }
        setShowMenu(false);
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 h-[60px]">
            <div className="flex items-center flex-1 min-w-0">
                <button
                    onClick={() => setActiveChannel(undefined)}
                    className="md:hidden mr-2 p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                    <ArrowLeft size={20} />
                </button>
                <ChannelHeader {...props} />
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    onClick={() => startCall(false)}
                    title="Video call"
                >
                    <Video size={20} />
                </button>
                <button
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                    onClick={() => startCall(true)}
                    title="Voice call"
                >
                    <Phone size={20} />
                </button>
                <div className="relative">
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <MoreVertical size={20} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-10 bg-white shadow-xl rounded-lg py-2 w-48 z-50 border border-gray-100">
                            <button
                                onClick={handleClearChat}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                            >
                                <Trash2 size={16} /> Clear Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KonvosChatInner: React.FC = () => {
    const { client, setActiveChannel, channel } = useChatContext();
    const { activeCall } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [repliedTo, setRepliedTo] = useState<any>(null);

    const filters = {
        type: 'messaging',
        members: { $in: [client.userID!] },
        hidden: showArchived,
    };

    const sort = [{ last_message_at: -1 }];

    const handleUserSelect = async (userId: string) => {
        try {
            const newChannel = client.channel('messaging', {
                members: [client.userID!, userId],
            });
            await newChannel.create();
            await newChannel.watch();
            setActiveChannel(newChannel);
            setIsSearching(false);
            setSearchQuery('');
        } catch (error: any) {
            console.error('Failed to create channel:', error);
            const fallbackChannel = client.channel('messaging', {
                members: [client.userID!, userId],
            });
            try {
                await fallbackChannel.watch();
                setActiveChannel(fallbackChannel);
                setIsSearching(false);
                setSearchQuery('');
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
            }
        }
    };

    const handleReply = (message: any) => {
        setRepliedTo(message);
    };

    const clearReply = () => {
        setRepliedTo(null);
    };

    return (
        <div className="flex h-screen overflow-hidden flowing-gradient-bg">
            {activeCall && (
                <StreamCall call={activeCall}>
                    <CallInterface />
                </StreamCall>
            )}

            {/* Chat List */}
            <div
                className={`hidden md:flex w-[400px] flex-col border-r border-gray-200 h-full bg-white ${channel ? '' : ''
                    }`}
            >
                <CustomChannelListHeader
                    onSearch={setSearchQuery}
                    isSearching={isSearching}
                    setIsSearching={setIsSearching}
                    onToggleArchived={() => setShowArchived(!showArchived)}
                    showArchived={showArchived}
                    onCreateGroup={undefined}
                    onToggleTheme={undefined}
                    isDarkMode={false}
                />

                {isSearching ? (
                    <UserList query={searchQuery} onUserSelect={handleUserSelect} />
                ) : (
                    <ChannelList filters={filters} sort={sort} Preview={CustomChannelPreview} />
                )}
            </div>

            {/* Chat Panel */}
            <div className="flex-1 hidden md:flex flex-col h-full">
                {!channel ? (
                    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-yellow-50 via-orange-50 to-yellow-50">
                        <div className="w-64 h-64 bg-white/50 backdrop-blur-sm rounded-full mb-8 flex items-center justify-center shadow-lg">
                            <div className="text-6xl font-bold text-[#00a884]">K</div>
                        </div>
                        <h2 className="text-3xl font-light text-gray-700 mb-4">Konvos Web</h2>
                        <p className="text-sm text-gray-500">
                            Send and receive messages without keeping your phone online.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Use Konvos on up to 4 linked devices and 1 phone.
                        </p>
                    </div>
                ) : (
                    <Channel key={channel.cid}>
                        <Window>
                            <CustomChannelHeader channel={channel} />
                            <MessageList 
                                messageActions={['react', 'reply', 'delete', 'edit']}
                                Message={(msg) => <CustomMessage {...msg} onReply={handleReply} />}
                            />
                            {repliedTo && <ReplyBar message={repliedTo} onClear={clearReply} />}
                            <EmojiInputWrapper>
                                <MessageInput focus />
                            </EmojiInputWrapper>
                        </Window>
                    </Channel>
                )}
            </div>

            {/* Mobile View */}
            <div className="flex md:hidden flex-col w-full h-full bg-white">
                {!channel ? (
                    <div className="flex flex-col">
                        <CustomChannelListHeader
                            onSearch={setSearchQuery}
                            isSearching={isSearching}
                            setIsSearching={setIsSearching}
                            onToggleArchived={() => setShowArchived(!showArchived)}
                            showArchived={showArchived}
                            onCreateGroup={undefined}
                            onToggleTheme={undefined}
                            isDarkMode={false}
                        />

                        {isSearching ? (
                            <UserList query={searchQuery} onUserSelect={handleUserSelect} />
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                <ChannelList
                                    filters={filters}
                                    sort={sort}
                                    Preview={CustomChannelPreview}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <Channel key={channel.cid}>
                        <Window>
                            <CustomChannelHeader channel={channel} />
                            <MessageList 
                                messageActions={['react', 'reply', 'delete', 'edit']}
                                Message={(msg) => <CustomMessage {...msg} onReply={handleReply} />}
                            />
                            {repliedTo && <ReplyBar message={repliedTo} onClear={clearReply} />}
                            <EmojiInputWrapper>
                                <MessageInput focus />
                            </EmojiInputWrapper>
                        </Window>
                    </Channel>
                )}
            </div>
        </div>
    );
};

export const KonvosChat: React.FC = () => {
    const { client } = useAuth();

    if (!client) return null;

    return (
        <Chat client={client} theme="messaging light">
            <KonvosChatInner />
        </Chat>
    );
};
