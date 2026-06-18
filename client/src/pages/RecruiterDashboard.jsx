import { Search, Filter, Briefcase } from 'lucide-react';

const RecruiterDashboard = () => {
  return (
    <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Talent Discovery</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-vynk-charcoal/50" size={18} />
            <input type="text" placeholder="Search skills or roles..." className="glass-input pl-10 py-2 w-64" />
          </div>
          <button className="btn-secondary flex items-center gap-2"><Filter size={18}/> Filters</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="glass-card p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-vynk-lavender"></div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Candidate {i}</h3>
                <p className="text-sm text-vynk-charcoal/60">Full Stack Developer</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-white/60 text-xs rounded border border-white">React</span>
              <span className="px-2 py-1 bg-white/60 text-xs rounded border border-white">Node.js</span>
            </div>
            <div className="mt-auto pt-4 border-t border-vynk-charcoal/10 flex justify-between">
              <button className="text-sm font-bold text-vynk-coral">View Profile</button>
              <button className="text-sm font-bold bg-vynk-charcoal text-white px-4 py-1.5 rounded-full">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
