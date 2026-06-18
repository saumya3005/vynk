import { Bell, Heart, UserPlus, MessageCircle } from 'lucide-react';

const Notifications = () => {
  return (
    <div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="text-vynk-coral"/> Notifications</h1>
        <button className="text-sm font-medium text-vynk-charcoal/60 hover:text-vynk-charcoal">Mark all as read</button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="glass-card p-4 flex gap-4 items-center bg-white/60 border-l-4 border-l-vynk-coral">
          <div className="w-10 h-10 rounded-full bg-vynk-peach/20 flex items-center justify-center text-vynk-coral"><Heart size={18}/></div>
          <p className="text-sm"><span className="font-bold">Sarah</span> liked your post "Just launched my new project!"</p>
        </div>
        <div className="glass-card p-4 flex gap-4 items-center bg-white/40">
          <div className="w-10 h-10 rounded-full bg-vynk-mint/20 flex items-center justify-center text-emerald-600"><UserPlus size={18}/></div>
          <p className="text-sm"><span className="font-bold">Alex</span> started following you.</p>
        </div>
        <div className="glass-card p-4 flex gap-4 items-center bg-white/40">
          <div className="w-10 h-10 rounded-full bg-vynk-lavender/20 flex items-center justify-center text-purple-600"><MessageCircle size={18}/></div>
          <p className="text-sm"><span className="font-bold">John</span> commented on your project.</p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
