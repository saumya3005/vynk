import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, Send, Trash2, Eye, ChevronLeft, ChevronRight,
  Plus, Camera, Image as ImageIcon, Type, Palette, Music
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storyApi } from '../api/storyApi';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STORY_DURATION = 5000; // 5 seconds per story

const Stories = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [stories, setStories] = useState([]);
  const [groupedStories, setGroupedStories] = useState([]); // array of { author, stories[] }
  const [groupIndex, setGroupIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createText, setCreateText] = useState('');
  const [createBg, setCreateBg] = useState('from-primary to-secondary');
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  const BG_OPTIONS = [
    'from-primary to-secondary',
    'from-secondary to-accent',
    'from-accent to-success',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-black to-zinc-800',
  ];

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const data = await storyApi.getStories();
        // Group by author
        const groups = [];
        const seen = new Map();
        data.forEach(story => {
          const authorId = story.author?._id || story.author;
          if (!seen.has(authorId)) {
            seen.set(authorId, groups.length);
            groups.push({ author: story.author, stories: [story] });
          } else {
            groups[seen.get(authorId)].stories.push(story);
          }
        });
        setGroupedStories(groups);
        setStories(data);
        if (data.length > 0) {
          storyApi.viewStory(data[0]._id).catch(() => {});
        }
      } catch {
        toast.error('Failed to load stories');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  const currentGroup = groupedStories[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const totalStoriesInGroup = currentGroup?.stories.length || 0;

  const goNext = useCallback(() => {
    setProgress(0);
    if (storyIndex < totalStoriesInGroup - 1) {
      setStoryIndex(s => s + 1);
    } else if (groupIndex < groupedStories.length - 1) {
      setGroupIndex(g => g + 1);
      setStoryIndex(0);
    } else {
      navigate('/feed');
    }
  }, [storyIndex, groupIndex, totalStoriesInGroup, groupedStories.length, navigate]);

  const goPrev = useCallback(() => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex(s => s - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(g => g - 1);
      setStoryIndex(0);
    }
  }, [storyIndex, groupIndex]);

  useEffect(() => {
    if (!currentStory || isLoading || isPaused) return;
    const interval = 30;
    const step = (interval / STORY_DURATION) * 100;
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p + step >= 100) {
          clearInterval(timerRef.current);
          goNext();
          return 0;
        }
        return p + step;
      });
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [currentStory, isPaused, goNext, isLoading]);

  // View story when changed
  useEffect(() => {
    if (currentStory) {
      storyApi.viewStory(currentStory._id).catch(() => {});
      setIsLiked(currentStory.likes?.includes(user?.id));
    }
  }, [currentStory]);

  const handleLike = async () => {
    if (!currentStory) return;
    setIsLiked(l => !l);
    try {
      await storyApi.likeStory(currentStory._id);
    } catch {
      setIsLiked(l => !l);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !currentStory) return;
    try {
      await storyApi.replyStory(currentStory._id, replyText);
      setReplyText('');
      toast.success('Reply sent!');
    } catch {
      toast.error('Failed to send reply');
    }
  };

  const handleDelete = async () => {
    if (!currentStory || currentStory.author?._id !== user?.id) return;
    try {
      await storyApi.deleteStory(currentStory._id);
      toast.success('Story deleted');
      goNext();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCreateText = async () => {
    if (!createText.trim()) return;
    setCreating(true);
    try {
      const newStory = await storyApi.createStory({
        textContent: createText,
        background: createBg,
        type: 'text'
      });
      toast.success('Story posted!');
      setShowCreate(false);
      setCreateText('');
      navigate('/feed');
    } catch {
      toast.error('Failed to create story');
    } finally {
      setCreating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCreating(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await storyApi.createStory({ mediaUrl: reader.result, type: 'image' });
        toast.success('Story posted!');
        setShowCreate(false);
        navigate('/feed');
      } catch {
        toast.error('Failed to create story');
      } finally {
        setCreating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Create Story screen
  if (showCreate) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        {/* Preview */}
        <div className={`flex-1 bg-linear-to-br ${createBg} flex items-center justify-center relative`}>
          {createText ? (
            <p className="text-white text-2xl font-black text-center px-8 leading-tight max-w-sm">{createText}</p>
          ) : (
            <p className="text-white/40 text-lg font-semibold">Type something...</p>
          )}
          <button onClick={() => setShowCreate(false)} className="absolute top-4 left-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white">
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 px-4 py-5 space-y-4">
          <textarea
            autoFocus
            placeholder="Your story text..."
            value={createText}
            onChange={e => setCreateText(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-primary resize-none text-sm"
            rows={2}
          />

          <div>
            <p className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-wider">Background</p>
            <div className="flex gap-2 overflow-x-auto">
              {BG_OPTIONS.map(bg => (
                <button
                  key={bg}
                  onClick={() => setCreateBg(bg)}
                  className={`w-9 h-9 shrink-0 rounded-full bg-linear-to-br ${bg} border-2 ${createBg === bg ? 'border-white scale-110' : 'border-transparent'} transition-all`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 rounded-xl border border-zinc-700 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <ImageIcon size={16} /> Photo Instead
            </button>
            <button
              onClick={handleCreateText}
              disabled={!createText.trim() || creating}
              className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-black disabled:opacity-50"
            >
              {creating ? 'Posting...' : '✨ Post Story'}
            </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>
    );
  }

  // Empty state
  if (groupedStories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white z-50">
        <Camera size={56} className="opacity-30 mb-4" />
        <h3 className="text-xl font-black mb-2">No Stories</h3>
        <p className="text-sm opacity-50 mb-6 text-center">Stories from the people you follow appear here</p>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Create Story
        </button>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-white/50 hover:text-white underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">

      {/* Story Viewer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${groupIndex}-${storyIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.18 }}
          className="relative w-full h-full max-w-sm mx-auto"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Background / Media */}
          <div className="w-full h-full">
            {currentStory?.mediaUrl ? (
              <img
                src={currentStory.mediaUrl}
                alt="story"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full bg-linear-to-br ${currentStory?.background || 'from-primary to-secondary'} flex items-center justify-center`}>
                <p className="text-white text-2xl font-black text-center px-8 max-w-xs leading-tight">
                  {currentStory?.textContent}
                </p>
              </div>
            )}
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

          {/* Progress bars */}
          <div className="absolute top-4 left-3 right-3 flex gap-1 z-30">
            {currentGroup.stories.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%'
                  }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            ))}
          </div>

          {/* Top header */}
          <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shadow-md">
                {currentGroup.author?.avatar
                  ? <img src={currentGroup.author.avatar} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-black">{currentGroup.author?.username?.[0]?.toUpperCase()}</div>
                }
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">{currentGroup.author?.username}</p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  {currentStory?.createdAt ? new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentGroup.author?._id === user?.id && (
                <button onClick={handleDelete} className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white">
                  <Trash2 size={15} />
                </button>
              )}
              <button onClick={() => navigate(-1)} className="w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tap areas */}
          <div className="absolute inset-0 flex z-20 pointer-events-auto">
            <div className="w-1/3 h-full cursor-pointer" onClick={goPrev} />
            <div className="w-2/3 h-full cursor-pointer" onClick={goNext} />
          </div>

          {/* View count & like (own stories) */}
          {currentGroup.author?._id === user?.id && currentStory?.views > 0 && (
            <div className="absolute bottom-28 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full z-30">
              <Eye size={13} className="text-white" />
              <span className="text-white text-xs font-semibold">{currentStory.views} views</span>
            </div>
          )}

          {/* Bottom: Reply + Like */}
          <div className="absolute bottom-6 left-3 right-3 flex items-center gap-2 z-30">
            <input
              type="text"
              placeholder={`Reply to ${currentGroup.author?.username}...`}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleReply(); }}
              onClick={e => e.stopPropagation()}
              className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2.5 text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <button
              onClick={e => { e.stopPropagation(); handleReply(); }}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shrink-0 hover:bg-white/20 transition-colors"
            >
              <Send size={16} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleLike(); }}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white shrink-0 hover:bg-white/20 transition-colors"
            >
              <motion.div whileTap={{ scale: 0.7 }}>
                <Heart size={18} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
              </motion.div>
            </button>
          </div>

          {/* Create story button */}
          <button
            onClick={() => setShowCreate(true)}
            className="absolute bottom-6 right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg z-30"
          >
            <Plus size={20} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Group navigation dots */}
      {groupedStories.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
          {groupedStories.map((_, i) => (
            <button
              key={i}
              onClick={() => { setGroupIndex(i); setStoryIndex(0); setProgress(0); }}
              className={`rounded-full transition-all ${i === groupIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories;
