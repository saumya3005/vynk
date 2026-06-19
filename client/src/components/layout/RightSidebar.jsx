import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlobalSearch from '../ui/GlobalSearch';
import { userApi } from '../../api/userApi';
import toast from 'react-hot-toast';

const RightSidebar = () => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const data = await userApi.getSuggestions();
      setSuggestions(data.slice(0, 5)); // show top 5
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const res = await userApi.followUser(userId);
      toast.success(res.isFollowing ? 'Followed user' : 'Unfollowed user');
      // Optimistically remove from suggestions if followed
      if (res.isFollowing) {
        setSuggestions(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      toast.error('Failed to follow user');
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-80 fixed right-0 top-0 h-screen border-l border-vynk-border bg-vynk-bg-2/30 backdrop-blur-md z-30 p-6 overflow-y-auto">
      
      {/* Search */}
      <div className="mb-8 relative z-50">
        <GlobalSearch />
      </div>

      {/* Suggested People */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm text-vynk-muted uppercase tracking-wider">Suggested for you</h3>
          <Link to="/explore" className="text-xs font-semibold text-vynk-primary hover:underline">See All</Link>
        </div>
        <div className="flex flex-col gap-4">
          {suggestions.length > 0 ? suggestions.map(user => (
            <div key={user._id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-accent to-vynk-secondary shrink-0 overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" /> : null}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate group-hover:underline">{user.username}</p>
                  <p className="text-xs text-vynk-muted truncate">{user.role || 'Member'}</p>
                </div>
              </div>
              <button 
                onClick={() => handleFollow(user._id)}
                className="text-xs font-bold text-vynk-primary bg-vynk-primary/10 px-4 py-1.5 rounded-full hover:bg-vynk-primary/20 transition-colors"
              >
                Follow
              </button>
            </div>
          )) : (
            <p className="text-xs text-vynk-muted">No suggestions available right now.</p>
          )}
        </div>
      </div>

      {/* Trending Projects */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm text-vynk-muted uppercase tracking-wider">Trending Projects</h3>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map(i => (
            <div key={i} className="glass-card p-3 flex flex-col gap-1 cursor-pointer group">
              <h4 className="font-bold text-sm group-hover:text-vynk-primary transition-colors">AI Resume Builder</h4>
              <p className="text-xs text-vynk-muted">React • Node.js • OpenAI</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-medium text-green-700">Collab Open</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="mt-auto pt-6 border-t border-vynk-border">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-vynk-muted font-medium">
          <a href="#" className="hover:text-vynk-text">About</a>
          <a href="#" className="hover:text-vynk-text">Help Center</a>
          <a href="#" className="hover:text-vynk-text">Privacy</a>
          <a href="#" className="hover:text-vynk-text">Terms</a>
        </div>
        <p className="text-xs text-vynk-muted mt-4">© 2026 Vynk Corporation</p>
      </div>
    </aside>
  );
};

export default RightSidebar;
