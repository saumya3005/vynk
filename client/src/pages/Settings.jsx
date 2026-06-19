import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, LogOut, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const Settings = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({ posts: true, messages: true, follows: true, communities: false });
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.profileVisibility || 'public',
    allowMessagesFrom: user?.allowMessagesFrom || 'everyone',
    twoFactorEnabled: user?.twoFactorEnabled || false
  });

  const savePrivacy = async (key, val) => {
    const newPrivacy = { ...privacy, [key]: val };
    setPrivacy(newPrivacy);
    try {
      await api.put('/users/privacy', newPrivacy);
      toast.success('Privacy settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

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
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 md:pb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-text mb-8">Settings</h1>

        {/* Account Info */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><User size={20} className="text-primary" /> Account</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-tr from-primary to-secondary overflow-hidden shrink-0">
              {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{user?.username?.[0]?.toUpperCase()}</div>}
            </div>
            <div>
              <p className="font-bold text-text">{user?.username}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <p className="text-xs text-primary font-semibold mt-1">{user?.role || 'Member'}</p>
            </div>
          </div>
          <button onClick={() => navigate('/profile')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Edit Profile <ChevronRight size={14} />
          </button>
        </div>

        {/* Theme */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><Palette size={20} className="text-secondary" /> Appearance</h2>
          <div className="flex gap-3">
            {['light', 'dark', 'auto'].map(t => (
              <button
                key={t}
                onClick={() => { setTheme(t); toast.success(`Theme set to ${t}`); }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${theme === t ? 'bg-primary text-white shadow-md' : 'bg-white border border-border text-text hover:bg-surface'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><Bell size={20} className="text-yellow-500" /> Notifications</h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'posts', label: 'Post Likes & Comments' },
              { key: 'messages', label: 'New Messages' },
              { key: 'follows', label: 'New Followers' },
              { key: 'communities', label: 'Community Updates' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{item.label}</span>
                <Toggle checked={notifications[item.key]} onChange={(val) => setNotifications(prev => ({ ...prev, [item.key]: val }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2"><Shield size={20} className="text-emerald-500" /> Security & Privacy</h2>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-text block">Public Profile</span>
                <span className="text-xs text-muted">Allow non-followers to see your full profile</span>
              </div>
              <Toggle checked={privacy.profileVisibility === 'public'} onChange={(val) => savePrivacy('profileVisibility', val ? 'public' : 'private')} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-text block">Two-Step Verification (2FA)</span>
                <span className="text-xs text-muted">Require an email code when logging in</span>
              </div>
              <Toggle checked={privacy.twoFactorEnabled} onChange={(val) => savePrivacy('twoFactorEnabled', val)} />
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
              <span className="text-sm font-semibold text-text">Allow Messages From</span>
              <select
                value={privacy.allowMessagesFrom}
                onChange={(e) => savePrivacy('allowMessagesFrom', e.target.value)}
                className="glass-input text-sm p-2.5 bg-white/50"
              >
                <option value="everyone">Everyone</option>
                <option value="followers">Followers</option>
                <option value="none">No one</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <button onClick={handleSwitchAccount} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface transition-colors text-sm font-semibold text-text w-full text-left">
            <RefreshCw size={18} className="text-secondary" /> Switch Account
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
