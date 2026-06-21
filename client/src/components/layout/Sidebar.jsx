import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Briefcase, BookOpen, Users, MessageSquare, Bell, LayoutDashboard, User, PlayCircle, LogOut, Settings, UserCog, RefreshCw } from 'lucide-react';
import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalCreateDropdown from '../ui/GlobalCreateDropdown';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { icon: Home, label: 'Feed', path: '/feed' },
  { icon: PlayCircle, label: 'Reels', path: '/reels' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
];

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleSwitchAccount = () => {
    setShowUserMenu(false);
    logout();
    toast('Login with another account', { icon: '🔄' });
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-surface/50 backdrop-blur-xl z-40 p-6">
      <Link to="/feed" className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary shadow-md"></div>
        <span className="text-2xl font-bold tracking-tight text-text">Vynk</span>
      </Link>

      <div className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive ? 'text-text font-bold bg-surface-soft shadow-sm border border-border/40' : 'text-muted hover:bg-surface-soft/60 hover:text-text font-medium'
              }`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
              )}
              <item.icon size={22} className={isActive ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
        
        {user?.role === 'Recruiter' && (
          <Link
            to="/recruiter"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              location.pathname.startsWith('/recruiter') ? 'text-text font-bold bg-surface-soft shadow-sm border border-border/40' : 'text-muted hover:bg-surface-soft/60 hover:text-text font-medium'
            }`}
          >
            {location.pathname.startsWith('/recruiter') && (
              <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
            )}
            <Briefcase size={22} className={location.pathname.startsWith('/recruiter') ? 'text-primary' : 'group-hover:text-primary transition-colors'} />
            <span className="text-base">Recruiter Hub</span>
          </Link>
        )}
      </div>

      <GlobalCreateDropdown />

      {/* User profile card with dropdown menu */}
      <div className="relative mt-auto" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-soft/80 transition-colors w-full group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-secondary to-accent border-2 border-transparent group-hover:border-primary transition-all overflow-hidden shrink-0">
             {user?.avatar && <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-bold text-sm truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.role || 'Member'}</p>
          </div>
        </button>

        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 w-full mb-2 bg-surface-soft rounded-xl shadow-xl border border-border overflow-hidden z-50"
            >
              <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
                <User size={18} className="text-primary" /> View Profile
              </button>
              <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
                <Settings size={18} className="text-muted" /> Settings
              </button>
              <button onClick={handleSwitchAccount} className="flex items-center gap-3 w-full p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
                <RefreshCw size={18} className="text-secondary" /> Switch Account
              </button>
              <div className="border-t border-border"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 hover:bg-red-950/20 transition-colors text-sm font-semibold text-red-500 text-left">
                <LogOut size={18} /> Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;
