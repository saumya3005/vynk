import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, Palette, LogOut, RefreshCw, ChevronRight,
  Lock, Eye, EyeOff, MessageSquare, Globe, Moon, Sun, Monitor,
  Smartphone, Mail, Key, AlertTriangle, CheckCircle, Zap,
  Camera, Briefcase, Download, Trash2, Crown, HelpCircle, Info, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Switch } from '../components/ui/Switch';

// Animated section container
const SettingsSection = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
  >
    {children}
  </motion.div>
);

// Section card wrapper
const SectionCard = ({ icon: Icon, iconClass = 'text-primary', title, subtitle, children }) => (
  <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden mb-4">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-surface/30">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-surface-soft ${iconClass.replace('text-', 'bg-').replace('-500','')}/10`}>
        <Icon size={20} className={iconClass} />
      </div>
      <div>
        <h2 className="font-bold text-[15px] text-text">{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
  </div>
);

// Setting row with toggle or right element
const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-text">{label}</p>
      {description && <p className="text-xs text-muted mt-0.5 leading-relaxed">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// Clickable nav row
const NavRow = ({ icon: Icon, label, description, onClick, badge, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-surface-soft group ${danger ? 'hover:bg-red-500/10' : ''}`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-surface-soft shrink-0 ${danger ? 'text-red-500' : 'text-muted group-hover:text-primary'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-1 text-left">
      <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-text'}`}>{label}</p>
      {description && <p className="text-xs text-muted">{description}</p>}
    </div>
    {badge && <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    <ChevronRight size={16} className="text-muted group-hover:text-text transition-colors" />
  </button>
);

const SECTIONS = [
  'Account', 'Privacy', 'Notifications', 'Security', 'Appearance', 'Creator Tools', 'Vynk Pro', 'Help & Support'
];

const Settings = () => {
  const { user, logout, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    theme: 'dark',
    accentColor: '#FF5F45',
    reduceMotion: false,
    notifications: {
      likes: true, comments: true, follows: true, messages: true, email: true, push: true
    },
    privacy: {
      isPrivate: false, showActivityStatus: true, allowMessagesFrom: 'everyone'
    }
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: false
  });

  const [accountForm, setAccountForm] = useState({
    username: '', email: '', bio: '', location: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(prev => ({ ...prev, ...res.data }));
        setSecurity({ twoFactorEnabled: user?.twoFactorEnabled || false });
        setAccountForm({
          username: user?.username || '',
          email: user?.email || '',
          bio: user?.bio || '',
          location: user?.location || ''
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  // Apply theme globally
  useEffect(() => {
    if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  const savePrivacy = async (key, val) => {
    const newPrivacy = { ...settings.privacy, [key]: val };
    setSettings(prev => ({ ...prev, privacy: newPrivacy }));
    try {
      await api.put('/settings/privacy', newPrivacy);
      toast.success('Privacy updated');
    } catch {
      toast.error('Failed to save');
    }
  };

  const saveNotification = async (key, val) => {
    const newNotifs = { ...settings.notifications, [key]: val };
    setSettings(prev => ({ ...prev, notifications: newNotifs }));
    try {
      await api.put('/settings/notifications', newNotifs);
    } catch {
      toast.error('Failed to save');
    }
  };

  const saveAppearance = async (update) => {
    const newSettings = { ...settings, ...update };
    setSettings(newSettings);
    try {
      await api.put('/settings/appearance', update);
    } catch {
      toast.error('Failed to save appearance');
    }
  };

  const saveSecurity = async (update) => {
    const newSec = { ...security, ...update };
    setSecurity(newSec);
    try {
      await api.put('/settings/security', newSec);
      toast.success('Security settings updated');
    } catch {
      toast.error('Failed to save');
    }
  };

  const saveAccount = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', accountForm);
      login({ ...user, ...res.data }, localStorage.getItem('token'));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const ACCENT_COLORS = ['#FF5F45', '#7B61FF', '#00C2FF', '#00D26A', '#FFB800', '#FF6B9D'];

  const renderSection = () => {
    switch (activeSection) {
      case 'Account':
        return (
          <SettingsSection>
            {/* Profile Card */}
            <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden mb-4">
              <div className="relative h-24 bg-linear-to-r from-primary/30 via-secondary/30 to-accent/30">
                <div className="absolute -bottom-8 left-6">
                  <div className="w-16 h-16 rounded-2xl border-4 border-bg bg-surface overflow-hidden shadow-xl">
                    {user?.avatar
                      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-xl font-black">{user?.username?.[0]?.toUpperCase()}</div>
                    }
                  </div>
                </div>
              </div>
              <div className="pt-10 px-6 pb-5">
                <p className="font-black text-lg text-text">{user?.username}</p>
                <p className="text-sm text-muted">{user?.email}</p>
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold">
                  <Zap size={12} className="fill-primary" /> {user?.role || 'Member'}
                </span>
              </div>
            </div>

            <SectionCard icon={User} title="Personal Information" subtitle="Update your public profile details">
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    value={accountForm.username}
                    onChange={e => setAccountForm(p => ({ ...p, username: e.target.value }))}
                    className="w-full bg-surface-soft border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    value={accountForm.email}
                    onChange={e => setAccountForm(p => ({ ...p, email: e.target.value }))}
                    type="email"
                    className="w-full bg-surface-soft border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Bio</label>
                  <textarea
                    value={accountForm.bio}
                    onChange={e => setAccountForm(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full bg-surface-soft border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="Tell people about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">Location</label>
                  <input
                    value={accountForm.location}
                    onChange={e => setAccountForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full bg-surface-soft border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                <button onClick={saveAccount} disabled={saving} className="btn-primary w-full mt-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </SectionCard>

            <SectionCard icon={Key} title="Password" subtitle="Keep your account secure with a strong password">
              <div className="grid gap-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', showKey: 'current' },
                  { key: 'newPassword', label: 'New Password', showKey: 'new' },
                  { key: 'confirmPassword', label: 'Confirm New Password', showKey: 'confirm' }
                ].map(({ key, label, showKey }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-muted mb-1.5 uppercase tracking-wider">{label}</label>
                    <div className="relative">
                      <input
                        type={showPasswords[showKey] ? 'text' : 'password'}
                        value={passwordForm[key]}
                        onChange={e => setPasswordForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full bg-surface-soft border border-border rounded-xl px-4 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(p => ({ ...p, [showKey]: !p[showKey] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                      >
                        {showPasswords[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={changePassword} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </SectionCard>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-red-500 mb-1">Danger Zone</p>
                  <p className="text-xs text-muted mb-4">Deleting your account is permanent and cannot be undone. All your data will be erased.</p>
                  <button className="text-xs font-bold text-red-500 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                    <Trash2 size={14} /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>
        );

      case 'Privacy':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={Lock} iconClass="text-secondary" title="Profile Privacy" subtitle="Control who sees your content">
              <SettingRow label="Private Account" description="Only approved followers can see your posts and profile details">
                <Switch checked={settings.privacy.isPrivate} onChange={val => savePrivacy('isPrivate', val)} />
              </SettingRow>
              <SettingRow label="Show Activity Status" description="Let others see when you were last active">
                <Switch checked={settings.privacy.showActivityStatus} onChange={val => savePrivacy('showActivityStatus', val)} />
              </SettingRow>
              <div>
                <p className="text-sm font-semibold text-text mb-2">Allow Messages From</p>
                <p className="text-xs text-muted mb-3">Control who can send you direct messages</p>
                <div className="flex gap-2">
                  {['everyone', 'followers', 'none'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => savePrivacy('allowMessagesFrom', opt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        settings.privacy.allowMessagesFrom === opt
                          ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20'
                          : 'bg-surface-soft text-muted border-border hover:border-secondary/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Globe} iconClass="text-accent" title="Blocked & Muted" subtitle="Manage people you've blocked or muted">
              <NavRow icon={User} label="Blocked Users" description="People you've blocked" onClick={() => toast('Coming soon')} />
              <NavRow icon={EyeOff} label="Muted Users" description="People whose posts are hidden from you" onClick={() => toast('Coming soon')} />
            </SectionCard>
          </SettingsSection>
        );

      case 'Notifications':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={Bell} iconClass="text-yellow-500" title="Push Notifications" subtitle="Choose what alerts you receive">
              {[
                { key: 'likes', label: 'Likes', desc: 'When someone likes your content' },
                { key: 'comments', label: 'Comments', desc: 'When someone comments on your posts' },
                { key: 'follows', label: 'New Followers', desc: 'When someone follows you or sends a request' },
                { key: 'messages', label: 'Messages', desc: 'When you receive a new message' },
              ].map(item => (
                <SettingRow key={item.key} label={item.label} description={item.desc}>
                  <Switch checked={settings.notifications[item.key]} onChange={val => saveNotification(item.key, val)} />
                </SettingRow>
              ))}
            </SectionCard>

            <SectionCard icon={Mail} iconClass="text-blue-500" title="Email Notifications" subtitle="Manage email alerts from Vynk">
              <SettingRow label="Email Notifications" description="Receive activity digests and alerts via email">
                <Switch checked={settings.notifications.email} onChange={val => saveNotification('email', val)} />
              </SettingRow>
              <SettingRow label="Push Notifications" description="Enable browser / device push notifications">
                <Switch checked={settings.notifications.push} onChange={val => saveNotification('push', val)} />
              </SettingRow>
            </SectionCard>
          </SettingsSection>
        );

      case 'Security':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={Shield} iconClass="text-emerald-500" title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
              <SettingRow
                label="Enable 2FA"
                description="Require an email verification code when logging in from a new device"
              >
                <Switch checked={security.twoFactorEnabled} onChange={val => saveSecurity({ twoFactorEnabled: val })} />
              </SettingRow>
              {security.twoFactorEnabled && (
                <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <p className="text-xs text-emerald-400 font-semibold">2FA is active. Your account is protected.</p>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Smartphone} iconClass="text-primary" title="Sessions & Devices" subtitle="Review where you are logged in">
              <NavRow icon={Smartphone} label="Active Sessions" description="View and manage all active login sessions" onClick={() => toast('Coming soon')} />
              <NavRow icon={Key} label="Saved Devices" description="Trusted devices that skip 2FA" onClick={() => toast('Coming soon')} />
            </SectionCard>
          </SettingsSection>
        );

      case 'Appearance':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={Palette} iconClass="text-purple-400" title="Theme" subtitle="Choose your preferred colour mode">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'dark', icon: Moon, label: 'Dark' },
                  { val: 'light', icon: Sun, label: 'Light' },
                  { val: 'auto', icon: Monitor, label: 'Auto' }
                ].map(({ val, icon: Icon, label }) => (
                  <button
                    key={val}
                    onClick={() => saveAppearance({ theme: val })}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all font-semibold text-sm ${
                      settings.theme === val
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface-soft text-muted hover:border-border-premium'
                    }`}
                  >
                    <Icon size={22} />
                    {label}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={Zap} iconClass="text-yellow-400" title="Accent Color" subtitle="Personalize your Vynk experience">
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => saveAppearance({ accentColor: color })}
                    style={{ backgroundColor: color }}
                    className={`w-10 h-10 rounded-full transition-all ${
                      settings.accentColor === color ? 'ring-2 ring-offset-2 ring-offset-bg ring-white scale-110' : 'opacity-75 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={Monitor} iconClass="text-muted" title="Motion & Accessibility">
              <SettingRow label="Reduce Motion" description="Minimize animations throughout the app">
                <Switch checked={settings.reduceMotion} onChange={val => saveAppearance({ reduceMotion: val })} />
              </SettingRow>
            </SectionCard>
          </SettingsSection>
        );

      case 'Creator Tools':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={Camera} iconClass="text-pink-500" title="Creator Dashboard" subtitle="Tools for content creators">
              <NavRow icon={Briefcase} label="Analytics" description="View detailed performance metrics" onClick={() => navigate('/dashboard')} />
              <NavRow icon={Download} label="Download Data" description="Export all your content and data" onClick={() => toast('Coming soon')} />
            </SectionCard>
          </SettingsSection>
        );

      case 'Vynk Pro':
        return (
          <SettingsSection delay={0.05}>
            <div className="rounded-2xl overflow-hidden mb-4 border border-yellow-500/30 bg-linear-to-br from-yellow-500/10 via-transparent to-orange-500/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown size={28} className="text-yellow-400" />
                <div>
                  <h3 className="font-black text-lg text-text">Vynk Pro</h3>
                  <p className="text-xs text-muted">Unlock the full platform experience</p>
                </div>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-muted">
                {['Verified creator badge', 'Advanced analytics', 'Priority in feed algorithm', 'Exclusive themes', 'Longer video uploads', 'Collaboration tools'].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle size={14} className="text-yellow-400" /> {f}</li>
                ))}
              </ul>
              <button className="w-full py-3 rounded-xl bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black text-sm shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-shadow">
                Upgrade to Pro
              </button>
            </div>
          </SettingsSection>
        );

      case 'Help & Support':
        return (
          <SettingsSection delay={0.05}>
            <SectionCard icon={HelpCircle} iconClass="text-blue-400" title="Support" subtitle="Get help or report an issue">
              <NavRow icon={MessageSquare} label="Contact Support" description="Chat with our support team" onClick={() => toast('Coming soon')} />
              <NavRow icon={Info} label="FAQ" description="Frequently asked questions" onClick={() => toast('Coming soon')} />
              <NavRow icon={ExternalLink} label="Privacy Policy" description="Read our privacy policy" onClick={() => window.open('#', '_blank')} />
              <NavRow icon={ExternalLink} label="Terms of Service" description="Read our terms" onClick={() => window.open('#', '_blank')} />
            </SectionCard>

            <div className="rounded-2xl border border-border bg-card p-5 mb-4 text-center">
              <p className="text-xs text-muted">Vynk v1.0.0</p>
              <p className="text-xs text-muted mt-0.5">Made with ❤️ for creators everywhere</p>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden mb-4">
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-500/10 transition-colors group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="font-bold text-red-500 text-sm">Sign Out</span>
              </button>
            </div>
          </SettingsSection>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-black text-text tracking-tight">Settings</h1>
        <p className="text-muted text-sm mt-1">Manage your account, privacy, and preferences</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Nav */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-56 shrink-0"
        >
          <div className="rounded-2xl border border-border bg-card backdrop-blur-md overflow-hidden">
            {SECTIONS.map((section, i) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-4 py-3.5 text-sm font-semibold transition-all flex items-center justify-between group ${
                  activeSection === section
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted hover:text-text hover:bg-surface-soft border-l-2 border-transparent'
                } ${i !== 0 ? 'border-t border-border/50' : ''}`}
              >
                {section}
                {activeSection === section && <ChevronRight size={14} className="text-primary" />}
              </button>
            ))}
            <div className="border-t border-border">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
