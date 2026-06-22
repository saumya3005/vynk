import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Briefcase, FileText, FileVideo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { searchApi } from '../api/searchApi';
import { postApi } from '../api/postApi';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';

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
      const [uRes, tRes, pRes] = await Promise.all([
        userApi.getSuggestions().catch(() => []),
        searchApi.getTrending().catch(() => ({ users: [], projects: [], notes: [], communities: [] })),
        postApi.getFeedTrending().catch(() => [])
      ]);
      setSuggestedUsers(uRes.slice(0, 5));
      setUsers(tRes.users);
      setPosts(pRes);
      setProjects(tRes.projects);
      setNotes(tRes.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (q) => {
    setIsLoading(true);
    try {
      const sRes = await searchApi.globalSearch(q);
      setUsers(sRes.users || []);
      setProjects(sRes.projects || []);
      setNotes(sRes.notes || []);
      
      // Keep trending posts if search posts not supported, or hide posts
      setPosts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          <div className="break-inside-avoid glass-card p-6 min-h-50"><Skeleton className="h-full w-full" /></div>
          <div className="break-inside-avoid glass-card p-6 min-h-75"><Skeleton className="h-full w-full" /></div>
          <div className="break-inside-avoid glass-card p-6 min-h-62.5"><Skeleton className="h-full w-full" /></div>
        </div>
      );
    }

    if (activeTab === 'people') {
      if (users.length === 0) return <EmptyState icon={Users} title="No people found" message="Try searching for someone else." />;
      return (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {users.map(u => (
            <div key={u._id} className="break-inside-avoid glass-card p-5 flex flex-col items-center cursor-pointer hover:bg-white/40 transition-colors" onClick={() => navigate(`/profile/${u._id}`)}>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/20 mb-3 border-2 border-primary/20">
                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">{u.username?.[0]?.toUpperCase()}</div>}
              </div>
              <h4 className="font-bold text-text text-lg">{u.username}</h4>
              <p className="text-sm text-muted mb-4">{u.role || 'Member'} • {u.location || 'Earth'}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {u.skills?.slice(0, 3).map((s, i) => (
                  <span key={i} className="text-xs bg-surface-soft text-text px-2 py-1 rounded-md">{s}</span>
                ))}
              </div>
              <button className="btn-secondary w-full py-2" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}>View Profile</button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'projects') {
      if (projects.length === 0) return <EmptyState icon={Briefcase} title="No projects found" message="Try searching for something else." />;
      return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {projects.map(p => (
            <div key={p._id} className="break-inside-avoid glass-card p-5 cursor-pointer hover:-translate-y-1 transition-transform border border-border/40" onClick={() => navigate(`/projects/${p._id}`)}>
              <h4 className="font-bold text-lg mb-2 text-text group-hover:text-primary">{p.title}</h4>
              <p className="text-sm text-muted mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.techStack?.slice(0, 3).map((tech, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider font-bold bg-accent/10 text-accent px-2 py-1 rounded-sm">{tech}</span>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                <div className="flex items-center gap-2">
                  <img src={p.owner?.avatar || 'https://via.placeholder.com/40'} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs font-bold text-text">{p.owner?.username}</span>
                </div>
                <span className="text-xs font-bold text-muted">{p.views || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'notes') {
      if (notes.length === 0) return <EmptyState icon={FileText} title="No notes found" message="Try searching for another subject." />;
      return (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {notes.map(n => (
            <div key={n._id} className="break-inside-avoid glass-card p-5 border border-border/40 flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-lg shrink-0"><FileText size={24} /></div>
                <div>
                  <h4 className="font-bold text-text text-lg leading-tight">{n.title}</h4>
                  <p className="text-sm text-muted mt-1">{n.subject} • {n.semester}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-auto border-t border-border/40 pt-4">
                <span className="text-xs font-medium text-muted">{n.downloads || 0} Downloads</span>
                <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors">Download</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default: trending posts (masonry layout like pinterest)
    if (posts.length === 0) return <EmptyState icon={TrendingUp} title="No trending posts" message="Check back later for trending content." />;
    return (
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {posts.map(post => (
          <div key={post._id} className="break-inside-avoid glass-card overflow-hidden cursor-pointer hover:shadow-xl transition-shadow border border-border/40" onClick={() => navigate(`/feed`)}>
            {post.mediaUrl && post.mediaType === 'image' && (
               <img src={post.mediaUrl} alt="" className="w-full h-auto object-cover" />
            )}
            <div className="p-5">
              <p className="text-text leading-relaxed text-sm mb-4">{post.content}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20">
                  {post.author?.avatar ? <img src={post.author.avatar} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-xs text-primary">{post.author?.username?.[0]?.toUpperCase()}</div>}
                </div>
                <div>
                  <span className="font-bold text-sm text-text block">{post.author?.username}</span>
                  <span className="text-[10px] text-muted block">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
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
              ? 'bg-ink text-white shadow-md' 
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
