import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Search, Hash, Users, MessageCircle, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_COMMUNITIES = [
  {
    id: 1,
    name: 'Frontend Wizards',
    description: 'A community for modern React, Vue, and Tailwind developers. We discuss UI/UX, animations, and performance.',
    members: '12.5k',
    category: 'Development',
    color: 'from-pink-500 to-rose-500',
    isJoined: true
  },
  {
    id: 2,
    name: 'AI & Machine Learning',
    description: 'Deep learning, neural networks, PyTorch, and TensorFlow discussions. Research paper breakdowns every Sunday.',
    members: '8.2k',
    category: 'Data Science',
    color: 'from-violet-500 to-purple-500',
    isJoined: false
  },
  {
    id: 3,
    name: 'Startup Founders',
    description: 'Build, launch, and scale. Connect with co-founders, investors, and early adopters in the Vynk ecosystem.',
    members: '4.1k',
    category: 'Business',
    color: 'from-vynk-primary to-orange-500',
    isJoined: true
  },
  {
    id: 4,
    name: 'Open Source Contributors',
    description: 'Find issues, make pull requests, and build your GitHub portfolio together with supportive mentors.',
    members: '15k',
    category: 'Collaboration',
    color: 'from-emerald-500 to-teal-500',
    isJoined: false
  }
];

const CommunityCard = ({ comm }) => {
  const [joined, setJoined] = useState(comm.isJoined);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden flex flex-col"
    >
      <div className={`h-24 w-full bg-linear-to-tr ${comm.color} relative`}>
        <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center text-vynk-text">
          <Hash size={24} />
        </div>
      </div>
      
      <div className="p-6 pt-10 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-vynk-text mb-2">{comm.name}</h3>
        <p className="text-sm font-bold text-vynk-primary mb-3">{comm.category}</p>
        <p className="text-sm text-vynk-muted mb-6 flex-1">{comm.description}</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-vynk-border">
          <div className="flex items-center gap-2 text-xs font-bold text-vynk-text/70">
            <Users size={16} /> {comm.members} Members
          </div>
          <button 
            onClick={() => setJoined(!joined)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              joined 
                ? 'bg-vynk-bg-2 border border-vynk-border text-vynk-muted hover:text-red-500 hover:border-red-500' 
                : 'bg-vynk-text text-white hover:bg-vynk-primary'
            }`}
          >
            {joined ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Communities = () => {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-vynk-text mb-2">Communities</h1>
          <p className="text-vynk-muted font-medium max-w-xl">Join micro-ecosystems, find your tribe, participate in discussions, and attend virtual events.</p>
        </div>
        <button className="btn-primary shrink-0">
          <Plus size={20} /> Create Community
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COMMUNITIES.map(comm => (
          <CommunityCard key={comm.id} comm={comm} />
        ))}
        {MOCK_COMMUNITIES.map(comm => (
          <CommunityCard key={`dup-${comm.id}`} comm={{...comm, id: comm.id + 10, isJoined: false}} />
        ))}
      </div>
    </div>
  );
};

export default Communities;
