import { useState, useEffect, useRef } from 'react';
import { Search, Loader, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import useDebounce from '../../hooks/useDebounce';

const GlobalSearch = ({ onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(debouncedQuery)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (userId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${userId}`);
    if (onNavigate) onNavigate();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          placeholder="Search Vynk (users, skills, roles)..."
          className="w-full bg-white/60 border border-border rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all text-text placeholder:text-muted/80"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={16} />
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-bold text-muted uppercase tracking-wider bg-bg/50">
                  People
                </div>
                {results.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 hover:bg-surface cursor-pointer transition-colors"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-linear-to-tr from-secondary to-accent shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {user.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-text truncate">{user.username}</p>
                        <p className="text-xs text-muted truncate">{user.role || 'Member'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="p-6 text-center text-muted text-sm">
                  No results found for "{query}"
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
