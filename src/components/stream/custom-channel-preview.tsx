import React, { useRef, useState, useEffect } from 'react';
import { ChannelPreviewUIComponentProps, useChatContext } from 'stream-chat-react';
<<<<<<< Updated upstream
import { Archive, MoreVertical, Check, CheckCheck } from 'lucide-react';
=======
import { Pin, Archive, Trash2, MoreVertical, Check } from 'lucide-react';
>>>>>>> Stashed changes
import { Avatar } from '../common/Avatar';

export const CustomChannelPreview: React.FC<ChannelPreviewUIComponentProps> = (props) => {
  const { channel, setActiveChannel, active } = props;
  const { client } = useChatContext();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const lastMessage = channel.state.messages[channel.state.messages.length - 1];
  const unreadCount = channel.countUnread();
  
<<<<<<< Updated upstream
=======
  // Helper to get display title/image
>>>>>>> Stashed changes
  const getDisplayInfo = () => {
    const members = Object.values(channel.state.members);
    if (members.length === 2) {
      const otherMember = members.find(m => m.user_id !== client.userID);
      if (otherMember) {
        return {
          name: otherMember.user?.name || otherMember.user_id,
<<<<<<< Updated upstream
          image: otherMember.user?.image,
          online: otherMember.user?.online
=======
          image: otherMember.user?.image
>>>>>>> Stashed changes
        };
      }
    }
    return {
      name: channel.data?.name || 'Group Chat',
<<<<<<< Updated upstream
      image: channel.data?.image,
      online: false
    };
  };

  const { name, image, online } = getDisplayInfo();

  const formatTime = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return d.toLocaleDateString([], { weekday: 'short' });
    } else {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessagePreview = () => {
    if (!lastMessage) return 'No messages yet';
    
    const isOwn = lastMessage.user?.id === client.userID;
    let text = lastMessage.text || '';
    
    if (lastMessage.attachments?.length) {
      text = '📎 Attachment';
    }
    
    if (text.length > 35) {
      text = text.substring(0, 35) + '...';
    }
    
    return isOwn ? text : text;
=======
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
>>>>>>> Stashed changes
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
<<<<<<< Updated upstream
=======
      // Archive by hiding
>>>>>>> Stashed changes
      await channel.hide();
    } catch (err) {
      console.error('Failed to archive', err);
    }
    setShowMenu(false);
  };

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
<<<<<<< Updated upstream
      await channel.show();
    } catch (err) {
      console.error('Failed to unarchive', err);
=======
        await channel.show();
    } catch (err) {
        console.error('Failed to unarchive', err);
>>>>>>> Stashed changes
    }
    setShowMenu(false);
  };

<<<<<<< Updated upstream
=======
  // Close menu on click outside
>>>>>>> Stashed changes
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

<<<<<<< Updated upstream
  const isOwnLastMessage = lastMessage?.user?.id === client.userID;

  return (
    <div 
      className={`group relative flex items-center p-3 cursor-pointer transition-all duration-200 border-b border-gray-100/50 ${
        active 
          ? 'bg-[#00a884]/10 border-l-4 border-l-[#00a884]' 
          : 'hover:bg-white/60 border-l-4 border-l-transparent'
      }`}
=======
  return (
    <div 
      className={`relative flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${active ? 'bg-[#f0f2f5]' : 'bg-white'}`}
>>>>>>> Stashed changes
      onClick={() => setActiveChannel?.(channel)}
    >
      <div className="mr-3 relative">
        <Avatar src={image || ''} alt={name || ''} size="md" />
<<<<<<< Updated upstream
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
=======
        {channel.data?.pinned && (
             <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-0.5 border border-white">
                 <Pin size={10} className="text-gray-500 fill-gray-500" />
             </div>
>>>>>>> Stashed changes
        )}
      </div>
      
      <div className="flex-1 min-w-0">
<<<<<<< Updated upstream
        <div className="flex justify-between items-center">
          <h3 className={`font-semibold truncate ${active ? 'text-[#00a884]' : 'text-gray-900'}`}>
            {name}
          </h3>
          <span className={`text-xs whitespace-nowrap ml-2 ${unreadCount > 0 ? 'text-[#00a884] font-semibold' : 'text-gray-500'}`}>
            {formatTime(lastMessage?.created_at)}
=======
        <div className="flex justify-between items-baseline">
          <h3 className="text-gray-900 font-medium truncate">{name}</h3>
          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
             {lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
>>>>>>> Stashed changes
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
<<<<<<< Updated upstream
          <div className="flex items-center flex-1 min-w-0">
            {isOwnLastMessage && (
              <span className="mr-1 flex-shrink-0">
                {lastMessage?.status === 'received' ? (
                  <CheckCheck size={14} className="text-blue-500" />
                ) : (
                  <Check size={14} className="text-gray-400" />
                )}
              </span>
            )}
            <p className="text-sm text-gray-500 truncate">
              {getMessagePreview()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {unreadCount > 0 && (
              <span className="bg-[#00a884] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 font-semibold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
             
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button 
                className={`p-1 rounded-full hover:bg-gray-200 text-gray-400 transition-opacity ${
                  showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              >
                <MoreVertical size={16} />
              </button>
               
              {showMenu && (
                <div ref={menuRef} className="absolute right-0 top-6 w-36 bg-white shadow-xl rounded-lg py-1 z-50 border border-gray-100">
                  {channel.data?.hidden ? (
                    <button onClick={handleUnarchive} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                      <Archive size={14} /> Unarchive
                    </button>
                  ) : (
                    <button onClick={handleArchive} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                      <Archive size={14} /> Archive
                    </button>
                  )}
                </div>
              )}
            </div>
=======
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
             
             <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
                <button 
                    className={`p-1 rounded-full hover:bg-gray-200 text-gray-400 ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100'}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
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
>>>>>>> Stashed changes
          </div>
        </div>
      </div>
    </div>
  );
};
