import { Chat, User } from '../types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'You',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felix',
  status: 'Available'
};

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Freeman',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alice',
    status: 'Busy'
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Bob',
    status: 'At the gym'
  },
  {
    id: 'u3',
    name: 'Charlie Brown',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Charlie',
    status: 'Sleeping'
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'c1',
    participants: [USERS[0]],
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'u1',
        content: 'Hey! How are you doing?',
        timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        status: 'read'
      },
      {
        id: 'm2',
        senderId: 'me',
        content: 'I am good, thanks! Just working on a new project.',
        timestamp: Date.now() - 1000 * 60 * 60 * 1.9,
        status: 'read'
      },
      {
        id: 'm3',
        senderId: 'u1',
        content: 'That sounds exciting! What is it about?',
        timestamp: Date.now() - 1000 * 60 * 30,
        status: 'delivered'
      },
      {
        id: 'm4',
        senderId: 'u1',
        content: 'Let me know if you need any help.',
        timestamp: Date.now() - 1000 * 60 * 29,
        status: 'delivered'
      }
    ]
  },
  {
    id: 'c2',
    participants: [USERS[1]],
    unreadCount: 0,
    messages: [
      {
        id: 'm5',
        senderId: 'me',
        content: 'Are we still on for tomorrow?',
        timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
        status: 'read'
      },
      {
        id: 'm6',
        senderId: 'u2',
        content: 'Yes, absolutely! 7 PM at the usual place.',
        timestamp: Date.now() - 1000 * 60 * 60 * 23,
        status: 'read'
      }
    ]
  },
  {
    id: 'c3',
    participants: [USERS[2]],
    unreadCount: 0,
    messages: [
      {
        id: 'm7',
        senderId: 'u3',
        content: 'Did you see the game last night?',
        timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
        status: 'read'
      }
    ]
  }
];

// Helper to initialize chats with lastMessage
INITIAL_CHATS.forEach(chat => {
  if (chat.messages.length > 0) {
    chat.lastMessage = chat.messages[chat.messages.length - 1];
  }
});
