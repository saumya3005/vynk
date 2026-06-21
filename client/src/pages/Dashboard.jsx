import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Activity, TrendingUp, Users, Eye, Target, BookOpen, Clock, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
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
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/analytics');
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-screen pt-24 px-4 text-center">Loading...</div>;

  const maxChartValue = Math.max(...(stats?.timeline?.map(t => Math.max(t.views, t.engagement)) || [1]));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-text mb-2">Welcome back, {user?.username || 'User'}! 👋</h1>
        <p className="text-muted font-medium">Here's what's happening with your profile and projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Views" value={stats?.totalViews || 0} icon={Eye} color="from-blue-500 to-indigo-500" />
        <StatCard title="Engagement" value={stats?.totalEngagement || 0} icon={Activity} color="from-primary to-orange-500" />
        <StatCard title="Projects" value={stats?.projectsCount || 0} icon={Target} color="from-purple-500 to-pink-500" />
        <StatCard title="Notes Uploaded" value={stats?.notesCount || 0} icon={BookOpen} color="from-emerald-500 to-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Chart Area */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text">Activity Overview (Last 7 Days)</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary"></div> Views</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-secondary"></div> Engagement</span>
            </div>
          </div>
          
          <div className="flex-1 bg-surface rounded-xl border border-border flex items-end justify-between px-4 sm:px-8 pt-10 pb-4 gap-2 relative overflow-hidden min-h-64">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            {stats?.timeline?.map((day, i) => {
              const viewsHeight = (day.views / maxChartValue) * 100;
              const engagementHeight = (day.engagement / maxChartValue) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end relative z-10 group">
                  <div className="flex items-end justify-center gap-1 sm:gap-2 w-full h-[80%]">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(5, viewsHeight)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="w-1/3 max-w-5 bg-primary rounded-t-md opacity-80 hover:opacity-100 transition-opacity relative"
                      title={`Views: ${day.views}`}
                    ></motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(5, engagementHeight)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.2 }}
                      className="w-1/3 max-w-5 bg-secondary rounded-t-md opacity-80 hover:opacity-100 transition-opacity relative"
                      title={`Engagement: ${day.engagement}`}
                    ></motion.div>
                  </div>
                  <div className="text-[10px] text-muted font-bold mt-2 truncate w-full text-center">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity (Mocked since we didn't build an activity feed backend yet) */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-text">System Info</h3>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-100 text-blue-500">
                <Target size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text mb-1">{stats?.postsCount} Total Posts</p>
                <p className="text-xs text-muted flex items-center gap-1">Community posts made</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-purple-100 text-purple-500">
                <Users size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text mb-1">{user?.followers?.length || 0} Followers</p>
                <p className="text-xs text-muted flex items-center gap-1">People following you</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
