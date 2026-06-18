import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RightSidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-80 fixed right-0 top-0 h-screen border-l border-vynk-border bg-vynk-bg-2/30 backdrop-blur-md z-30 p-6 overflow-y-auto">
      
      {/* Search */}
      <div className="mb-8 relative">
        <input 
          type="text" 
          placeholder="Search Vynk..." 
          className="w-full bg-white/50 border border-vynk-border rounded-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-vynk-secondary/50 focus:bg-white transition-all"
        />
      </div>

      {/* Suggested People */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm text-vynk-muted uppercase tracking-wider">Suggested for you</h3>
          <Link to="/explore" className="text-xs font-semibold text-vynk-primary hover:underline">See All</Link>
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-accent to-vynk-secondary shrink-0"></div>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate hover:underline cursor-pointer">Sarah Designer</p>
                  <p className="text-xs text-vynk-muted truncate">UI/UX • 3 mutual</p>
                </div>
              </div>
              <button className="text-xs font-bold text-vynk-primary bg-vynk-primary/10 px-4 py-1.5 rounded-full hover:bg-vynk-primary/20 transition-colors">
                Follow
              </button>
            </div>
          ))}
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
