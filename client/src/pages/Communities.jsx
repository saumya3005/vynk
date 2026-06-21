import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Hash, Users, Plus } from 'lucide-react';
import { communityApi } from '../api/communityApi';
import toast from 'react-hot-toast';
import CreateCommunityModal from '../components/ui/CreateCommunityModal';

const CommunityCard = ({ comm }) => {
  const { user } = useContext(AuthContext);
  const [isJoined, setIsJoined] = useState(comm.members?.includes(user?.id) || false);
  const [memberCount, setMemberCount] = useState(comm.members?.length || 0);

  const handleJoin = async () => {
    try {
      if (isJoined) {
        const updatedMembers = await communityApi.leaveCommunity(comm._id);
        setIsJoined(false);
        setMemberCount(updatedMembers.length);
        toast.success(`Left ${comm.name}`);
      } else {
        const updatedMembers = await communityApi.joinCommunity(comm._id);
        setIsJoined(true);
        setMemberCount(updatedMembers.length);
        toast.success(`Joined ${comm.name}`);
      }
    } catch (err) {
      toast.error('Failed to update community status');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden flex flex-col h-full"
    >
      <div className={`h-24 w-full bg-linear-to-tr from-primary to-secondary relative`}>
        {comm.banner && <img src={comm.banner} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />}
        <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center text-text">
          <Hash size={24} />
        </div>
      </div>
      
      <div className="p-6 pt-10 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-text mb-2 line-clamp-1">{comm.name}</h3>
        <p className="text-sm font-bold text-primary mb-3">{comm.category || 'General'}</p>
        <p className="text-sm text-muted mb-6 flex-1 line-clamp-3">{comm.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs font-bold text-text/70">
            <Users size={16} /> {memberCount} Members
          </div>
          <button 
            onClick={handleJoin}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              isJoined 
                ? 'bg-surface border border-border text-muted hover:text-red-500 hover:border-red-500' 
                : 'bg-ink text-white hover:bg-primary'
            }`}
          >
            {isJoined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const data = await communityApi.getCommunities();
      setCommunities(data);
    } catch (err) {
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-text mb-2">Communities</h1>
          <p className="text-muted font-medium max-w-xl">Join micro-ecosystems, find your tribe, participate in discussions, and attend virtual events.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary shrink-0">
          <Plus size={20} /> Create Community
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : communities.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-xl font-bold">No communities yet</p>
          <p className="text-sm">Be the first to create one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map(comm => (
            <CommunityCard key={comm._id} comm={comm} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateCommunityModal 
          onClose={() => setShowCreateModal(false)}
          onCreated={(newComm) => setCommunities([newComm, ...communities])}
        />
      )}
    </div>
  );
};

export default Communities;
