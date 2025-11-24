import React, { useState } from 'react';
import { 
  Chat, 
  Channel, 
  ChannelList, 
  Window, 
  ChannelHeader, 
  MessageList, 
  MessageInput, 
  useChatContext
} from 'stream-chat-react';
import { useStreamVideoClient, StreamCall } from '@stream-io/video-react-sdk';
import { CustomChannelListHeader } from './stream/CustomChannelListHeader';
import { UserList } from './stream/UserList';
import { CallInterface } from './stream/CallInterface';
import { CustomChannelPreview } from './stream/custom-channel-preview';
import { useAuth } from '../context/AuthContext';
import { Video, Phone, MoreVertical, Trash2, Ban, ArrowLeft } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './stream/stream-custom.css';

const CustomChannelHeader: React.FC<any> = (props) => {
  const { client, setActiveChannel, channel: contextChannel } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { setActiveCall } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const startCall = async (audioOnly: boolean = false) => {
    const channelToUse = props.channel || contextChannel;
    if (!videoClient || !channelToUse) return;
    
    console.log('Starting call, audio only:', audioOnly);

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
      console.log('Call started:', callId);
    } catch (e) {
      console.error('Failed to start call', e);
    }
  };

  const handleClearChat = async () => {
    const channelToUse = props.channel || contextChannel;
    if (!channelToUse) return;

    try {
      // Attempt to truncate. Note: usually requires special permissions or server-side call.
      // If this fails, we show the alert.
      // But client-side truncate often works for owners.
      await channelToUse.truncate();
      setShowMenu(false);
    } catch (e: any) {
      console.error('Clear chat failed', e);
      alert('Clear chat requires admin permissions or backend implementation.');
      setShowMenu(false);
    }
  };

  const handleBlockUser = async () => {
    const channelToUse = props.channel || contextChannel;
    if (!channelToUse) return;
    
    // Find the other user
    const members = Object.values(channelToUse.state.members);
    const otherMember: any = members.find((m: any) => m.user_id !== client.userID);
    
    if (!otherMember || !otherMember.user_id) {
      alert('Cannot identify user to block');
      return;
    }

    try {
       // Try to mute them as a "block" equivalent client-side
       await client.muteUser(otherMember.user_id);
       alert(`User ${otherMember.user?.name || otherMember.user_id} muted.`);
       setShowMenu(false);
    } catch (e) {
       console.error('Block/Mute failed', e);
       alert('Block user functionality requires backend implementation for safety.');
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
  const [showArchived, setShowArchived] = useState(false);

  // Sort: Pinned first, then by last message
  const sort: any = { pinned: -1, last_message_at: -1 };
  
  const filters: any = { 
      type: 'messaging', 
      members: { $in: [client.userID!] },
      hidden: showArchived 
  };

  const handleUserSelect = async (userId: string) => {
    const newChannel = client.channel('messaging', {
      members: [client.userID!, userId],
    });
    await newChannel.watch();
    setActiveChannel(newChannel);
    setIsSearching(false);
    setSearchQuery('');
  };
  
  const handleCreateGroup = () => {
    // For now, this just prompts alert since full group UI is complex for one turn.
    // Ideally this would toggle a MultiSelectUserList state.
    const name = prompt('Enter group name:');
    if (name) {
       const newChannel = client.channel('messaging', {
          name: name,
          members: [client.userID!],
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
       });
       newChannel.watch().then(() => {
           setActiveChannel(newChannel);
           // User can then add members via channel settings (if implemented) or we need multi-select
           alert('Group created! Add members feature is coming soon. You can invite users if you have their ID.');
       });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden konvos-theme">
      {activeCall && (
        <StreamCall call={activeCall}>
          <CallInterface />
        </StreamCall>
      )}

      <div className={`w-full md:w-[400px] flex flex-col bg-white border-r border-gray-200 h-full ${channel ? 'hidden md:flex' : 'flex'}`}>
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

      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] ${!channel ? 'hidden md:flex' : 'flex'}`}>
        {!channel ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#f0f2f5]">
            <div className="w-64 h-64 bg-gray-200 rounded-full mb-8 flex items-center justify-center">
              {/* <img src="/assets/youware-bg.png" alt="Konvos" className="w-32 opacity-50" /> */}
              <div className="text-4xl font-bold text-[#00a884] opacity-50">K</div>
            </div>
            <h2 className="text-3xl font-light text-gray-600 mb-4">Konvos Web</h2>
            <p className="text-sm text-gray-500">Send and receive messages without keeping your phone online.</p>
            <p className="text-sm text-gray-500 mt-2">Use Konvos on up to 4 linked devices and 1 phone.</p>
          </div>
        ) : (
          <Channel>
            <Window>
              <CustomChannelHeader />
              <MessageList />
              <MessageInput focus />
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
