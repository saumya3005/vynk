import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image as ImageIcon, Video, AlignLeft, CheckSquare, Send, PlusCircle, Trash2, Camera, X, Code, BarChart2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { storyApi } from '../api/storyApi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CommentDrawer from '../components/ui/CommentDrawer';
import MediaUploader from '../components/ui/MediaUploader';
import StoryCreatorModal from '../components/ui/StoryCreatorModal';

const StoryRing = ({ story, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group shrink-0">
    <div className={`w-16 h-16 rounded-full p-0.75 bg-linear-to-tr ${story.viewers?.includes('current_user_id') ? 'from-border to-border' : 'from-primary via-secondary to-accent'} relative group-hover:scale-105 transition-transform duration-200`}>
      <div className="w-full h-full rounded-full border-2 border-surface overflow-hidden bg-surface-soft">
        <img src={story.author?.avatar || 'https://via.placeholder.com/150'} alt={story.author?.username} className="w-full h-full object-cover" />
      </div>
    </div>
    <span className="text-xs text-text font-medium w-16 truncate text-center">{story.author?.username}</span>
  </div>
);

const PostCard = ({ post: initialPost, onDelete }) => {
  const [post, setPost] = useState(initialPost);
  const { user } = useContext(AuthContext);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentCarouselIdx, setCurrentCarouselIdx] = useState(0);

  const isLiked = post.likes?.includes(user?.id);
  const isSaved = post.saves?.includes(user?.id);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const updatedLikes = await postApi.likePost(post._id);
      setPost(prev => ({ ...prev, likes: updatedLikes }));
    } catch (err) {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    try {
      const updatedSaves = await postApi.savePost(post._id);
      setPost(prev => ({ ...prev, saves: updatedSaves }));
      toast.success(updatedSaves.includes(user?.id) ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to save post');
    }
  };

  const handleAddComment = async (text) => {
    try {
      const newComment = await postApi.addComment(post._id, text);
      setPost(prev => ({ ...prev, comments: newComment }));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = await postApi.deleteComment(post._id, commentId);
      setPost(prev => ({ ...prev, comments: updatedComments }));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleShare = async () => {
    try {
      const res = await postApi.sharePost(post._id);
      setPost(prev => ({ ...prev, shares: res.shares }));
      navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
      toast.success('Link copied & post shared!');
    } catch (err) {
      toast.error('Failed to share post');
    }
  };

  const handleVote = async (optionIndex) => {
    try {
      const updatedPost = await postApi.votePoll(post._id, optionIndex);
      setPost(updatedPost);
      toast.success('Vote recorded!');
    } catch (err) {
      toast.error('Failed to register vote');
    }
  };

  const handleCopyCode = () => {
    if (post.codeBlock?.code) {
      navigator.clipboard.writeText(post.codeBlock.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Code copied to clipboard!');
    }
  };

  // Poll percentage calculations
  const totalVotes = post.pollOptions?.reduce((acc, curr) => acc + (curr.votes?.length || 0), 0) || 0;
  const userHasVoted = post.pollOptions?.some(opt => opt.votes?.includes(user?.id)) || false;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card mb-6 overflow-hidden relative border border-border/40"
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={post.author?.avatar || 'https://via.placeholder.com/150'} alt="avatar" className="w-10 h-10 rounded-full border border-border object-cover shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-text hover:underline cursor-pointer">{post.author?.username}</h3>
              <p className="text-[11px] text-muted">{post.author?.role || 'User'} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.author?._id === user?.id && (
              <button onClick={() => onDelete(post._id)} className="text-red-500/50 hover:text-red-500 p-1 transition-colors"><Trash2 size={16}/></button>
            )}
            <button className="text-muted hover:text-text p-1"><MoreHorizontal size={20}/></button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Dynamic Post Types */}
        {post.postType === 'poll' && post.pollOptions?.length > 0 && (
          <div className="px-4 pb-4 flex flex-col gap-3">
            {post.pollOptions.map((opt, idx) => {
              const votesCount = opt.votes?.length || 0;
              const percent = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
              const hasVotedThis = opt.votes?.includes(user?.id);
              
              return (
                <button
                  key={opt._id || idx}
                  disabled={userHasVoted}
                  onClick={() => handleVote(idx)}
                  className={`w-full relative overflow-hidden rounded-xl p-3 text-left border transition-all flex justify-between items-center ${
                    hasVotedThis 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border/60 bg-surface-soft/40 hover:border-secondary/40'
                  }`}
                >
                  {/* Visual Vote Progress Bar */}
                  {userHasVoted && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className="absolute inset-y-0 left-0 bg-secondary/10 z-0"
                    />
                  )}
                  
                  <span className="text-sm font-semibold relative z-10 text-text">{opt.optionText}</span>
                  {userHasVoted && (
                    <span className="text-xs font-bold text-muted relative z-10">{percent}% ({votesCount})</span>
                  )}
                </button>
              );
            })}
            <p className="text-[10px] text-muted font-semibold mt-1">{totalVotes} votes</p>
          </div>
        )}

        {post.postType === 'code' && post.codeBlock?.code && (
          <div className="px-4 pb-4">
            <div className="rounded-xl overflow-hidden border border-border bg-ink/80 text-xs font-mono relative">
              <div className="flex justify-between items-center px-4 py-2 bg-surface-soft border-b border-border text-muted-foreground select-none">
                <span>{post.codeBlock.language || 'javascript'}</span>
                <button onClick={handleCopyCode} className="text-muted hover:text-text p-1 transition-colors">
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-text bg-surface/40">
                <code>{post.codeBlock.code}</code>
              </pre>
            </div>
          </div>
        )}

        {post.postType === 'carousel' && post.carouselMedia?.length > 0 && (
          <div className="w-full h-80 relative overflow-hidden bg-black/10 flex items-center justify-center border-y border-border/20">
            <img 
              src={post.carouselMedia[currentCarouselIdx]?.url} 
              alt="carousel" 
              className="w-full h-full object-cover" 
            />
            {post.carouselMedia.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentCarouselIdx(prev => (prev > 0 ? prev - 1 : post.carouselMedia.length - 1))}
                  className="absolute left-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={() => setCurrentCarouselIdx(prev => (prev < post.carouselMedia.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {post.carouselMedia.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 rounded-full transition-all ${i === currentCarouselIdx ? 'bg-primary w-4' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Regular Single Media */}
        {post.postType !== 'carousel' && post.mediaUrl && (
          <div className="w-full max-h-125 overflow-hidden bg-black/5 flex items-center justify-center border-y border-border/20">
            {post.mediaType === 'video' ? (
               <video src={post.mediaUrl} controls className="w-full max-h-125 object-contain" />
            ) : (
               <img src={post.mediaUrl} alt="Post media" className="w-full max-h-125 object-contain" />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-between border-t border-border/30 bg-surface-soft/10">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-primary' : 'text-muted hover:text-primary'}`}>
              <motion.div whileTap={{ scale: 0.8 }}>
                <Heart size={22} className={isLiked ? 'fill-primary' : ''} />
              </motion.div>
              <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
            </button>
            
            <button onClick={() => setShowCommentDrawer(true)} className="flex items-center gap-2 text-muted hover:text-text transition-colors">
              <MessageCircle size={22} />
              <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
            </button>
            
            <button onClick={handleShare} className="flex items-center gap-2 text-muted hover:text-text transition-colors">
              <Share2 size={20} />
              <span className="text-sm font-semibold">{post.shares || 0}</span>
            </button>
          </div>
          
          <button onClick={handleSave} className={`transition-colors ${isSaved ? 'text-secondary' : 'text-muted hover:text-secondary'}`}>
             <motion.div whileTap={{ scale: 0.8 }}>
               <Bookmark size={22} className={isSaved ? 'fill-secondary' : ''} />
             </motion.div>
          </button>
        </div>
      </motion.div>

      <CommentDrawer 
        isOpen={showCommentDrawer} 
        onClose={() => setShowCommentDrawer(false)}
        comments={post.comments}
        onAddComment={handleAddComment}
        currentUser={user}
        onLikeComment={() => {}}
        onDeleteComment={handleDeleteComment}
      />
    </>
  );
};

const FeedComposer = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text'); // text, poll, code, carousel
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Poll state
  const [pollOptions, setPollOptions] = useState(['', '']);
  
  // Code block state
  const [codeText, setCodeText] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, '']);
  };

  const handleRemovePollOption = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handlePollOptionChange = (idx, val) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile && postType === 'text') return;
    setIsSubmitting(true);

    const submitPost = async (mediaBase64, mediaTypeStr) => {
      try {
        const payload = {
          content,
          postType,
          mediaUrl: mediaBase64 || '',
          mediaType: mediaTypeStr || 'text',
          category: 'General',
          tags: []
        };

        if (postType === 'poll') {
          payload.pollOptions = pollOptions
            .filter(opt => opt.trim() !== '')
            .map(opt => ({ optionText: opt, votes: [] }));
        }

        if (postType === 'code') {
          payload.codeBlock = { code: codeText, language: codeLanguage };
        }

        const newPost = await postApi.createPost(payload);
        setContent('');
        setSelectedFile(null);
        setPollOptions(['', '']);
        setCodeText('');
        setPostType('text');
        onPostCreated(newPost);
        toast.success('Shared to the universe!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to create post');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        submitPost(reader.result, selectedFile.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(selectedFile);
    } else {
      submitPost('', 'text');
    }
  };

  return (
    <div className="glass-card p-5 mb-6 border border-border/40">
      {/* Tab Selectors */}
      <div className="flex gap-4 border-b border-border/30 pb-3 mb-4 text-xs font-bold text-muted">
        <button onClick={() => setPostType('text')} className={`flex items-center gap-1.5 pb-1 ${postType === 'text' ? 'text-primary border-b border-primary' : 'hover:text-text'}`}>
          <AlignLeft size={16}/> Text/Media
        </button>
        <button onClick={() => setPostType('poll')} className={`flex items-center gap-1.5 pb-1 ${postType === 'poll' ? 'text-secondary border-b border-secondary' : 'hover:text-text'}`}>
          <BarChart2 size={16}/> Create Poll
        </button>
        <button onClick={() => setPostType('code')} className={`flex items-center gap-1.5 pb-1 ${postType === 'code' ? 'text-accent border-b border-accent' : 'hover:text-text'}`}>
          <Code size={16}/> Snippet
        </button>
      </div>

      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-secondary to-accent overflow-hidden shrink-0">
          <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={postType === 'poll' ? 'Ask a question...' : 'What is on your mind? Share updates...'}
            className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-text placeholder:text-muted min-h-12 text-sm"
          />

          {/* Interactive Composer Options */}
          {postType === 'poll' && (
            <div className="flex flex-col gap-2 bg-surface-soft/40 p-3 rounded-xl border border-border/30">
              {pollOptions.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handlePollOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-surface border border-border/40 rounded-lg px-3 py-1.5 text-xs text-text focus:border-secondary focus:outline-none"
                  />
                  {pollOptions.length > 2 && (
                    <button onClick={() => handleRemovePollOption(i)} className="text-red-500 hover:bg-red-500/10 p-1 rounded-md"><X size={14}/></button>
                  )}
                </div>
              ))}
              {pollOptions.length < 5 && (
                <button onClick={handleAddPollOption} className="text-xs font-bold text-secondary flex items-center gap-1 mt-1 hover:underline self-start">+ Add Option</button>
              )}
            </div>
          )}

          {postType === 'code' && (
            <div className="flex flex-col gap-2 bg-surface-soft/40 p-3 rounded-xl border border-border/30">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted">Paste your code snippet</span>
                <select 
                  value={codeLanguage} 
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="bg-surface border border-border/40 rounded-lg px-2 py-1 text-xs text-text focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML/CSS</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <textarea
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                placeholder="const hello = () => console.log('Vynk!');"
                className="w-full bg-surface border border-border/40 rounded-lg p-3 text-xs font-mono text-text focus:outline-none h-24"
              />
            </div>
          )}

          {selectedFile && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border inline-block max-w-xs">
              <p className="text-text text-xs font-bold p-2 bg-surface-soft flex justify-between items-center gap-4">
                <span className="truncate">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><X size={12}/></button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-3">
        <div className="flex items-center gap-2 text-muted">
          {postType === 'text' && (
            <button onClick={() => {}} className="p-2 rounded-full hover:bg-secondary/10 hover:text-secondary transition-colors relative group">
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,video/*" 
                  onChange={(e) => setSelectedFile(e.target.files[0])} 
                />
                <ImageIcon size={20}/>
              </label>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Upload Media</span>
            </button>
          )}
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Posting...' : <><Send size={12} /> Post</>}
        </button>
      </div>
    </div>
  );
};


const Feed = () => {
  const [activeTab, setActiveTab] = useState('For You');
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStoryCreator, setShowStoryCreator] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedPosts, fetchedStories] = await Promise.all([
        postApi.getPosts(),
        storyApi.getStories().catch(() => [])
      ]);
      setPosts(fetchedPosts);
      setStories(fetchedStories);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = async (id) => {
    try {
      await postApi.deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
      toast.success('Post removed');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleStoryUpload = async (payload) => {
    try {
      const newStory = await storyApi.createStory(payload);
      setStories([newStory, ...stories]);
      toast.success('Story shared to timeline!');
      setShowStoryCreator(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload story');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 md:pb-6">
      
      {/* Stories Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <div onClick={() => setShowStoryCreator(true)} className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group relative">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border/80 flex items-center justify-center bg-surface-soft/40 hover:bg-surface-soft transition-colors text-primary overflow-hidden">
            <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xs text-text font-medium mt-1">Add Story</span>
        </div>
        
        {stories.map(story => (
          <StoryRing key={story._id} story={story} onClick={() => window.location.href = '/stories'} />
        ))}
      </div>

      <StoryCreatorModal 
        isOpen={showStoryCreator} 
        onClose={() => setShowStoryCreator(false)} 
        onUpload={handleStoryUpload}
      />

      <FeedComposer onPostCreated={handlePostCreated} />

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-border/30 px-2">
        {['For You', 'Following', 'Students', 'Developers'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-primary' : 'text-muted hover:text-text/80'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="feed-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-muted bg-surface-soft/20 rounded-2xl border border-border/45">
            <p className="font-bold">No posts yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
            ))}
          </AnimatePresence>
        )}
      </div>

    </div>
  );
};

export default Feed;
