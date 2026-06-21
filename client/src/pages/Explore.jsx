import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Briefcase, FileText, FileVideo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { postApi } from '../api/postApi';
import { projectApi } from '../api/projectApi';
import { noteApi } from '../api/noteApi';
import toast from 'react-hot-toast';

const Explore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('trending');
  const tabs = ['Trending', 'People', 'Projects', 'Notes'];

  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        // Reset to initial
        fetchInitialData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [uRes, pRes, projRes, nRes] = await Promise.all([
        userApi.getSuggestions().catch(() => []),
        postApi.getPosts().catch(() => []),
        projectApi.getProjects().catch(() => []),
        noteApi.getNotes().catch(() => [])
      ]);
      setSuggestedUsers(uRes.slice(0, 5));
      setUsers(uRes);
      setPosts(pRes.slice(0, 10)); // Top 10 for trending
      setProjects(projRes);
      setNotes(nRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (q) => {
    setIsLoading(true);
    try {
      const [uRes, pRes, projRes, nRes] = await Promise.all([
        userApi.searchUsers(q).catch(() => []),
        postApi.getPosts().catch(() => []),
        projectApi.getProjects().catch(() => []),
        noteApi.getNotes().catch(() => [])
      ]);

      setUsers(uRes);
      
      const lowerQ = q.toLowerCase();
      setPosts(pRes.filter(p => p.content?.toLowerCase().includes(lowerQ)));
      setProjects(projRes.filter(p => p.title?.toLowerCase().includes(lowerQ) || p.description?.toLowerCase().includes(lowerQ)));
      setNotes(nRes.filter(n => n.title?.toLowerCase().includes(lowerQ) || n.subject?.toLowerCase().includes(lowerQ)));

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (activeTab === 'people') {
      if (users.length === 0) return <div className="text-center py-10 text-muted">No people found.</div>;
      return (
        <div className="flex flex-col gap-4">
          {users.map(u => (
            <div key={u._id} className="glass-card p-4 flex items-center justify-between cursor-pointer hover:bg-white/40" onClick={() => navigate(`/profile/${u._id}`)}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20">
                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary">{u.username?.[0]?.toUpperCase()}</div>}
                </div>
                <div>
                  <h4 className="font-bold text-text">{u.username}</h4>
                  <p className="text-xs text-muted">{u.role || 'Member'} • {u.location || 'Earth'}</p>
                </div>
              </div>
              <button className="btn-secondary text-xs px-4 py-1.5" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}>View</button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'projects') {
      if (projects.length === 0) return <div className="text-center py-10 text-muted">No projects found.</div>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p._id} className="glass-card p-5 cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate(`/projects/${p._id}`)}>
              <h4 className="font-bold text-lg mb-2 truncate text-text group-hover:text-primary">{p.title}</h4>
              <p className="text-sm text-muted line-clamp-2 mb-3">{p.description}</p>
              <div className="flex items-center gap-2">
                <img src={p.owner?.avatar || 'https://via.placeholder.com/40'} alt="" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-bold">{p.owner?.username}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'notes') {
      if (notes.length === 0) return <div className="text-center py-10 text-muted">No notes found.</div>;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n._id} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText size={20} /></div>
                <div>
                  <h4 className="font-bold text-text truncate">{n.title}</h4>
                  <p className="text-xs text-muted">{n.subject} • {n.semester}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default: trending posts
    if (posts.length === 0) return <div className="text-center py-10 text-muted">No posts found.</div>;
    return (
      <div className="flex flex-col gap-6">
        {posts.map(post => (
          <div key={post._id} className="glass-card p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/feed`)}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20">
                {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-primary">{post.author?.username?.[0]?.toUpperCase()}</div>}
              </div>
              <div>
                <span className="font-bold text-text">{post.author?.username}</span>
                <span className="text-xs text-muted block">{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {post.mediaUrl && post.mediaType === 'image' && (
               <img src={post.mediaUrl} alt="" className="w-full max-h-64 object-cover rounded-xl mb-4" />
            )}
            <p className="text-text/80 leading-relaxed line-clamp-3">{post.content}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-4 md:pt-8 px-4 md:px-6 max-w-5xl mx-auto flex flex-col gap-8 pb-24 md:pb-12">
      
      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative w-full shadow-lg rounded-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
        <input 
          type="text" 
          placeholder="Search people, posts, projects, or notes..." 
          className="w-full glass-input pl-12 py-4 text-lg font-medium"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === tab.toLowerCase() 
              ? 'bg-text text-white shadow-md' 
              : 'bg-white border border-border text-muted hover:text-text hover:bg-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-text">
            {activeTab === 'trending' ? <TrendingUp className="text-primary" /> : null}
            {activeTab === 'people' ? <Users className="text-secondary" /> : null}
            {activeTab === 'projects' ? <Briefcase className="text-accent" /> : null}
            {activeTab === 'notes' ? <FileText className="text-yellow-600" /> : null}
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} {searchQuery && `Results for "${searchQuery}"`}
          </h2>
          
          {renderContent()}
        </div>

        {/* Sidebar */}
        <div className="hidden md:flex flex-col gap-6">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-text"><Users size={18} className="text-primary" /> Suggested Users</h3>
            {isLoading ? (
              <div className="text-center py-4 text-sm text-muted">Loading...</div>
            ) : suggestedUsers.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted">No suggestions right now.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {suggestedUsers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between cursor-pointer hover:opacity-80" onClick={() => navigate(`/profile/${u._id}`)}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 shrink-0">
                         {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary">{u.username?.[0]?.toUpperCase()}</div>}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold leading-tight truncate max-w-25">{u.username}</p>
                        <p className="text-xs text-muted truncate max-w-25">{u.role || 'Member'}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}>View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
