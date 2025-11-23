import React, { useState, useEffect } from 'react';
import { useChatContext } from 'stream-chat-react';
import { Search, X, MessageSquarePlus, MoreVertical, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';

interface CustomChannelListHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

export const CustomChannelListHeader: React.FC<CustomChannelListHeaderProps> = ({ onSearch, isSearching, setIsSearching }) => {
  const { client } = useChatContext();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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

  return (
    <div className="flex flex-col bg-[#f0f2f5] border-r border-gray-200">
      {/* Main Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f0f2f5]">
        <div className="flex items-center gap-3">
          <Avatar src={user?.image || ''} alt={user?.name || ''} size="md" />
          <h1 className="text-xl font-bold text-[#00a884]">Konvos</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-600">
          <button className="p-2 hover:bg-gray-200 rounded-full relative" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={20} />
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg py-2 w-48 z-50 border border-gray-100">
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search or start new chat"
            className="block w-full pl-10 pr-10 py-2 border-none rounded-lg bg-white focus:ring-1 focus:ring-[#00a884] text-sm"
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
