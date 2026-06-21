import { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Music, Volume2, VolumeX, Scissors, Eye, Plus, Sparkles, X } from 'lucide-react';
import { reelApi } from '../api/reelApi';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import CommentDrawer from '../components/ui/CommentDrawer';
import MediaUploader from '../components/ui/MediaUploader';

const ReelCard = ({ reel: initialReel, isActive }) => {
  const { user } = useContext(AuthContext);
  const [reel, setReel] = useState(initialReel);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const videoRef = useRef(null);

  useEffect(() => {
    setIsLiked(reel.likes?.includes(user?.id));
  }, [reel.likes, user?.id]);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(console.error);
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = async () => {
    try {
      const updatedLikes = await reelApi.likeReel(reel._id);
      setIsLiked(!isLiked);
      setLikesCount(updatedLikes.length);
    } catch (err) {
      toast.error('Failed to like reel');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const newComment = await reelApi.addComment(reel._id, text);
      setReel(prev => ({ ...prev, comments: newComment }));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async () => {
    try {
      const res = await reelApi.shareReel(reel._id);
      setReel(prev => ({ ...prev, shares: res.shares }));
      navigator.clipboard.writeText(`${window.location.origin}/reels/${reel._id}`);
      toast.success('Link copied & reel shared!');
    } catch (err) {
      toast.error('Failed to share reel');
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Determine css filter string based on selected tag
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
    <div className="w-full max-w-sm h-[75vh] md:h-150 bg-black rounded-3xl overflow-hidden relative shadow-2xl snap-center shrink-0 border border-border/20 group cursor-pointer" onClick={toggleMute}>
      {/* Video Element */}
      <video 
        ref={videoRef}
        src={reel.videoUrl} 
        loop 
        muted={isMuted}
        playsInline
        style={{ filter: getFilterStyle(reel.filter) }}
        className="w-full h-full object-cover opacity-90"
      />

      <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/45 flex items-center justify-center text-white backdrop-blur-md">
        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>

      {/* Right Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group/btn">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-black/60 transition-colors">
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart size={20} className={isLiked ? 'fill-primary text-primary' : ''} />
            </motion.div>
          </div>
          <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{likesCount}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group/btn" onClick={() => setShowCommentDrawer(true)}>
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-black/60 transition-colors">
            <MessageCircle size={20} />
          </div>
          <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{reel.comments?.length || 0}</span>
        </button>

        <button onClick={handleShare} className="flex flex-col items-center gap-1 group/btn">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover/btn:bg-black/60 transition-colors">
            <Share2 size={20} />
          </div>
          <span className="text-white text-xs font-bold shadow-black drop-shadow-md">{reel.shares || 0}</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10 pt-12 pointer-events-none">
        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
          <img src={reel.author?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          <span className="text-white font-bold text-sm">{reel.author?.username || 'User'}</span>
        </div>
        <p className="text-white/95 text-xs mb-2 leading-relaxed">{reel.caption}</p>
        <div className="flex items-center gap-2 text-white/80 text-[10px] bg-white/10 w-max px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-auto cursor-pointer">
          <Music size={10} className="animate-pulse" />
          <span>{reel.audioTitle || `Original Audio`}</span>
        </div>
      </div>

      <CommentDrawer 
        isOpen={showCommentDrawer} 
        onClose={() => setShowCommentDrawer(false)}
        comments={reel.comments || []}
        onAddComment={handleAddComment}
        currentUser={user}
        onLikeComment={() => {}}
        onDeleteComment={() => {}}
      />
    </div>
  );
};

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('original'); // original, warm, cinematic, mono, bright, cool
  const [trimRange, setTrimRange] = useState({ start: 0, end: 15 });
  const [isUploading, setIsUploading] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  const containerRef = useRef(null);

  const MUSIC_LIBRARY = [
    { id: 1, name: 'Lo-Fi Study', artist: 'Chillhop' },
    { id: 2, name: 'Hackathon Energy', artist: 'Synthwave' },
    { id: 3, name: 'Soft Vibes', artist: 'Acoustic' },
    { id: 4, name: 'Dream Pop', artist: 'Indie' },
    { id: 5, name: 'Chill Coding', artist: 'Ambient' },
    { id: 6, name: 'Startup Beat', artist: 'Electronic' },
  ];

  const FILTERS = ['original', 'warm', 'cinematic', 'mono', 'bright', 'cool'];

  const fetchReels = async () => {
    setIsLoading(true);
    try {
      const data = await reelApi.getReels();
      setReels(data);
    } catch (err) {
      toast.error('Failed to load reels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.children[0]?.clientHeight || window.innerHeight;
    const gap = 32;
    
    const newIndex = Math.round(scrollPosition / (itemHeight + gap));
    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < reels.length) {
      setActiveReelIndex(newIndex);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          videoUrl: reader.result,
          caption: caption,
          audioTitle: selectedMusic ? `${selectedMusic.name} - ${selectedMusic.artist}` : 'Original Audio',
          filter: selectedFilter,
          trimStart: trimRange.start,
          trimEnd: trimRange.end
        };
        
        const newReel = await reelApi.createReel(payload);
        setReels([newReel, ...reels]);
        toast.success('Reel shared to feed!');
        setShowUploader(false);
        setSelectedFile(null);
        setCaption('');
        setSelectedMusic(null);
        setSelectedFilter('original');
        setTrimRange({ start: 0, end: 15 });
        setActiveReelIndex(0);
        if (containerRef.current) containerRef.current.scrollTop = 0;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload reel');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div 
      className="w-full h-[calc(100vh-80px)] md:h-screen flex flex-col items-center overflow-y-auto snap-y snap-mandatory scrollbar-hide py-4 gap-8 relative"
      ref={containerRef}
      onScroll={handleScroll}
    >
      <button 
        onClick={() => setShowUploader(true)}
        className="absolute top-4 right-4 z-20 btn-primary py-2 px-4 shadow-lg shadow-primary/20 flex items-center gap-2"
        style={{ position: 'fixed' }}
      >
        <Plus size={16} /> Upload Reel
      </button>

      <AnimatePresence>
        {showUploader && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-surface rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text">Create Reel</h2>
                <button onClick={() => setShowUploader(false)} className="text-muted hover:text-text"><X size={20}/></button>
              </div>

              <div className="mb-4">
                 <MediaUploader onFileSelect={setSelectedFile} accept="video/*" label="Upload Video (Max 1min)" />
              </div>

              {selectedFile && (
                <div className="max-h-72 overflow-y-auto pr-1">
                  <textarea 
                    placeholder="Write a caption with #hashtags..."
                    className="glass-input w-full mb-4 text-sm"
                    rows="3"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />

                  {/* Filters Selection */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-muted mb-2 flex items-center gap-1"><Sparkles size={14} className="text-primary" /> Visual Filter</label>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {FILTERS.map(f => (
                        <button
                          key={f}
                          onClick={() => setSelectedFilter(f)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border shrink-0 transition-colors ${
                            selectedFilter === f ? 'bg-primary text-white border-primary' : 'bg-surface-soft text-text border-border'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trim Mock Range Selector */}
                  <div className="mb-4 bg-surface-soft/40 p-3 rounded-xl border border-border/30">
                    <label className="text-xs font-bold text-muted mb-2 flex items-center gap-1"><Scissors size={14} className="text-secondary" /> Trim Clip (Seconds)</label>
                    <div className="flex justify-between text-xs text-text mb-2">
                      <span>Start: {trimRange.start}s</span>
                      <span>End: {trimRange.end}s</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="30" 
                      value={trimRange.end} 
                      onChange={(e) => setTrimRange({ start: 0, end: parseInt(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-bold text-muted mb-2 flex items-center gap-1"><Music size={14} className="text-accent" /> Select Music Track</label>
                    <select
                      className="glass-input w-full text-xs"
                      value={selectedMusic?.id || ''}
                      onChange={(e) => {
                        const m = MUSIC_LIBRARY.find(x => x.id === parseInt(e.target.value));
                        setSelectedMusic(m || null);
                      }}
                    >
                      <option value="">Original Audio</option>
                      {MUSIC_LIBRARY.map(m => (
                        <option key={m.id} value={m.id}>{m.name} - {m.artist}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-4 pt-2 border-t border-border/30">
                <button onClick={() => setShowUploader(false)} className="flex-1 py-2 rounded-xl border border-border text-xs text-text font-bold hover:bg-surface-soft transition-colors">Cancel</button>
                <button onClick={handleUpload} disabled={!selectedFile || isUploading} className="flex-1 btn-primary py-2 text-xs flex justify-center items-center">
                  {isUploading ? 'Uploading...' : 'Publish Reel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reels.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
           <p className="font-bold text-lg">No Reels yet</p>
           <p className="text-sm">Be the first to share one!</p>
        </div>
      ) : (
        reels.map((reel, idx) => (
          <ReelCard key={reel._id} reel={reel} isActive={idx === activeReelIndex} />
        ))
      )}
    </div>
  );
};

export default Reels;
