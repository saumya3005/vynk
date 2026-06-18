import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Briefcase } from 'lucide-react';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('trending');
  const tabs = ['Trending', 'People', 'Projects', 'Notes', 'Communities'];

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      
      {/* Search Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vynk-charcoal/50" size={20} />
        <input 
          type="text" 
          placeholder="Search people, posts, projects, or notes..." 
          className="w-full glass-input pl-12 py-4 text-lg"
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-6 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
              activeTab === tab.toLowerCase() 
              ? 'bg-vynk-charcoal text-white shadow-md' 
              : 'bg-white/50 text-vynk-charcoal/70 hover:bg-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="text-vynk-coral" /> Trending Posts
          </h2>
          {/* Mock Trending Post */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-vynk-lavender"></div>
              <span className="font-semibold">Vynk Official</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to Vynk Platform! 🚀</h3>
            <p className="text-vynk-charcoal/80 mb-4">The ultimate ecosystem for students, developers, and creators to connect and collaborate.</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-vynk-peach/20 text-vynk-coral rounded-lg text-sm">#announcement</span>
              <span className="px-3 py-1 bg-vynk-mint/20 text-vynk-mint rounded-lg text-sm">#welcome</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Users size={18} /> Suggested Users</h3>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-mint to-vynk-lilac"></div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">DevUser{i}</p>
                      <p className="text-xs text-vynk-charcoal/50">React Developer</p>
                    </div>
                  </div>
                  <button className="text-xs font-medium text-vynk-coral bg-vynk-peach/10 px-3 py-1 rounded-full hover:bg-vynk-peach/20">Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4"><Briefcase size={18} /> Top Projects</h3>
            <div className="flex flex-col gap-3 text-sm font-medium">
              <p className="hover:text-vynk-coral cursor-pointer truncate">AI Code Assistant CLI</p>
              <p className="hover:text-vynk-lavender cursor-pointer truncate">Campus Notes Sharing App</p>
              <p className="hover:text-vynk-mint cursor-pointer truncate">Web3 Social Network</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
