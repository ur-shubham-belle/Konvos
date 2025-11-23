import React from 'react';
import { Message } from '../../types';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] rounded-lg px-3 py-1.5 shadow-sm relative ${
          isOwn ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
        }`}
      >
        <p className="text-sm text-gray-900 leading-relaxed break-words">
          {message.content}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-gray-500">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className={`text-[10px] ${message.status === 'read' ? 'text-blue-500' : 'text-gray-500'}`}>
              {message.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
