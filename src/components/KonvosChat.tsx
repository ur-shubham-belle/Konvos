import React, { useState } from 'react';
import {
  Chat,
  Channel,
  ChannelList,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  useChatContext,
} from 'stream-chat-react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { StreamCall } from '@stream-io/video-react-sdk';
import { CustomChannelListHeader } from './stream/CustomChannelListHeader';
import { UserList } from './stream/UserList';
import { CallInterface } from './stream/CallInterface';
import { CustomChannelPreview } from './stream/custom-channel-preview';
import { useAuth } from '../context/AuthContext';
import { Video, Phone, MoreVertical, Trash2, ArrowLeft } from 'lucide-react';
import 'stream-chat-react/dist/css/v2/index.css';
import './stream/stream-custom.css';

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
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleCreateGroup = async () => {
    const name = prompt('Enter group name:');
    if (name) {
      try {
        const newChannel = client.channel('messaging', {
          name: name,
          members: [client.userID!],
          image: `https://api.dicebear.com/7.x/avatars/svg?seed=${encodeURIComponent(name)}`,
        });
        await newChannel.create();
        await newChannel.watch();
        setActiveChannel(newChannel);
        alert(`Group "${name}" created!`);
      } catch (error) {
        console.error('Failed to create group:', error);
        alert('Failed to create group');
      }
    }
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'
      }`}
    >
      {activeCall && (
        <StreamCall call={activeCall}>
          <CallInterface />
        </StreamCall>
      )}

      {/* Chat List */}
      <div
        className={`hidden md:flex w-[400px] flex-col border-r border-gray-200 h-full bg-white ${
          channel ? '' : ''
        }`}
      >
        <CustomChannelListHeader
          onSearch={setSearchQuery}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          onToggleArchived={() => setShowArchived(!showArchived)}
          showArchived={showArchived}
          onCreateGroup={handleCreateGroup}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          isDarkMode={isDarkMode}
        />

        {isSearching ? (
          <UserList query={searchQuery} onUserSelect={handleUserSelect} />
        ) : (
          <ChannelList filters={filters} sort={sort} Preview={CustomChannelPreview} />
        )}
      </div>

      {/* Chat Panel */}
      <div className={`flex-1 hidden md:flex flex-col h-full ${isDarkMode ? 'dark' : ''}`}>
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
              <MessageList messageActions={['react', 'reply', 'delete', 'edit']} />
              <MessageInput focus />
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
              onCreateGroup={handleCreateGroup}
              onToggleTheme={() => setIsDarkMode(!isDarkMode)}
              isDarkMode={isDarkMode}
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
              <MessageList messageActions={['react', 'reply', 'delete', 'edit']} />
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
