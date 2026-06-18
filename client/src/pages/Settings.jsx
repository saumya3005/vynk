import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, LogOut, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({ posts: true, messages: true, follows: true, communities: false });
  const [privacy, setPrivacy] = useState({ profilePublic: true, showOnline: true, showActivity: true });

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSwitchAccount = () => {
    logout();
    toast('Login with another account', { icon: '🔄' });
    navigate('/login');
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-vynk-primary' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 md:pb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-vynk-text mb-8">Settings</h1>

        {/* Account Info */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-vynk-text mb-4 flex items-center gap-2"><User size={20} className="text-vynk-primary" /> Account</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-secondary overflow-hidden shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{user?.username?.[0]?.toUpperCase()}</div>}
            </div>
            <div>
              <p className="font-bold text-vynk-text">{user?.username}</p>
              <p className="text-sm text-vynk-muted">{user?.email}</p>
              <p className="text-xs text-vynk-primary font-semibold mt-1">{user?.role || 'Member'}</p>
            </div>
          </div>
          <button onClick={() => navigate('/profile')} className="text-sm text-vynk-primary font-semibold flex items-center gap-1 hover:underline">
            Edit Profile <ChevronRight size={14} />
          </button>
        </div>

        {/* Theme */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-vynk-text mb-4 flex items-center gap-2"><Palette size={20} className="text-vynk-secondary" /> Appearance</h2>
          <div className="flex gap-3">
            {['light', 'dark', 'auto'].map(t => (
              <button
                key={t}
                onClick={() => { setTheme(t); toast.success(`Theme set to ${t}`); }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${theme === t ? 'bg-vynk-primary text-white shadow-md' : 'bg-white border border-vynk-border text-vynk-text hover:bg-vynk-bg-2'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-vynk-text mb-4 flex items-center gap-2"><Bell size={20} className="text-yellow-500" /> Notifications</h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'posts', label: 'Post Likes & Comments' },
              { key: 'messages', label: 'New Messages' },
              { key: 'follows', label: 'New Followers' },
              { key: 'communities', label: 'Community Updates' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-vynk-text">{item.label}</span>
                <Toggle checked={notifications[item.key]} onChange={(val) => setNotifications(prev => ({ ...prev, [item.key]: val }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-vynk-text mb-4 flex items-center gap-2"><Shield size={20} className="text-emerald-500" /> Privacy</h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'profilePublic', label: 'Public Profile' },
              { key: 'showOnline', label: 'Show Online Status' },
              { key: 'showActivity', label: 'Show Activity Status' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-vynk-text">{item.label}</span>
                <Toggle checked={privacy[item.key]} onChange={(val) => setPrivacy(prev => ({ ...prev, [item.key]: val }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <button onClick={handleSwitchAccount} className="flex items-center gap-3 p-3 rounded-xl hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text w-full text-left">
            <RefreshCw size={18} className="text-vynk-secondary" /> Switch Account
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold text-red-500 w-full text-left">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
