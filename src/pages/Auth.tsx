import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export const AuthPage: React.FC = () => {
  console.log('AuthPage component rendering');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const id = username.toLowerCase().replace(/\s+/g, '_');
      
      if (isLogin) {
        await login(id, password);
      } else {
        const image = avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`;
        await register(id, fullName || username, password, image);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-[#00a884] to-[#008069] p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <MessageSquare className="w-10 h-10 text-[#00a884]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Welcome to Konvos</h1>
          <p className="text-green-50 text-lg">Connect with friends and family</p>
        </div>

        <div className="p-8">
          <div className="flex mb-6 border-b border-gray-200">
            <button
              className={`flex-1 pb-3 text-center font-semibold transition-all ${
                isLogin ? 'text-[#00a884] border-b-3 border-[#00a884]' : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Login
            </button>
            <button
              className={`flex-1 pb-3 text-center font-semibold transition-all ${
                !isLogin ? 'text-[#00a884] border-b-3 border-[#00a884]' : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Username (ID)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
                placeholder="johndoe"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Profile Picture URL (Optional)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00a884] focus:border-[#00a884] outline-none transition-all"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00a884] to-[#008069] text-white py-3.5 rounded-lg font-bold text-base hover:from-[#008069] hover:to-[#006b57] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Start Chatting' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
