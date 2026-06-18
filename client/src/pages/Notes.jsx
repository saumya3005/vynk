import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Upload, Download, Star, Book, FileText, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_NOTES = [
  {
    id: 1,
    title: 'Complete Data Structures & Algorithms',
    subject: 'Computer Science',
    author: 'Alex Developer',
    rating: 4.9,
    downloads: 12500,
    tags: ['C++', 'Trees', 'Graphs'],
    color: 'from-blue-500 to-indigo-500',
    semester: 'Semester 3'
  },
  {
    id: 2,
    title: 'Advanced React Patterns',
    subject: 'Web Engineering',
    author: 'Sarah Designer',
    rating: 4.8,
    downloads: 8400,
    tags: ['React', 'Frontend', 'Hooks'],
    color: 'from-vynk-primary to-vynk-secondary',
    semester: 'Semester 6'
  },
  {
    id: 3,
    title: 'Machine Learning Mathematics',
    subject: 'Artificial Intelligence',
    author: 'Mike Code',
    rating: 5.0,
    downloads: 3200,
    tags: ['Linear Algebra', 'Calculus', 'Stats'],
    color: 'from-emerald-500 to-teal-500',
    semester: 'Semester 5'
  },
  {
    id: 4,
    title: 'Operating Systems Mastery',
    subject: 'Computer Science',
    author: 'Josh Sys',
    rating: 4.7,
    downloads: 6100,
    tags: ['Linux', 'Memory', 'Concurrency'],
    color: 'from-orange-500 to-red-500',
    semester: 'Semester 4'
  }
];

const NoteCard = ({ note }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${note.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
      <FileText size={24} />
    </div>
    
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-bold text-lg text-vynk-text group-hover:text-vynk-primary transition-colors line-clamp-2 pr-4">{note.title}</h3>
      <button className="text-vynk-muted hover:text-vynk-secondary shrink-0"><Bookmark size={20} /></button>
    </div>
    
    <p className="text-sm font-medium text-vynk-muted mb-4">{note.subject} • {note.semester}</p>
    
    <div className="flex flex-wrap gap-2 mb-6">
      {note.tags.map(tag => (
        <span key={tag} className="px-2 py-1 bg-white border border-vynk-border rounded-md text-[10px] font-bold text-vynk-text uppercase tracking-wider">
          {tag}
        </span>
      ))}
    </div>
    
    <div className="flex items-center justify-between mt-auto pt-4 border-t border-vynk-border">
      <div className="flex items-center gap-4 text-xs font-bold text-vynk-text/70">
        <span className="flex items-center gap-1 text-yellow-600"><Star size={14} className="fill-yellow-600" /> {note.rating}</span>
        <span className="flex items-center gap-1"><Download size={14} /> {(note.downloads/1000).toFixed(1)}k</span>
      </div>
      <button className="w-8 h-8 rounded-full bg-vynk-primary/10 text-vynk-primary flex items-center justify-center hover:bg-vynk-primary hover:text-white transition-colors">
        <Download size={16} />
      </button>
    </div>
  </motion.div>
);

const Notes = () => {
  const [activeTab, setActiveTab] = useState('Trending');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-vynk-text mb-2">Notes Marketplace</h1>
          <p className="text-vynk-muted font-medium max-w-xl">Discover, download, and share high-quality study materials, lecture notes, and cheat sheets.</p>
        </div>
        <Link to="/notes/upload" className="btn-primary shrink-0">
          <Upload size={20} /> Upload Notes
        </Link>
      </div>

      {/* Controls */}
      <div className="glass-card p-2 flex flex-col md:flex-row gap-2 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-vynk-muted" size={20} />
          <input type="text" placeholder="Search by subject, topic, or university..." className="w-full bg-transparent border-none py-3 pl-12 pr-4 focus:outline-none focus:ring-0 text-vynk-text" />
        </div>
        <div className="w-px bg-vynk-border hidden md:block"></div>
        <div className="flex gap-2 p-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-vynk-text shadow-sm border border-vynk-border hover:border-vynk-primary transition-colors">
            <Book size={16} /> Semester
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-vynk-text shadow-sm border border-vynk-border hover:border-vynk-primary transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-vynk-border px-2">
        {['Trending', 'Newest', 'Top Rated', 'My Saved'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-vynk-primary' : 'text-vynk-muted hover:text-vynk-text'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="notes-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-vynk-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_NOTES.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
        {MOCK_NOTES.map(note => (
          <NoteCard key={`dup-${note.id}`} note={{...note, id: note.id + 10}} />
        ))}
      </div>
    </div>
  );
};

export default Notes;
