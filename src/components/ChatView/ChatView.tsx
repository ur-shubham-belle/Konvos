import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, User } from '../../types';
import { MessageBubble } from './MessageBubble';
import { Avatar } from '../common/Avatar';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatViewProps {
  chat: Chat | null;
  currentUser: User;
  onSendMessage: (content: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ chat, currentUser, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] border-l border-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-600 mb-4">Convos Web</h2>
          <p className="text-sm text-gray-500">
            Send and receive messages without keeping your phone online.
          </p>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2]">
      {/* Header */}
      <header className="bg-[#f0f2f5] px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center cursor-pointer">
          <Avatar src={otherParticipant.avatar} alt={otherParticipant.name} size="md" />
          <div className="ml-3">
            <h2 className="text-base font-medium text-gray-900">{otherParticipant.name}</h2>
            <p className="text-xs text-gray-500 truncate">
              {otherParticipant.status || 'click here for contact info'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {chat.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className="bg-[#f0f2f5] px-4 py-3 flex items-center gap-2">
        <button className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
          <Smile size={24} />
        </button>
        <button className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
          <Paperclip size={24} />
        </button>
        <form onSubmit={handleSend} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 py-2 px-4 rounded-lg border-none focus:ring-0 focus:outline-none bg-white text-sm"
          />
          {newMessage.trim() ? (
            <button
              type="submit"
              className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              <Send size={24} />
            </button>
          ) : (
             <button
              type="button"
              className="text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              {/* Mic icon placeholder if needed, or just keep send disabled */}
               <Send size={24} className="opacity-50" />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
};


