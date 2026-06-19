import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Briefcase, MapPin, GraduationCap, Code, Star, CheckCircle } from 'lucide-react';

const MOCK_CANDIDATES = [
  {
    id: 1,
    name: 'Sarah Designer',
    role: 'UI/UX Engineer',
    university: 'Design Institute',
    location: 'Remote',
    skills: ['React', 'Figma', 'Tailwind', 'CSS'],
    experience: '2 Years',
    avatar: 'https://i.pravatar.cc/150?u=2',
    matchScore: 95
  },
  {
    id: 2,
    name: 'Alex Developer',
    role: 'Full Stack Developer',
    university: 'Tech University',
    location: 'New York, USA',
    skills: ['Node.js', 'MongoDB', 'React', 'AWS'],
    experience: 'Fresher',
    avatar: 'https://i.pravatar.cc/150?u=1',
    matchScore: 88
  },
  {
    id: 3,
    name: 'Mike Code',
    role: 'Backend Engineer',
    university: 'State College',
    location: 'London, UK',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    experience: '3 Years',
    avatar: 'https://i.pravatar.cc/150?u=3',
    matchScore: 82
  }
];

const CandidateCard = ({ candidate }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 flex flex-col md:flex-row gap-6 items-center md:items-start group hover:border-primary transition-colors"
  >
    <div className="relative shrink-0">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-bg-2 shadow-lg">
        <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
      </div>
      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-md">
        {candidate.matchScore}%
      </div>
    </div>
    
    <div className="flex-1 text-center md:text-left">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-text group-hover:text-primary transition-colors">{candidate.name}</h3>
          <p className="text-muted font-semibold">{candidate.role}</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2 justify-center md:justify-end">
          <button className="btn-secondary px-4 py-1.5 text-sm">View Profile</button>
          <button className="btn-primary px-4 py-1.5 text-sm">Message</button>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4 text-sm font-medium text-muted">
        <span className="flex items-center gap-1"><MapPin size={16} /> {candidate.location}</span>
        <span className="flex items-center gap-1"><GraduationCap size={16} /> {candidate.university}</span>
        <span className="flex items-center gap-1"><Briefcase size={16} /> {candidate.experience}</span>
      </div>
      
      <div className="flex flex-wrap justify-center md:justify-start gap-2">
        {candidate.skills.map(skill => (
          <span key={skill} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-bold text-text">
            {skill}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const RecruiterDashboard = () => {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-900 to-black rounded-3xl p-8 md:p-12 text-white mb-10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold text-white mb-6 border border-white/20">
            Vynk Talent Solutions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find your next star employee.</h1>
          <p className="text-lg text-white/70 mb-8">Access the top 1% of student developers and designers. Filter by skills, projects, and verified experience.</p>
          <button className="bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-xl font-bold transition-colors">
            Post a Job
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input type="text" placeholder="Search by role, skill, or keyword..." className="w-full bg-surface border-none rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary text-text" />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl font-bold text-text border border-border hover:border-primary transition-colors">
            <Code size={18} /> Skills
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white rounded-xl font-bold text-text border border-border hover:border-primary transition-colors">
            <Filter size={18} /> Filters
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-text">Recommended Candidates</h2>
        <span className="text-sm font-bold text-muted">Showing 24 matches</span>
      </div>

      {/* Candidate List */}
      <div className="flex flex-col gap-4">
        {MOCK_CANDIDATES.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
