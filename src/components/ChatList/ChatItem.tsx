import React from 'react';
import { Chat } from '../../types';
import { Avatar } from '../common/Avatar';

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onClick }) => {
  const otherParticipant = chat.participants[0]; // Assuming 1-on-1 for now
  const lastMessage = chat.lastMessage;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
        isActive ? 'bg-gray-100' : 'bg-white'
      }`}
    >
      <Avatar src={otherParticipant.avatar} alt={otherParticipant.name} size="lg" />
      <div className="ml-4 flex-1 border-b border-gray-100 pb-3 min-w-0">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {otherParticipant.name}
          </h3>
          {lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-600 truncate pr-2">
            {lastMessage ? lastMessage.content : 'Start a conversation'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-green-500 rounded-full">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
