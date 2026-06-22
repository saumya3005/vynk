import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Plus, FileText, Briefcase, Users, PlayCircle, Image as ImageIcon } from 'lucide-react';

const GlobalCreateDropdown = ({ isMobile = false, iconOnly = false }) => {
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

  const getTriggerButton = () => {
    if (isMobile) {
      return (
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30 cursor-pointer"
        >
          <Plus size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
        </div>
      );
    }
    
    if (iconOnly) {
      return (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-surface-soft rounded-full transition-colors text-text"
        >
          <Plus size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-45 text-primary' : ''}`} />
        </button>
      );
    }

    return (
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary w-full mt-4 mb-6 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        <PlusCircle size={20} /> Create
      </button>
    );
  };

  return (
    <div className={`relative ${isMobile || iconOnly ? '' : 'w-full'}`} ref={dropdownRef}>
      {getTriggerButton()}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: isMobile ? 10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isMobile ? 10 : 10 }}
            className={`absolute ${isMobile ? 'bottom-full mb-4 -translate-x-1/2 left-1/2' : 'top-full mt-2 right-0'} w-48 bg-card backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-border overflow-hidden z-50 flex flex-col`}
          >
            <button onClick={() => handleAction('/feed')} className="flex items-center gap-3 p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
              <ImageIcon size={18} className="text-primary" /> Post or Story
            </button>
            <button onClick={() => handleAction('/reels')} className="flex items-center gap-3 p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
              <PlayCircle size={18} className="text-pink-500" /> Reel
            </button>
            <button onClick={() => handleAction('/create-project')} className="flex items-center gap-3 p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
              <Briefcase size={18} className="text-secondary" /> Project
            </button>
            <button onClick={() => handleAction('/upload-notes')} className="flex items-center gap-3 p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
              <FileText size={18} className="text-blue-500" /> Note
            </button>
            <button onClick={() => handleAction('/communities')} className="flex items-center gap-3 p-3 hover:bg-surface transition-colors text-sm font-semibold text-text text-left">
              <Users size={18} className="text-emerald-500" /> Community
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalCreateDropdown;
