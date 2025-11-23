import React, { useEffect, useState } from 'react';
import { useChatContext, Avatar as StreamAvatar } from 'stream-chat-react';
import { UserResponse } from 'stream-chat';

interface UserListProps {
  query: string;
  onUserSelect: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ query, onUserSelect }) => {
  const { client } = useChatContext();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query) {
        setUsers([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await client.queryUsers(
          {
            id: { $ne: client.userID! },
            $or: [
              { name: { $autocomplete: query } },
              { id: { $autocomplete: query } }
            ]
          },
          { name: 1 },
          { limit: 10 }
        );
        setUsers(response.users);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, client]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Searching...</div>;
  }

  if (!users.length && query) {
    return <div className="p-4 text-center text-gray-500">No users found</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserSelect(user.id)}
          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50"
        >
          <div className="w-10 h-10 mr-3">
            <StreamAvatar image={user.image} name={user.name} size={40} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name || user.id}</div>
            <div className="text-sm text-gray-500">User</div>
          </div>
        </div>
      ))}
    </div>
  );
};
