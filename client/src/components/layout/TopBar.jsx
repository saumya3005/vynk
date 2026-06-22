import { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, X, MessageSquare, PlusSquare, Moon, Sun, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../ui/GlobalSearch';
import GlobalCreateDropdown from '../ui/GlobalCreateDropdown';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const TopBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const location = useLocation();

  const navLinks = [
    { label: 'Feed', path: '/feed' },
    { label: 'Explore', path: '/explore' },
    { label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-surface/80 backdrop-blur-xl z-50 border-b border-border flex items-center justify-between px-4 md:px-6">
      
      {/* Logo & Desktop Nav Links */}
      <div className="flex items-center gap-8">
        <Link to="/feed" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary shadow-md"></div>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-text">Vynk</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link 
              key={link.label} 
              to={link.path}
              className={`text-sm font-bold transition-colors ${location.pathname === link.path ? 'text-text' : 'text-muted hover:text-text'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Center: Search (Desktop) */}
      <div className="hidden md:block flex-1 max-w-xl px-6">
        <GlobalSearch />
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3 md:gap-4 text-text">
        {/* Mobile Search Toggle */}
        <button onClick={() => setIsSearchOpen(true)} className="md:hidden hover:text-primary transition-colors p-2">
          <Search size={22} />
        </button>

        {/* Global Create Button */}
        <div className="hidden md:block">
          <GlobalCreateDropdown iconOnly={true} />
        </div>

        {/* Messages */}
        <Link to="/chat" className="hover:text-primary transition-colors p-2 hidden md:block">
          <MessageSquare size={22} />
        </Link>

        {/* Notifications */}
        <Link to="/notifications" className="hover:text-primary transition-colors relative p-2">
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
          )}
        </Link>

        {/* Profile Avatar */}
        {user && (
          <Link to="/profile" className="w-8 h-8 rounded-full border-2 border-surface-soft overflow-hidden shrink-0 ml-2 hidden md:block">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>
        )}
      </div>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full h-16 bg-surface z-50 flex items-center px-4 gap-2 md:hidden"
          >
            <div className="flex-1">
              <GlobalSearch onNavigate={() => setIsSearchOpen(false)} />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 text-muted hover:text-text transition-colors">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TopBar;
