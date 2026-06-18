import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Briefcase, BookOpen, Users, MessageSquare, Bell, LayoutDashboard, User, PlayCircle, PlusCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

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
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-vynk-border bg-vynk-bg-2/50 backdrop-blur-xl z-40 p-6">
      <Link to="/feed" className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-secondary shadow-md"></div>
        <span className="text-2xl font-bold tracking-tight text-vynk-text">Vynk</span>
      </Link>

      <div className="flex flex-col gap-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive ? 'text-vynk-text font-bold bg-white shadow-sm' : 'text-vynk-muted hover:bg-white/60 hover:text-vynk-text font-medium'
              }`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-vynk-primary rounded-r-full" />
              )}
              <item.icon size={22} className={isActive ? 'text-vynk-primary' : 'group-hover:text-vynk-primary transition-colors'} />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
        
        {user?.role === 'Recruiter' && (
          <Link
            to="/recruiter"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              location.pathname.startsWith('/recruiter') ? 'text-vynk-text font-bold bg-white shadow-sm' : 'text-vynk-muted hover:bg-white/60 hover:text-vynk-text font-medium'
            }`}
          >
            {location.pathname.startsWith('/recruiter') && (
              <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-vynk-primary rounded-r-full" />
            )}
            <Briefcase size={22} className={location.pathname.startsWith('/recruiter') ? 'text-vynk-primary' : 'group-hover:text-vynk-primary transition-colors'} />
            <span className="text-base">Recruiter Hub</span>
          </Link>
        )}
      </div>

      <button className="btn-primary w-full mt-4 mb-6 shadow-lg shadow-vynk-primary/20">
        <PlusCircle size={20} /> Create
      </button>

      <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors mt-auto group">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-secondary to-vynk-accent border-2 border-transparent group-hover:border-vynk-primary transition-all overflow-hidden shrink-0">
           {user?.avatar && <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />}
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-sm truncate">{user?.username || 'User'}</p>
          <p className="text-xs text-vynk-muted truncate">View Profile</p>
        </div>
      </Link>
    </aside>
  );
};

export default Sidebar;
