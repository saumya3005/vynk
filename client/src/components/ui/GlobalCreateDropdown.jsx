import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, FileText, Briefcase, Users, PlayCircle, Image as ImageIcon } from 'lucide-react';

const GlobalCreateDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary w-full mt-4 mb-6 shadow-lg shadow-vynk-primary/20 flex items-center justify-center gap-2"
      >
        <PlusCircle size={20} /> Create
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-vynk-border overflow-hidden z-50 flex flex-col"
          >
            <button onClick={() => handleAction('/feed')} className="flex items-center gap-3 p-3 hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text text-left">
              <ImageIcon size={18} className="text-vynk-primary" /> Post or Story
            </button>
            <button onClick={() => handleAction('/reels')} className="flex items-center gap-3 p-3 hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text text-left">
              <PlayCircle size={18} className="text-pink-500" /> Reel
            </button>
            <button onClick={() => handleAction('/create-project')} className="flex items-center gap-3 p-3 hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text text-left">
              <Briefcase size={18} className="text-vynk-secondary" /> Project
            </button>
            <button onClick={() => handleAction('/upload-notes')} className="flex items-center gap-3 p-3 hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text text-left">
              <FileText size={18} className="text-blue-500" /> Note
            </button>
            <button onClick={() => handleAction('/communities')} className="flex items-center gap-3 p-3 hover:bg-vynk-bg-2 transition-colors text-sm font-semibold text-vynk-text text-left">
              <Users size={18} className="text-emerald-500" /> Community
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalCreateDropdown;
