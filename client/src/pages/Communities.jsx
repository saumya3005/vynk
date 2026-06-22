import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Hash, Users, Plus, Search, Flame, Star, Globe, Lock, ChevronRight, Crown } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import toast from 'react-hot-toast';
import CreateCommunityModal from '../components/ui/CreateCommunityModal';
import { EmptyState } from '../components/ui/EmptyState';

const CATEGORY_COLORS = {
  Technology: 'from-blue-500 to-cyan-500',
  Design: 'from-pink-500 to-rose-500',
  Gaming: 'from-purple-500 to-violet-500',
  Science: 'from-green-500 to-emerald-500',
  Business: 'from-amber-500 to-orange-500',
  Education: 'from-indigo-500 to-blue-500',
  General: 'from-primary to-secondary',
};

const CommunityCard = ({ comm, onJoinToggle }) => {
  const { user } = useContext(AuthContext);
  const [isJoined, setIsJoined] = useState(comm.members?.includes(user?.id) || false);
  const [memberCount, setMemberCount] = useState(comm.members?.length || 0);
  const [loading, setLoading] = useState(false);

  const gradient = CATEGORY_COLORS[comm.category] || CATEGORY_COLORS.General;

  const handleJoin = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      if (isJoined) {
        const updatedMembers = await communityApi.leaveCommunity(comm._id);
        setIsJoined(false);
        setMemberCount(updatedMembers.length);
        toast('Left community', { icon: '👋' });
      } else {
        const updatedMembers = await communityApi.joinCommunity(comm._id);
        setIsJoined(true);
        setMemberCount(updatedMembers.length);
        toast.success(`Joined ${comm.name}!`);
      }
    } catch {
      toast.error('Failed to update community status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="glass-card overflow-hidden flex flex-col border border-border/30 group cursor-pointer"
    >
      {/* Banner */}
      <div className={`relative h-28 w-full bg-linear-to-tr ${gradient} overflow-hidden`}>
        {comm.banner && (
          <img src={comm.banner} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" alt="" />
        )}
        {/* Shimmer on hover */}
        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 backdrop-blur-sm text-white px-2 py-1 rounded-full">
            {comm.category || 'General'}
          </span>
        </div>

        {/* Community icon */}
        <div className={`absolute -bottom-5 left-5 w-10 h-10 rounded-2xl bg-linear-to-tr ${gradient} shadow-lg flex items-center justify-center text-white border-2 border-surface`}>
          <Hash size={18} />
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-bold text-text leading-snug line-clamp-1">{comm.name}</h3>
          {comm.isPrivate && <Lock size={14} className="text-muted shrink-0 mt-0.5" />}
        </div>

        <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-5 flex-1">{comm.description}</p>

        {/* Member avatars + count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, memberCount))].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full bg-linear-to-tr ${gradient} border-2 border-surface flex items-center justify-center text-white text-[8px] font-black`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-muted">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              isJoined
                ? 'border-border/60 text-muted hover:border-red-400 hover:text-red-400'
                : 'bg-linear-to-r from-primary to-secondary text-white border-transparent hover:opacity-90 shadow-sm shadow-primary/20'
            }`}
          >
            {loading ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : isJoined ? 'Joined ✓' : 'Join'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const FILTERS = ['All', 'Technology', 'Design', 'Gaming', 'Science', 'Business', 'Education'];

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const data = await communityApi.getCommunities();
      setCommunities(data);
    } catch {
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  const displayed = communities.filter(c => {
    const matchFilter = activeFilter === 'All' || c.category === activeFilter;
    const matchSearch = !searchQuery.trim() || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">Discover</p>
            <h1 className="text-3xl md:text-4xl font-black text-text leading-tight mb-2">
              Communities
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary"> Hub</span>
            </h1>
            <p className="text-muted max-w-lg">Join spaces, find your tribe, and participate in real discussions with people who share your interests.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary shrink-0 gap-2 flex items-center">
            <Plus size={18} /> Create Community
          </button>
        </div>
      </motion.div>

      {/* Featured Banner */}
      <div className="mb-8 rounded-3xl overflow-hidden relative h-36 bg-linear-to-r from-secondary via-primary to-accent">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.4),transparent_60%)]" />
        <div className="relative z-10 p-8 flex items-center gap-6 h-full">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
            <Crown size={28} />
          </div>
          <div>
            <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Featured</p>
            <h2 className="text-white text-2xl font-black">Grow with your community</h2>
            <p className="text-white/60 text-sm mt-0.5">{communities.length} active communities · Join the conversation</p>
          </div>
          <div className="ml-auto flex gap-4 text-white/70">
            <Flame size={32} className="animate-pulse" />
            <Globe size={32} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search communities..."
            className="glass-input w-full pl-11 py-3"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeFilter === f
                  ? 'bg-linear-to-r from-primary to-secondary text-white border-transparent shadow-md shadow-primary/20'
                  : 'border-border/40 text-muted hover:text-text bg-surface-soft/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className="glass-card h-64 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <EmptyState icon={Hash} title="No communities found" message={searchQuery ? `No results for "${searchQuery}"` : 'Be the first to create one!'} />
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map(comm => (
              <CommunityCard key={comm._id} comm={comm} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onCreated={newComm => setCommunities([newComm, ...communities])}
        />
      )}
    </div>
  );
};

export default Communities;
