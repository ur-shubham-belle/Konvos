import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from 'stream-chat-react';
import { Search, X, MoreVertical, LogOut, Archive, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface CustomChannelListHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  onToggleArchived?: () => void;
  showArchived?: boolean;
  onCreateGroup?: () => void;
}

export const CustomChannelListHeader: React.FC<CustomChannelListHeaderProps> = ({ 
  onSearch, 
  isSearching, 
  setIsSearching,
  onToggleArchived,
  showArchived,
  onCreateGroup
}) => {
  const { client } = useChatContext();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
    if (val) setIsSearching(true);
    else setIsSearching(false);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setIsSearching(false);
  };

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
    <div className="flex flex-col bg-gradient-to-r from-[#f0f2f5] to-[#e8ebf0] border-b border-gray-200">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar src={user?.image || ''} alt={user?.name || ''} size="md" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#00a884] to-[#008069] bg-clip-text text-transparent">
              Konvos
            </h1>
            <p className="text-xs text-gray-500">{user?.name || 'User'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          {onCreateGroup && (
            <button 
              className="p-2 hover:bg-white/60 rounded-full transition-colors"
              onClick={onCreateGroup}
              title="Create group"
            >
              <Users size={20} />
            </button>
          )}
          <div className="relative" ref={menuRef}>
            <button 
              className="p-2 hover:bg-white/60 rounded-full transition-colors" 
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white shadow-xl rounded-lg py-2 w-48 z-50 border border-gray-100">
                {onToggleArchived && (
                  <button 
                    onClick={() => { onToggleArchived(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                  >
                    <Archive size={16} /> 
                    {showArchived ? 'Show Active' : 'Show Archived'}
                  </button>
                )}
                <button 
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-red-600 transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search or start new chat"
            className="block w-full pl-10 pr-10 py-2.5 border-none rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#00a884]/30 focus:bg-white text-sm transition-all shadow-sm"
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tab indicator for archived */}
      {showArchived && (
        <div className="px-4 pb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00a884]/10 text-[#00a884] text-xs font-medium rounded-full">
            <Archive size={12} />
            Showing archived chats
          </span>
        </div>
      )}
    </div>
  );
};
