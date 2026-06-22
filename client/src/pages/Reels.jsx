import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, Music, Volume2, VolumeX,
  Scissors, Plus, Sparkles, X, MoreVertical, UserPlus, UserCheck,
  Play, Pause, ChevronUp, ChevronDown, Video
} from 'lucide-react';
import { reelApi } from '../api/reelApi';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import CommentDrawer from '../components/ui/CommentDrawer';
import MediaUploader from '../components/ui/MediaUploader';

// --- Action Rail Button ---
const ActionBtn = ({ icon: Icon, count, onClick, active = false, activeColor = 'text-primary', fillActive = false }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 group"
  >
    <motion.div
      whileTap={{ scale: 0.75 }}
      className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-black/50 transition-all shadow-lg"
    >
      <Icon
        size={22}
        className={active ? `${activeColor} ${fillActive ? 'fill-current' : ''}` : 'text-white'}
      />
    </motion.div>
    {count !== undefined && (
      <span className="text-white text-[11px] font-bold drop-shadow-md">{count}</span>
    )}
  </button>
);

// --- Single Reel Card ---
const ReelCard = ({ reel: initialReel, isActive, onPrev, onNext, totalReels, currentIndex }) => {
  const { user } = useContext(AuthContext);
  const [reel, setReel] = useState(initialReel);
  const [isLiked, setIsLiked] = useState(() => reel.likes?.includes(user?.id) || reel.likes?.some(l => l === user?._id));
  const [isSaved, setIsSaved] = useState(() => reel.saves?.includes(user?.id));
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      reelApi.viewReel(reel._id).catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) setProgress((currentTime / duration) * 100);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(c => wasLiked ? c - 1 : c + 1);
    try {
      const updatedLikes = await reelApi.likeReel(reel._id);
      setLikesCount(updatedLikes.length);
    } catch {
      setIsLiked(wasLiked);
      setLikesCount(c => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setIsSaved(s => !s);
    try {
      await reelApi.saveReel(reel._id);
      toast.success(isSaved ? 'Removed from saved' : 'Saved!');
    } catch {
      setIsSaved(s => !s);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    setShowShare(true);
  };

  const handleCopyLink = async () => {
    try {
      await reelApi.shareReel(reel._id);
      await navigator.clipboard.writeText(`${window.location.origin}/reels/${reel._id}`);
      toast.success('Link copied! Share count updated.');
      setShowShare(false);
    } catch {
      toast.error('Failed to share');
    }
  };

  const getFilterStyle = (f) => {
    switch (f) {
      case 'warm': return 'sepia(0.2) saturate(1.4) contrast(1.1)';
      case 'cinematic': return 'contrast(1.3) brightness(0.9)';
      case 'mono': return 'grayscale(1) contrast(1.2)';
      case 'bright': return 'brightness(1.2) saturate(1.1)';
      case 'cool': return 'hue-rotate(15deg) saturate(1.2)';
      default: return 'none';
    }
  };

  return (
    <>
      <div className="reel-video" onClick={handleVideoClick}>
        {/* Video */}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          style={{ filter: getFilterStyle(reel.filter) }}
        />

        {/* Dark gradient overlays */}
        <div className="reel-overlay" />

        {/* Progress bar at bottom */}
        <div className="reel-progress">
          <motion.div
            className="h-full bg-white"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Top controls (Mute / Unmute) */}
        <div className="absolute top-16 right-4 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }}
            className="w-9 h-9 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

      {/* Play/Pause indicator */}
      <AnimatePresence>
        {!isPlaying && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-20 h-20 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
              <Play size={36} className="text-white ml-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right action rail */}
      <div
        className="reel-action-rail"
        onClick={e => e.stopPropagation()}
      >
        {/* Creator avatar */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.location.href = `/profile/${reel.author?._id}`}>
            {reel.author?.avatar
              ? <img src={reel.author.avatar} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-black">{reel.author?.username?.[0]?.toUpperCase()}</div>
            }
          </div>
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center -mt-4 shadow-md">
            <Plus size={12} className="text-white" />
          </div>
        </div>

        <ActionBtn
          icon={Heart}
          count={likesCount}
          onClick={handleLike}
          active={isLiked}
          activeColor="text-red-500"
          fillActive={true}
        />
        <ActionBtn
          icon={MessageCircle}
          count={reel.comments?.length || 0}
          onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
        />
        <ActionBtn
          icon={Share2}
          count={reel.shares || 0}
          onClick={handleShare}
        />
        <ActionBtn
          icon={Bookmark}
          onClick={handleSave}
          active={isSaved}
          activeColor="text-yellow-400"
          fillActive={true}
        />
      </div>

      {/* Bottom info */}
      <div
        className="reel-bottom-info"
        onClick={e => e.stopPropagation()}
      >
        <p className="font-black text-white text-sm mb-0.5 pointer-events-auto cursor-pointer hover:underline" onClick={() => window.location.href = `/profile/${reel.author?._id}`}>
          @{reel.author?.username}
        </p>
        {reel.caption && (
          <p className="text-white/90 text-xs leading-relaxed mb-2 line-clamp-2">
            {reel.caption}
          </p>
        )}
        <div className="flex items-center gap-2 text-white/80 text-[11px] bg-white/10 backdrop-blur-sm w-max px-3 py-1.5 rounded-full pointer-events-auto">
          <Music size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
          <span className="truncate max-w-40">{reel.audioTitle || 'Original Audio'}</span>
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 top-0 flex flex-col justify-between pointer-events-none z-10 py-20">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Comment Drawer */}
      <CommentDrawer
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        comments={reel.comments || []}
        onAddComment={async (text) => {
          try {
            const newComments = await reelApi.addComment(reel._id, text);
            setReel(prev => ({ ...prev, comments: newComments }));
          } catch { toast.error('Failed to add comment'); }
        }}
        currentUser={user}
        onLikeComment={() => {}}
        onDeleteComment={() => {}}
      />
      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { e.stopPropagation(); setShowShare(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface border border-border w-full max-w-sm rounded-2xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Share2 size={20} className="text-primary" /> Share Reel
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full btn-secondary py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> Copy Link
                </button>
                <button
                  onClick={() => { toast.success('Sending to chat...'); setShowShare(false); }}
                  className="w-full btn-primary py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Send in Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

// --- Upload Modal ---
const MUSIC_LIBRARY = [
  { id: 1, name: 'Lo-Fi Study', artist: 'Chillhop' },
  { id: 2, name: 'Hackathon Energy', artist: 'Synthwave' },
  { id: 3, name: 'Dream Pop', artist: 'Indie' },
  { id: 4, name: 'Startup Pulse', artist: 'Electronic' },
  { id: 5, name: 'Coding Flow', artist: 'Ambient' },
  { id: 6, name: 'Creator Beat', artist: 'Hip-Hop' },
];
const FILTERS = ['original', 'warm', 'cinematic', 'mono', 'bright', 'cool'];

const UploadModal = ({ onClose, onPublish }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [trimEnd, setTrimEnd] = useState(30);
  const [isUploading, setIsUploading] = useState(false);

  const handlePublish = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const newReel = await reelApi.createReel({
          videoUrl: reader.result,
          caption,
          audioTitle: selectedMusic ? `${selectedMusic.name} — ${selectedMusic.artist}` : 'Original Audio',
          filter: selectedFilter,
          trimStart: 0,
          trimEnd
        });
        onPublish(newReel);
        toast.success('Reel published! 🎉');
        onClose();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-surface border border-border w-full md:max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-black text-text">Create Reel</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-soft rounded-full text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-5">
          <MediaUploader onFileSelect={setSelectedFile} accept="video/*" label="Upload Video (MP4, MOV, WebM)" />

          {selectedFile && (
            <>
              <div>
                <label className="block text-xs font-bold text-muted mb-2 uppercase tracking-wider">Caption & Hashtags</label>
                <textarea
                  placeholder="Write a caption with #hashtags..."
                  className="w-full bg-surface-soft border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-muted focus:outline-none focus:border-primary transition-colors resize-none"
                  rows={3}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5"><Sparkles size={12} className="text-primary" /> Visual Filter</label>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-x">
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border shrink-0 transition-all ${
                        selectedFilter === f ? 'bg-primary text-white border-primary shadow-md shadow-primary/25' : 'bg-surface-soft text-muted border-border hover:border-border-premium'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5"><Scissors size={12} className="text-secondary" /> Clip Length: {trimEnd}s</label>
                <input
                  type="range" min="5" max="60" value={trimEnd}
                  onChange={e => setTrimEnd(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5"><Music size={12} className="text-accent" /> Background Music</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMusic(null)}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${!selectedMusic ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-soft border-border text-muted'}`}
                  >
                    🎤 Original Audio
                  </button>
                  {MUSIC_LIBRARY.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMusic(m)}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition-all ${selectedMusic?.id === m.id ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-soft border-border text-muted hover:border-border-premium'}`}
                    >
                      <p className="truncate">{m.name}</p>
                      <p className="text-muted font-normal text-[10px]">{m.artist}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-border text-sm text-text font-bold hover:bg-surface-soft transition-colors">
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!selectedFile || isUploading}
            className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Publishing...' : '🚀 Publish Reel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Reels Page ---
const Reels = () => {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const [activeTab, setActiveTab] = useState('Reels');

  useEffect(() => {
    const fetchReels = async () => {
      setIsLoading(true);
      try {
        const data = await reelApi.getReels();
        setReels(data);
      } catch {
        toast.error('Failed to load reels');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  const goTo = useCallback((index) => {
    if (index < 0 || index >= reels.length || isScrolling.current) return;
    isScrolling.current = true;
    setActiveIndex(index);
    const container = containerRef.current;
    if (container) {
      const target = container.children[index];
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => { isScrolling.current = false; }, 600);
  }, [reels.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          const index = Array.from(container.children).indexOf(entry.target);
          if (index !== -1) setActiveIndex(index);
        }
      });
    }, { threshold: 0.7 });

    Array.from(container.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [reels]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showUploader) return;
      if (e.key === 'ArrowUp') goTo(activeIndex - 1);
      if (e.key === 'ArrowDown') goTo(activeIndex + 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, showUploader, reels.length]);

  return (
    <div className="reels-page">
      <div className="reels-stage">
        {/* Top Tabs */}
        <div className="reel-tabs">
          {['Following', 'Reels', 'Trending'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-bold transition-all ${activeTab === tab ? 'text-white drop-shadow-md' : 'text-white/50 hover:text-white/80'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUploader(true)}
          className="absolute top-4 right-4 z-30 pointer-events-auto flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/50 text-white px-3 py-1.5 rounded-full font-bold text-sm hover:bg-primary/40 transition-colors"
        >
          <Plus size={16} />
        </button>

        {/* Feed Container */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-white">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold opacity-60">Loading reels...</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white text-center px-8">
            <Video size={56} className="opacity-30 mb-4" />
            <h3 className="text-xl font-black mb-2">No reels yet</h3>
            <p className="text-sm opacity-60 mb-6">Be the first to share a short video!</p>
            <button onClick={() => setShowUploader(true)} className="btn-primary">Upload Reel</button>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="reel-shell"
          >
            {reels.map((reel, idx) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                isActive={idx === activeIndex}
                currentIndex={idx}
                totalReels={reels.length}
                onPrev={() => goTo(idx - 1)}
                onNext={() => goTo(idx + 1)}
              />
            ))}
          </div>
        )}

      {/* Keyboard navigation indicator */}
      {reels.length > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {reels.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${i === activeIndex ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploader && (
          <UploadModal
            onClose={() => setShowUploader(false)}
            onPublish={(newReel) => {
              setReels(prev => [newReel, ...prev]);
              setActiveIndex(0);
            }}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default Reels;
