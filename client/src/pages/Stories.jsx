import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Heart, Send } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storyApi } from '../api/storyApi';
import toast from 'react-hot-toast';

const Stories = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const data = await storyApi.getStories();
      setStories(data);
      if (data.length > 0 && data[0]._id) {
        storyApi.viewStory(data[0]._id).catch(() => {});
      }
    } catch (err) {
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    if (stories.length === 0 || isLoading) return;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNextStory();
          return 0;
        }
        return p + 0.5;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [currentIndex, stories.length, isLoading]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      storyApi.viewStory(stories[currentIndex + 1]._id).catch(() => {});
    } else {
      navigate('/feed');
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-100 bg-black flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-vynk-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 z-100 bg-black flex flex-col items-center justify-center text-white">
        <p className="mb-4 text-lg font-bold">No active stories found</p>
        <button onClick={() => navigate('/feed')} className="btn-primary">Return to Feed</button>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => navigate('/feed')} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-md h-[90vh] bg-neutral-900 rounded-xl overflow-hidden relative shadow-2xl shadow-vynk-primary/10">
        
        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {stories.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                style={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 flex items-center gap-3 z-20">
          <img src={currentStory.author?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentStory.author?.username}</span>
        </div>

        {/* Media */}
        {currentStory.mediaType === 'video' ? (
          <video src={currentStory.mediaUrl} autoPlay muted className="w-full h-full object-cover opacity-90" />
        ) : (
          <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover opacity-90" />
        )}

        {/* Navigation Overlays */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer" onClick={handlePrevStory}></div>
        <div className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer" onClick={handleNextStory}></div>

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
