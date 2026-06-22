import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Activity, TrendingUp, Users, Eye, Target, BookOpen, Clock, BarChart2, Heart, MessageCircle, Zap, ArrowUp } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { PostSkeleton } from '../components/ui/Skeleton';

const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="glass-card p-6 relative overflow-hidden group border border-border/30"
  >
    {/* Glow blob */}
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-linear-to-tr ${gradient} opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`} />

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5">{title}</p>
        <h3 className="text-3xl font-black text-text tabular-nums">{value}</h3>
        {trend !== undefined && (
          <p className={`text-xs font-bold mt-1.5 flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <ArrowUp size={11} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}% this week
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-2xl bg-linear-to-tr ${gradient} text-white shadow-lg shadow-black/20`}>
        <Icon size={22} />
      </div>
    </div>
  </motion.div>
);

const MiniBarChart = ({ data, maxVal, color }) => (
  <div className="flex items-end gap-1 h-12">
    {data.map((v, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(6, (v / Math.max(maxVal, 1)) * 100)}%` }}
        transition={{ duration: 0.8, delay: i * 0.07 }}
        className={`flex-1 rounded-t-sm ${color} opacity-80`}
        title={v}
      />
    ))}
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
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const maxChartValue = Math.max(...(stats?.timeline?.map(t => Math.max(t.views, t.engagement)) || [1]));

  const viewData = stats?.timeline?.map(t => t.views) || [];
  const engageData = stats?.timeline?.map(t => t.engagement) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-muted uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-black text-text leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">{user?.username || 'User'}</span> 👋
          </h1>
          <p className="text-muted font-medium mt-2">Here's how your profile performed this week.</p>
        </div>
        <Link to="/profile" className="btn-primary py-2.5 px-5 text-sm self-start flex items-center gap-2">
          <Eye size={16} /> View Profile
        </Link>
      </motion.div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[0,1,2,3].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Profile Views" value={stats?.totalViews ?? 0} icon={Eye} gradient="from-blue-500 to-indigo-600" />
          <StatCard title="Total Engagement" value={stats?.totalEngagement ?? 0} icon={Activity} gradient="from-primary to-orange-500" />
          <StatCard title="Followers" value={user?.followers?.length ?? 0} icon={Users} gradient="from-secondary to-purple-600" />
          <StatCard title="Projects" value={stats?.projectsCount ?? 0} icon={Target} gradient="from-emerald-500 to-teal-600" />
        </div>
      )}

      {/* Secondary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Posts', value: stats?.postsCount ?? 0, icon: MessageCircle, color: 'text-accent' },
          { label: 'Notes', value: stats?.notesCount ?? 0, icon: BookOpen, color: 'text-yellow-400' },
          { label: 'Following', value: user?.following?.length ?? 0, icon: Zap, color: 'text-green-400' },
          { label: 'Engagement Rate', value: `${stats?.postsCount ? Math.round((stats.totalEngagement / stats.postsCount) * 10) / 10 : 0}x`, icon: TrendingUp, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 flex items-center gap-3 border border-border/20">
            <div className={`p-2 rounded-xl bg-white/5 ${color}`}><Icon size={18} /></div>
            <div>
              <p className="text-lg font-black text-text">{value}</p>
              <p className="text-[11px] text-muted font-bold">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Activity Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col border border-border/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg text-text">Activity Overview</h3>
              <p className="text-xs text-muted mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-primary" />Views</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-secondary" />Engagement</span>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 px-2 pt-6 pb-4 border-t border-border/30 min-h-56">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-surface-soft rounded-xl" />
            ) : stats?.timeline?.map((day, i) => {
              const viewsH = (day.views / maxChartValue) * 100;
              const engH = (day.engagement / maxChartValue) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                  <div className="flex items-end justify-center gap-1 w-full h-[80%]">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, viewsH)}%` }}
                      transition={{ duration: 0.9, delay: i * 0.08 }}
                      className="w-1/3 max-w-4 bg-linear-to-t from-primary/60 to-primary rounded-t-sm group-hover:opacity-100 opacity-70 transition-opacity"
                      title={`Views: ${day.views}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(4, engH)}%` }}
                      transition={{ duration: 0.9, delay: i * 0.08 + 0.15 }}
                      className="w-1/3 max-w-4 bg-linear-to-t from-secondary/60 to-secondary rounded-t-sm group-hover:opacity-100 opacity-70 transition-opacity"
                      title={`Engagement: ${day.engagement}`}
                    />
                  </div>
                  <div className="text-[10px] text-muted font-bold mt-2 text-center">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick stats panel */}
        <div className="glass-card p-6 flex flex-col gap-6 border border-border/30">
          <h3 className="font-bold text-lg text-text">Your Highlights</h3>

          <div className="flex flex-col gap-4">
            {[
              { label: 'Views mini', data: viewData, color: 'bg-primary', title: 'Views (7d)' },
              { label: 'Engagement mini', data: engageData, color: 'bg-secondary', title: 'Engagement (7d)' },
            ].map(({ label, data, color, title }) => (
              <div key={label} className="p-4 rounded-2xl bg-surface-soft/60 border border-border/20">
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-3">{title}</p>
                <MiniBarChart data={data} maxVal={Math.max(...data, 1)} color={color} />
              </div>
            ))}
          </div>

          <div className="border-t border-border/30 pt-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Quick Links</p>
            {[
              { label: 'Create a Post', path: '/feed', color: 'text-primary' },
              { label: 'Add a Project', path: '/projects', color: 'text-accent' },
              { label: 'Upload Notes', path: '/notes', color: 'text-yellow-400' },
            ].map(({ label, path, color }) => (
              <Link key={path} to={path} className={`text-sm font-bold ${color} hover:underline flex items-center gap-2`}>
                <ArrowUp size={12} className="rotate-45" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
