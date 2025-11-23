import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { StreamVideoClient, StreamVideo, Call } from '@stream-io/video-react-sdk';
import { STREAM_API_KEY, API_URL } from '../config';

interface User {
  id: string;
  name: string;
  image?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (id: string, password?: string) => Promise<void>;
  register: (id: string, name: string, password?: string, image?: string) => Promise<void>;
  logout: () => void;
  client: StreamChat | null;
  videoClient: StreamVideoClient | null;
  isConnecting: boolean;
  activeCall: Call | undefined;
  setActiveCall: (call: Call | undefined) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<StreamChat | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | undefined>(undefined);

  useEffect(() => {
    const storedUser = localStorage.getItem('konvos_user');
    console.log('Auth initialization - stored user:', storedUser ? 'found' : 'not found');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        connectUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('konvos_user');
      }
    }
  }, []);

  const connectUser = async (userData: User) => {
    if (!STREAM_API_KEY) {
      console.warn('Stream API Key is missing');
      setIsConnecting(false);
      return;
    }

    setIsConnecting(true);
    console.log('Connecting user to Stream:', userData.id);
    try {
      const chatClient = StreamChat.getInstance(STREAM_API_KEY);
      
      // Use token from backend if available, otherwise dev token
      const token = userData.token || chatClient.devToken(userData.id);

      await chatClient.connectUser(
        {
          id: userData.id,
          name: userData.name,
          image: userData.image,
        },
        token
      );
      setClient(chatClient);

      const vClient = new StreamVideoClient({ 
        apiKey: STREAM_API_KEY, 
        user: {
          id: userData.id,
          name: userData.name,
          image: userData.image,
        },
        token: token
      });
      setVideoClient(vClient);

    } catch (error) {
      console.error('Failed to connect user:', error);
      // Clear stored user on connection failure
      localStorage.removeItem('konvos_user');
      setUser(null);
    } finally {
      setIsConnecting(false);
      console.log('User connection attempt completed');
    }
  };

  const login = async (id: string, password?: string) => {
    try {
      // Try backend login
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        localStorage.setItem('konvos_user', JSON.stringify(userData));
        setUser(userData);
        await connectUser(userData);
        return;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Login failed');
      }
    } catch (e: any) {
      console.warn('Backend login failed:', e.message);
      // If it's a network error or 404, maybe fallback? 
      // But if it's 401 (invalid credentials), we should throw.
      if (e.message === 'Invalid credentials') {
        throw e;
      }
    }

    // Fallback for demo/dev mode (insecure)
    if (password) {
       console.warn('Using insecure dev mode login. Password ignored.');
       alert('Backend connection failed. Logging in with Dev Mode (Insecure).');
    }
    
    const userData = { id, name: id, image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}` };
    localStorage.setItem('konvos_user', JSON.stringify(userData));
    setUser(userData);
    await connectUser(userData);
  };

  const register = async (id: string, name: string, password?: string, image?: string) => {
    try {
      // Try backend register
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, password, image })
      });

      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        localStorage.setItem('konvos_user', JSON.stringify(userData));
        setUser(userData);
        await connectUser(userData);
        return;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
      }
    } catch (e: any) {
      console.warn('Backend register failed:', e.message);
      if (e.message === 'User already exists') {
        throw e;
      }
    }

    // Fallback
    if (password) {
       console.warn('Using insecure dev mode register. Password ignored.');
       alert('Backend connection failed. Registering with Dev Mode (Insecure).');
    }

    const userData = { id, name, image };
    localStorage.setItem('konvos_user', JSON.stringify(userData));
    setUser(userData);
    await connectUser(userData);
  };

  const logout = async () => {
    if (client) {
      await client.disconnectUser();
    }
    if (videoClient) {
      await videoClient.disconnectUser();
    }
    localStorage.removeItem('konvos_user');
    setUser(null);
    setClient(null);
    setVideoClient(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, client, videoClient, isConnecting, activeCall, setActiveCall }}>
      {videoClient ? (
        <StreamVideo client={videoClient}>
          {children}
        </StreamVideo>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
