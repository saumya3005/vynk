import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '../ui/GlobalSearch';

const TopBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-xl z-50 border-b border-border flex items-center justify-between px-4">
      <AnimatePresence mode="wait">
        {!isSearchOpen ? (
          <motion.div
            key="logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center justify-between w-full"
          >
            <Link to="/feed" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary shadow-md"></div>
              <span className="text-xl font-bold tracking-tight text-text">Vynk</span>
            </Link>
            <div className="flex items-center gap-4 text-text">
              <button onClick={() => setIsSearchOpen(true)} className="hover:text-primary transition-colors">
                <Search size={22} />
              </button>
              <Link to="/notifications" className="hover:text-primary transition-colors">
                <Bell size={22} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, width: '50%' }}
            animate={{ opacity: 1, width: '100%' }}
            exit={{ opacity: 0, width: '50%' }}
            className="flex items-center w-full gap-2"
          >
            <div className="flex-1">
              <GlobalSearch onNavigate={() => setIsSearchOpen(false)} />
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="p-2 text-muted hover:text-text transition-colors shrink-0">
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TopBar;
