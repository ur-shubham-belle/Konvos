import React, { useState, useRef, useEffect } from 'react';
import { 
  Chat, 
  Channel, 
  ChannelList, 
  Window, 
  ChannelHeader, 
  MessageList,
  useChatContext,
  useMessageInputContext
} from 'stream-chat-react';
import { useStreamVideoClient, StreamCall } from '@stream-io/video-react-sdk';
import { CustomChannelListHeader } from './stream/CustomChannelListHeader';
import { UserList } from './stream/UserList';
import { CallInterface } from './stream/CallInterface';
import { CustomChannelPreview } from './stream/custom-channel-preview';
import { useAuth } from '../context/AuthContext';
import { Video, Phone, MoreVertical, Trash2, Ban, ArrowLeft, UserCheck, Smile } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './stream/stream-custom.css';

const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '❤️', '🔥', '🎉', '👏', '😢', '😮', '🙏', '💪'];

const EmojiPicker: React.FC<{ onSelect: (emoji: string) => void; onClose: () => void }> = ({ onSelect, onClose }) => {
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
                        onClick={() => onSelect(emoji)}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

const CustomMessageInput: React.FC = () => {
  const { text = '', setText, handleSubmit, uploadFile } = useMessageInputContext();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEmojiSelect = (emoji: string) => {
        setText((text || '') + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && uploadFile) {
            Array.from(files).forEach(file => uploadFile(file));
        }
    };

    return (
        <div className="str-chat__input-flat bg-[#f0f2f5] px-4 py-3">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <button
                        type="button"
                        className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                        <Smile size={24} />
                    </button>
                    {showEmojiPicker && (
                        <EmojiPicker
                            onSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors"
                    title="Attach file"
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                </button>
                <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
                    <input
                        type="text"
                        value={text || ''}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 py-2.5 px-4 rounded-lg border-none focus:ring-0 focus:outline-none bg-white text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!text || !text.trim()}
                        className={`p-2.5 rounded-full transition-all ${(text && text.trim()) ? 'bg-[#00a884] text-white hover:bg-[#008069]' : 'bg-gray-200 text-gray-400'}`}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};
const CustomChannelHeader: React.FC<any> = (props) => {
    const { client, setActiveChannel, channel: contextChannel } = useChatContext();
    const videoClient = useStreamVideoClient();
    const { setActiveCall } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const startCall = async (audioOnly: boolean = false) => {
        const channelToUse = props.channel || contextChannel;
        if (!videoClient || !channelToUse) return;

        const members = Object.values(channelToUse.state.members).map((m: any) => m.user_id).filter((id: string) => id !== client.userID);
        if (members.length === 0) return;

        const callId = Math.random().toString(36).substring(7);
        const call = videoClient.call('default', callId);

        try {
            // audio: true is default. video: !audioOnly.
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
        const channelToUse = props.channel || contextChannel;
        if (!channelToUse || actionLoading) return;

        setActionLoading(true);
        try {
            await channelToUse.truncate();
        } catch (e: any) {
            console.error('Clear chat error (may still succeed):', e);
        } finally {
            setActionLoading(false);
            setShowMenu(false);
        }
    };

    const getOtherMember = () => {
        const channelToUse = props.channel || contextChannel;
        if (!channelToUse) return null;
        const members = Object.values(channelToUse.state.members);
        return members.find((m: any) => m.user_id !== client.userID) as any;
    };

    const handleBlockUser = async () => {
        const otherMember = getOtherMember();
        if (!otherMember?.user_id || actionLoading) return;

        setActionLoading(true);
        try {
            await client.banUser(otherMember.user_id);
        } catch (e) {
            console.error('Block error (may still succeed):', e);
        } finally {
            setActionLoading(false);
            setShowMenu(false);
        }
    };

    const handleUnblockUser = async () => {
        const otherMember = getOtherMember();
        if (!otherMember?.user_id || actionLoading) return;

        setActionLoading(true);
        try {
            await client.unbanUser(otherMember.user_id);
        } catch (e) {
            console.error('Unblock error (may still succeed):', e);
        } finally {
            setActionLoading(false);
            setShowMenu(false);
        }
    };

    return (
        <div className="str-chat__header-livestream flex items-center justify-between px-4 py-2 bg-[#f0f2f5] border-b border-[#e9edef] h-[60px]">
            <div className="flex items-center overflow-hidden">
                <button
                    onClick={() => setActiveChannel(undefined)}
                    className="md:hidden mr-2 p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <ChannelHeader {...props} />
                </div>
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
                <div className="relative" ref={menuRef}>
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
                                disabled={actionLoading}
                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 disabled:opacity-50 transition-colors"
                            >
                                <Trash2 size={16} /> Clear Chat
                            </button>
                            {!contextChannel?.data?.hidden ? (
                                <button
                                    onClick={handleBlockUser}
                                    disabled={actionLoading}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-red-600 disabled:opacity-50 transition-colors"
                                >
                                    <Ban size={16} /> Block User
                                </button>
                            ) : (
                                <button
                                    onClick={handleUnblockUser}
                                    disabled={actionLoading}
                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-green-600 disabled:opacity-50 transition-colors"
                                >
                                    <UserCheck size={16} /> Unblock User
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const customReactionOptions = [
    { type: 'like', Component: () => <>👍</>, name: 'Like' },
    { type: 'love', Component: () => <>❤️</>, name: 'Love' },
    { type: 'haha', Component: () => <>😂</>, name: 'Haha' },
    { type: 'wow', Component: () => <>😮</>, name: 'Wow' },
    { type: 'sad', Component: () => <>😢</>, name: 'Sad' },
];

const KonvosChatInner: React.FC = () => {
    const { client, setActiveChannel, channel } = useChatContext();
    const { activeCall } = useAuth();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    // Sort: Pinned first, then by last message
    const sort: any = React.useMemo(() => ([{ last_message_at: -1 }]), []);

    const filters: any = React.useMemo(() => ({
        type: 'messaging',
        members: { $in: [client.userID!] },
        hidden: showArchived
    }), [client.userID, showArchived]);

    const handleUserSelect = async (userId: string) => {
        try {
            const newChannel = client.channel('messaging', {
                members: [client.userID!, userId],
            });

            // Create channel and wait for it
            const response = await newChannel.create();
            console.log('Channel created:', response);

            // Watch the channel
            await newChannel.watch();
            console.log('Channel watched, setting as active');

            // Set active channel
            setActiveChannel(newChannel);
            setIsSearching(false);
            setSearchQuery('');
        } catch (error: any) {
            console.error('Failed to create or select channel:', error);
            // Try to still show the channel even if create failed
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

    const handleCreateGroup = async () => {
        const name = prompt('Enter group name:');
        if (name) {
            try {
                const newChannel = client.channel('messaging', {
                    name: name,
                    members: [client.userID!],
                    image: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
                });
                await newChannel.create();
                await newChannel.watch();
                setActiveChannel(newChannel);
            } catch (error) {
                console.error('Failed to create group:', error);
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden konvos-theme">
            {activeCall && (
                <StreamCall call={activeCall}>
                    <CallInterface />
                </StreamCall>
            )}

            {/* Chat List with flowing background */}
            <div className={`w-full md:w-[400px] flex flex-col border-r border-gray-200 h-full chat-list-flowing-bg ${channel ? 'hidden md:flex' : 'flex'}`}>
                <CustomChannelListHeader
                    onSearch={setSearchQuery}
                    isSearching={isSearching}
                    setIsSearching={setIsSearching}
                    onToggleArchived={() => setShowArchived(!showArchived)}
                    showArchived={showArchived}
                    onCreateGroup={handleCreateGroup}
                />

                {isSearching ? (
                    <UserList query={searchQuery} onUserSelect={handleUserSelect} />
                ) : (
                    <ChannelList
                        filters={filters}
                        sort={sort}
                        showChannelSearch={false}
                        Preview={CustomChannelPreview}
                    />
                )}
            </div>

            {/* Chat Panel with flowing background */}
            <div className={`flex-1 flex flex-col h-full chat-panel-flowing-bg ${!channel ? 'hidden md:flex' : 'flex'}`}>
                {!channel ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="w-64 h-64 bg-white/50 backdrop-blur-sm rounded-full mb-8 flex items-center justify-center shadow-lg">
                            <div className="text-6xl font-bold text-[#00a884]">K</div>
                        </div>
                        <h2 className="text-3xl font-light text-gray-700 mb-4">Konvos Web</h2>
                        <p className="text-sm text-gray-500">Send and receive messages without keeping your phone online.</p>
                        <p className="text-sm text-gray-500 mt-2">Use Konvos on up to 4 linked devices and 1 phone.</p>
                    </div>
                ) : (
                    <Channel 
                      Input={CustomMessageInput}
                      reactionOptions={customReactionOptions}
                      key={channel.cid}
                    >
                      <Window>
                        <CustomChannelHeader channel={channel} />
                        <MessageList 
                          messageActions={['react', 'reply', 'delete', 'edit']}
                          noGroupByUser={false}
                        />
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
