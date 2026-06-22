import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Briefcase, BookOpen, Users, MessageSquare, User, PlayCircle, LogOut, Settings, Bookmark, TrendingUp, HelpCircle, LayoutDashboard } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import GlobalCreateDropdown from '../ui/GlobalCreateDropdown';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { icon: Home, label: 'Feed', path: '/feed' },
  { icon: PlayCircle, label: 'Reels', path: '/reels' },
  { icon: Compass, label: 'Explore', path: '/explore' },
  { icon: TrendingUp, label: 'Trending', path: '/explore?tab=trending' },
  { icon: Bookmark, label: 'Saved', path: '/profile?tab=saved' },
  { icon: MessageSquare, label: 'Messages', path: '/chat' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: BookOpen, label: 'Notes', path: '/notes' },
  { icon: Users, label: 'Communities', path: '/communities' },
];

const BOTTOM_ITEMS = [
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: HelpCircle, label: 'Help', path: '/help' },
];

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] fixed left-0 top-16 border-r border-border bg-surface/50 backdrop-blur-xl z-40 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col flex-1 py-6 px-4">
        
        <div className="mb-6">
          <GlobalCreateDropdown />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path.split('?')[0]);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-muted hover:bg-surface-soft hover:text-text font-semibold'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-primary' : 'text-muted group-hover:text-text'} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 border-t border-border pt-6 flex flex-col gap-1">
          {BOTTOM_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-muted hover:bg-surface-soft hover:text-text font-semibold'
                }`}
              >
                <item.icon size={22} className={isActive ? 'text-primary' : 'text-muted group-hover:text-text'} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 text-red-500 hover:bg-red-500/10 font-semibold mt-2"
          >
            <LogOut size={22} />
            <span className="text-[15px]">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
