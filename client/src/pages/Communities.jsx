import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';

const MOCK_COMMUNITIES = [
  { id: 1, name: 'Web Dev Mastery', members: 1200, category: 'Development' },
  { id: 2, name: 'Data Science Hub', members: 850, category: 'AI/ML' },
];

const Communities = () => {
  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Communities</h1>
        <button className="btn-primary flex items-center gap-2"><Plus size={18}/> Create</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_COMMUNITIES.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-vynk-peach/20 mx-auto mb-4 flex items-center justify-center text-vynk-coral"><Users size={30} /></div>
            <h3 className="font-bold text-xl mb-1">{c.name}</h3>
            <p className="text-sm text-vynk-charcoal/60 mb-4">{c.category} • {c.members} members</p>
            <button className="w-full btn-secondary py-2">Join</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Communities;
