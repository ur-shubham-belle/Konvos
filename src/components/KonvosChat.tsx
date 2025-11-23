import React, { useState } from 'react';
import { 
  Chat, 
  Channel, 
  ChannelList, 
  Window, 
  ChannelHeader, 
  MessageList, 
  MessageInput, 
  Thread, 
  useChatContext,
  ChannelHeaderProps
} from 'stream-chat-react';
import { useStreamVideoClient, StreamCall } from '@stream-io/video-react-sdk';
import { CustomChannelListHeader } from './stream/CustomChannelListHeader';
import { UserList } from './stream/UserList';
import { CallInterface } from './stream/CallInterface';
import { useAuth } from '../context/AuthContext';
import { Video, Phone, MoreVertical, Trash2, Ban } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './stream/stream-custom.css';

const CustomChannelHeader: React.FC<ChannelHeaderProps> = (props) => {
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { setActiveCall } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const startCall = async (audioOnly: boolean = false) => {
    if (!videoClient || !props.channel) return;

    const members = Object.values(props.channel.state.members).map(m => m.user_id).filter(id => id !== client.userID);
    if (members.length === 0) return;

    const callId = Math.random().toString(36).substring(7);
    const call = videoClient.call('default', callId);
    
    try {
      await call.join({ create: true });
      setActiveCall(call);
      console.log('Call started:', callId);
    } catch (e) {
      console.error('Failed to start call', e);
    }
  };

  const handleClearChat = async () => {
    alert('Clear chat requires admin permissions or backend implementation.');
    setShowMenu(false);
  };

  const handleBlockUser = async () => {
    alert('Block user functionality requires backend implementation for safety.');
    setShowMenu(false);
  };

  return (
    <div className="str-chat__header-livestream">
      <ChannelHeader {...props} />
      <div className="flex items-center gap-2 mr-4">
        <button 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          onClick={() => startCall(false)}
        >
          <Video size={20} />
        </button>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
          onClick={() => startCall(true)}
        >
          <Phone size={20} />
        </button>
        <div className="relative">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-gray-100">
              <button 
                onClick={handleClearChat}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700"
              >
                <Trash2 size={16} /> Clear Chat
              </button>
              <button 
                onClick={handleBlockUser}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
              >
                <Ban size={16} /> Block User
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

  const filters = { type: 'messaging', members: { $in: [client.userID!] } };
  const sort = { last_message_at: -1 };

  const handleUserSelect = async (userId: string) => {
    const newChannel = client.channel('messaging', {
      members: [client.userID!, userId],
    });
    await newChannel.watch();
    setActiveChannel(newChannel);
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden konvos-theme">
      {activeCall && (
        <StreamCall call={activeCall}>
          <CallInterface />
        </StreamCall>
      )}

      <div className="w-full md:w-[400px] flex flex-col bg-white border-r border-gray-200 h-full">
        <CustomChannelListHeader 
          onSearch={setSearchQuery} 
          isSearching={isSearching} 
          setIsSearching={setIsSearching}
        />
        
        {isSearching ? (
          <UserList query={searchQuery} onUserSelect={handleUserSelect} />
        ) : (
          <ChannelList 
            filters={filters} 
            sort={sort} 
            showChannelSearch={false} 
          />
        )}
      </div>

      <div className="flex-1 flex flex-col h-full bg-[#efeae2]">
        {!channel ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#f0f2f5]">
            <div className="w-64 h-64 bg-gray-200 rounded-full mb-8 flex items-center justify-center">
               <img src="/assets/youware-bg.png" alt="Konvos" className="w-32 opacity-50" />
            </div>
            <h2 className="text-3xl font-light text-gray-600 mb-4">Konvos Web</h2>
            <p className="text-sm text-gray-500">Send and receive messages without keeping your phone online.</p>
            <p className="text-sm text-gray-500 mt-2">Use Konvos on up to 4 linked devices and 1 phone.</p>
          </div>
        ) : (
          <Channel 
            HeaderComponent={CustomChannelHeader}
          >
            <Window>
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
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
