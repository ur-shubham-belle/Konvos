import React, { useRef, useState, useEffect } from 'react';
import { ChannelPreviewUIComponentProps, useChatContext } from 'stream-chat-react';
import { Pin, Archive, Trash2, MoreVertical, Check } from 'lucide-react';
import { Avatar } from '../common/Avatar';

export const CustomChannelPreview: React.FC<ChannelPreviewUIComponentProps> = (props) => {
  const { channel, setActiveChannel, active } = props;
  const { client } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();
  
  // Helper to get display title/image
  const getDisplayInfo = () => {
    const members = Object.values(channel.state.members);
    if (members.length === 2) {
      const otherMember = members.find(m => m.user_id !== client.userID);
      if (otherMember) {
        return {
          name: otherMember.user?.name || otherMember.user_id,
          image: otherMember.user?.image
        };
      }
    }
    return {
      name: channel.data?.name || 'Group Chat',
      image: channel.data?.image
    };
  };

  const { name, image } = getDisplayInfo();

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isPinned = channel.data?.pinned === true;
    try {
      await channel.updatePartial({ set: { pinned: !isPinned } });
    } catch (err) {
      console.error('Failed to pin/unpin', err);
    }
    setShowMenu(false);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Archive by hiding
      await channel.hide();
    } catch (err) {
      console.error('Failed to archive', err);
    }
    setShowMenu(false);
  };

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
        await channel.show();
    } catch (err) {
        console.error('Failed to unarchive', err);
    }
    setShowMenu(false);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`relative flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${active ? 'bg-[#f0f2f5]' : ''}`}
      onClick={() => setActiveChannel?.(channel)}
    >
      <div className="mr-3 relative">
        <Avatar src={image || ''} alt={name || ''} size="md" />
        {channel.data?.pinned && (
             <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-0.5 border border-white">
                 <Pin size={10} className="text-gray-500 fill-gray-500" />
             </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="text-gray-900 font-medium truncate">{name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
             {lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500 truncate pr-2">
            {lastMessage?.text || 'No messages yet'}
          </p>
          
          <div className="flex items-center gap-2">
             {channel.data?.pinned && <Pin size={12} className="text-gray-400 rotate-45" />}
             {unreadCount > 0 && (
               <span className="bg-[#00a884] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                 {unreadCount}
               </span>
             )}
             
             <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button 
                    className={`p-1 rounded-full hover:bg-gray-200 text-gray-400 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100'}`}
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                >
                    <MoreVertical size={16} />
                </button>
                
                {showMenu && (
                    <div ref={menuRef} className="absolute right-0 top-6 w-40 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-100">
                        <button onClick={handlePin} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Pin size={14} /> {channel.data?.pinned ? 'Unpin' : 'Pin'}
                        </button>
                        
                        {channel.data?.hidden ? (
                             <button onClick={handleUnarchive} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Archive size={14} /> Unarchive
                             </button>
                        ) : (
                             <button onClick={handleArchive} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <Archive size={14} /> Archive
                             </button>
                        )}
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
