import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Activity, TrendingUp, Users, Eye, Target, BookOpen, Clock, ChevronRight } from 'lucide-react';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="glass-card p-6 relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 w-24 h-24 bg-linear-to-tr ${color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500`}></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-sm font-bold text-muted uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-text">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl bg-linear-to-tr ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="flex items-center gap-2 relative z-10">
      <span className={`text-xs font-bold px-2 py-1 rounded-md ${change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {change}
      </span>
      <span className="text-xs font-medium text-muted">vs last month</span>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-text mb-2">Welcome back, {user?.username || 'User'}! 👋</h1>
        <p className="text-muted font-medium">Here's what's happening with your profile and projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Profile Views" value="2,405" change="+14.5%" icon={Eye} color="from-blue-500 to-indigo-500" />
        <StatCard title="Post Engagement" value="842" change="+5.2%" icon={Activity} color="from-primary to-orange-500" />
        <StatCard title="New Followers" value="128" change="+22.1%" icon={Users} color="from-emerald-500 to-teal-500" />
        <StatCard title="Profile Rank" value="Top 5%" change="+1.2%" icon={Target} color="from-purple-500 to-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart Area (Mockup) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text">Engagement Overview</h3>
            <select className="bg-surface border border-border rounded-lg px-3 py-1 text-sm font-medium text-text focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex-1 bg-surface rounded-xl border border-border flex items-center justify-center min-h-75 relative overflow-hidden">
            {/* Abstract visual representation of a chart since we don't have Recharts installed */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            <div className="w-full h-full flex items-end justify-between px-8 pt-10 pb-8 gap-2">
              {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="w-full max-w-10 bg-linear-to-t from-primary to-secondary rounded-t-md opacity-80 hover:opacity-100 transition-opacity relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h * 12}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text">Recent Activity</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-6">
            {[
              { id: 1, icon: TrendingUp, color: 'text-green-500 bg-green-100', text: 'Your post reached 1k views', time: '2h ago' },
              { id: 2, icon: Users, color: 'text-blue-500 bg-blue-100', text: 'Alex and 4 others followed you', time: '5h ago' },
              { id: 3, icon: BookOpen, color: 'text-purple-500 bg-purple-100', text: 'Someone downloaded your notes', time: '1d ago' },
              { id: 4, icon: Target, color: 'text-orange-500 bg-orange-100', text: 'You unlocked "Consistent" badge', time: '2d ago' },
            ].map(item => (
              <div key={item.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text mb-1">{item.text}</p>
                  <p className="text-xs text-muted flex items-center gap-1"><Clock size={12} /> {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
