import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, Filter, Download, Star, Book, FileText, Bookmark, Plus } from 'lucide-react';
import { noteApi } from '../api/noteApi';
import toast from 'react-hot-toast';

const NoteCard = ({ note }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [downloads, setDownloads] = useState(note.downloads || 0);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await noteApi.saveNote(note._id);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Note removed from saved' : 'Note saved successfully');
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const updatedDownloads = await noteApi.downloadNote(note._id);
      setDownloads(updatedDownloads);
      if (note.fileUrl) {
        window.open(note.fileUrl, '_blank');
      } else {
        toast.error('File URL not available');
      }
    } catch (err) {
      toast.error('Failed to download note');
    }
  };

  const handleNavigate = () => {
    navigate(`/notes/${note._id}`);
  };

  return (
    <motion.div 
      onClick={handleNavigate}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-2xl bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white mb-4 shadow-lg`}>
        <FileText size={24} />
      </div>
      
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-text group-hover:text-primary transition-colors line-clamp-2 pr-4">{note.title}</h3>
        <button onClick={handleSave} className={`${isSaved ? 'text-primary' : 'text-muted'} hover:text-secondary shrink-0`}>
          <Bookmark size={20} className={isSaved ? 'fill-current' : ''} />
        </button>
      </div>
      
      <p className="text-sm font-medium text-muted mb-2">{note.subject} • {note.semester}</p>
      
      <div className="flex items-center gap-2 mb-4 mt-auto">
        <img src={note.uploader?.avatar || 'https://via.placeholder.com/40'} alt="Uploader" className="w-5 h-5 rounded-full object-cover border border-border" />
        <span className="text-xs font-bold text-text">{note.uploader?.username}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {note.tags?.map(tag => (
          <span key={tag} className="px-2 py-1 bg-white border border-border rounded-md text-[10px] font-bold text-text uppercase tracking-wider">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs font-bold text-text/70">
          <span className="flex items-center gap-1 text-yellow-600"><Star size={14} className="fill-yellow-600" /> {note.ratings?.length || 5.0}</span>
          <span className="flex items-center gap-1"><Download size={14} /> {downloads}</span>
        </div>
        <button onClick={handleDownload} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
          <Download size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const Notes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const data = await noteApi.getNotes();
      setNotes(data);
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Simplistic tab filtering for demo
    // In reality, this should sort or filter based on actual backend metrics
    return matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-text mb-2">Study Materials</h1>
          <p className="text-muted font-medium max-w-xl">Access community-shared notes, assignments, and study guides. Upload yours to help others and earn points.</p>
        </div>
        <button onClick={() => navigate('/upload-notes')} className="btn-primary shrink-0">
          <Plus size={20} /> Upload Notes
        </button>
      </div>

      {/* Controls */}
      <div className="glass-card p-2 flex flex-col md:flex-row gap-2 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search by subject, topic, or university..." 
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 focus:outline-none focus:ring-0 text-text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-px bg-border hidden md:block"></div>
        <div className="flex gap-2 p-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-text shadow-sm border border-border hover:border-primary transition-colors">
            <Book size={16} /> Semester
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-text shadow-sm border border-border hover:border-primary transition-colors">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-border px-2">
        {['Trending', 'Newest', 'Top Rated', 'My Saved'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-muted hover:text-text'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="notes-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <p className="text-xl font-bold">No notes available yet</p>
          <p className="text-sm">Be the first to upload one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNotes.map(note => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;
