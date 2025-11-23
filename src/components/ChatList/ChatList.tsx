import React from 'react';
import { Chat } from '../../types';
import { ChatItem } from './ChatItem';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chats, activeChatId, onChatSelect }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => onChatSelect(chat.id)}
        />
      ))}
    </div>
  );
};
