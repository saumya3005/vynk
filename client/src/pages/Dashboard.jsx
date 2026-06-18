import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Award, Zap, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen pt-24 px-4 max-w-6xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.username}! 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-vynk-peach/20 text-vynk-coral flex items-center justify-center"><Zap size={24} /></div>
          <div><p className="text-2xl font-bold">1,250</p><p className="text-sm text-vynk-charcoal/60">Profile Views</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-vynk-mint/20 text-emerald-600 flex items-center justify-center"><BookOpen size={24} /></div>
          <div><p className="text-2xl font-bold">12</p><p className="text-sm text-vynk-charcoal/60">Notes Uploaded</p></div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-vynk-lavender/20 text-purple-600 flex items-center justify-center"><Award size={24} /></div>
          <div><p className="text-2xl font-bold">Pro</p><p className="text-sm text-vynk-charcoal/60">Current Badge</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4">Profile Completion</h2>
          <div className="w-full bg-vynk-charcoal/10 rounded-full h-2 mb-2">
            <div className="bg-linear-to-r from-vynk-coral to-vynk-peach h-2 rounded-full w-[80%]"></div>
          </div>
          <p className="text-sm text-vynk-charcoal/60">80% Complete. Add a resume to reach 100%.</p>
        </div>
        
        <div className="glass-card p-6">
          <h2 className="font-bold text-xl mb-4">Recent Activity</h2>
          <p className="text-sm text-vynk-charcoal/60">You liked "AI Code Assistant" project.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
