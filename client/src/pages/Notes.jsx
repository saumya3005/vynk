import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Bookmark, UploadCloud } from 'lucide-react';

const MOCK_NOTES = [
  { id: 1, title: 'Data Structures Complete Guide', subject: 'Computer Science', semester: 'Sem 3', rating: 4.8 },
  { id: 2, title: 'Advanced React Patterns', subject: 'Web Development', semester: 'Sem 6', rating: 4.9 },
];

const Notes = () => {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vynk-charcoal">Notes Hub</h1>
          <p className="text-vynk-charcoal/60 mt-1">Access and share study materials, PDFs, and guides.</p>
        </div>
        <Link to="/notes/upload" className="btn-primary flex items-center gap-2">
          <UploadCloud size={20} /> Upload Notes
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-12">
        {MOCK_NOTES.map((note, idx) => (
          <motion.div 
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-5 flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-vynk-peach/20 text-vynk-coral flex items-center justify-center mb-4 font-bold">
              PDF
            </div>
            <h3 className="font-bold text-lg leading-tight mb-2">{note.title}</h3>
            <p className="text-sm text-vynk-charcoal/60 mb-1">{note.subject}</p>
            <p className="text-xs font-medium text-vynk-lavender mb-6">{note.semester}</p>
            
            <div className="mt-auto pt-4 border-t border-white/20 flex justify-between items-center">
              <button className="flex items-center gap-2 text-sm font-semibold text-vynk-charcoal hover:text-vynk-mint transition-colors">
                <Download size={16} /> Download
              </button>
              <button className="text-vynk-charcoal/50 hover:text-vynk-coral transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
