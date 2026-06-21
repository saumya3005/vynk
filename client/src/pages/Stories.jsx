import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storyApi } from '../api/storyApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [progress, setProgress] = useState(0);
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const [replyText, setReplyText] = useState('');
  const [isLiking, setIsLiking] = useState(false);

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
    if (stories.length === 0 || isLoading || isPaused) return;

    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          handleNextStory();
          return 0;
        }
        return p + 0.3; // Slower progress
      });
    }, 30);
    return () => clearInterval(timer);
  }, [currentIndex, stories.length, isLoading, isPaused]);

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

  const handleLike = async () => {
    if (!currentStory || isLiking) return;
    setIsLiking(true);
    try {
      const updatedLikes = await storyApi.likeStory(currentStory._id);
      const updatedStories = [...stories];
      updatedStories[currentIndex].likes = updatedLikes;
      setStories(updatedStories);
    } catch (err) {
      toast.error('Failed to like story');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    try {
      await storyApi.replyStory(currentStory._id, replyText);
      toast.success('Reply sent!');
      setReplyText('');
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    const confirm = window.confirm('Delete this story?');
    if (!confirm) return;
    
    try {
      await storyApi.deleteStory(currentStory._id);
      toast.success('Story deleted');
      const newStories = stories.filter(s => s._id !== currentStory._id);
      setStories(newStories);
      if (newStories.length === 0) {
        navigate('/feed');
      } else if (currentIndex >= newStories.length) {
        setCurrentIndex(newStories.length - 1);
        setProgress(0);
      }
    } catch (err) {
      toast.error('Failed to delete story');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-100 bg-black flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
  const isMyStory = currentStory.author?._id === user?.id;
  const isLiked = currentStory.likes?.includes(user?.id);

  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={() => navigate('/feed')} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-md h-full md:h-[90vh] bg-neutral-900 md:rounded-xl overflow-hidden relative shadow-2xl flex flex-col" style={{ background: currentStory.mediaUrl ? '#000' : currentStory.background || '#000' }}>
        
        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-30">
          {stories.map((_, idx) => (
            <div key={idx} className="h-0.75 flex-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                style={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-30">
          <div className="flex items-center gap-3">
            <img src={currentStory.author?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
            <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{currentStory.author?.username}</span>
          </div>
          <div className="flex gap-2">
            {isMyStory && (
              <button onClick={handleDelete} className="p-1 text-white hover:text-red-500 drop-shadow-md"><Trash2 size={20} /></button>
            )}
          </div>
        </div>

        {/* Media */}
        <div 
          className="flex-1 relative w-full h-full flex items-center justify-center"
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
        >
          {currentStory.mediaUrl && (
            currentStory.mediaType === 'video' ? (
              <video src={currentStory.mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
            ) : (
              <img src={currentStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
            )
          )}
          
          {/* Text Overlays */}
          {currentStory.textOverlays?.map((overlay, idx) => (
            <div key={idx} className="absolute pointer-events-none" style={{ top: `${overlay.y}%`, left: `${overlay.x}%`, transform: 'translate(-50%, -50%)', color: overlay.color, fontSize: `${overlay.fontSize}px`, fontFamily: overlay.fontFamily, fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {overlay.text}
            </div>
          ))}

          {/* Navigation Tap Zones */}
          <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrevStory(); }}></div>
          <div className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleNextStory(); }}></div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full p-4 z-30 bg-linear-to-t from-black/80 to-transparent">
          {isMyStory ? (
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Eye size={20} /> <span className="font-bold text-sm">{currentStory.viewers?.length || 0} Viewers</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={20} /> <span className="font-bold text-sm">{currentStory.likes?.length || 0} Likes</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex items-center gap-3">
              <div className="flex-1 bg-black/40 border border-white/20 rounded-full px-4 py-2 flex items-center backdrop-blur-md">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  placeholder="Reply..." 
                  className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder:text-white/60" 
                />
              </div>
              <button type="button" onClick={handleLike} className={`transition-colors ${isLiked ? 'text-primary' : 'text-white hover:text-primary drop-shadow-md'}`}>
                <Heart size={28} className={isLiked ? 'fill-primary' : ''} />
              </button>
              <button type="submit" disabled={!replyText.trim()} className="text-white hover:text-secondary transition-colors disabled:opacity-50 drop-shadow-md">
                <Send size={26} />
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default Stories;
