import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_STORY_DATA = {
  user: 'alex_dev',
  time: '2h ago',
  image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=1000'
};

const Stories = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          navigate('/feed');
          return 100;
        }
        return p + 0.5;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => navigate('/feed')} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-md h-[90vh] bg-neutral-900 rounded-xl overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 flex items-center gap-3 z-20">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-vynk-primary to-vynk-accent border border-white/20"></div>
          <span className="text-white font-bold text-sm">{MOCK_STORY_DATA.user}</span>
          <span className="text-white/60 text-xs">{MOCK_STORY_DATA.time}</span>
        </div>

        {/* Media */}
        <img 
          src={MOCK_STORY_DATA.image} 
          alt="Story" 
          className="w-full h-full object-cover opacity-90"
        />

        {/* Navigation */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={() => setProgress(0)}></div>
        <div className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer" onClick={() => navigate('/feed')}></div>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3">
          <div className="flex-1 bg-black/40 border border-white/20 rounded-full px-4 py-2 flex items-center backdrop-blur-md">
            <input type="text" placeholder="Reply..." className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder:text-white/60" />
          </div>
          <button className="text-white hover:text-vynk-primary transition-colors"><Heart size={28} /></button>
          <button className="text-white hover:text-vynk-secondary transition-colors"><Send size={26} /></button>
        </div>

      </div>
    </div>
  );
};

export default Stories;
