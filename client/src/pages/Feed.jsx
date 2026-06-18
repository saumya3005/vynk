import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image as ImageIcon, Video, AlignLeft, CheckSquare, Send, PlusCircle, Trash2, Camera, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { postApi } from '../api/postApi';
import { storyApi } from '../api/storyApi';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import CameraCapture from '../components/ui/CameraCapture';
import CommentDrawer from '../components/ui/CommentDrawer';
import MediaUploader from '../components/ui/MediaUploader';

const StoryRing = ({ story, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group shrink-0">
    <div className="w-16 h-16 rounded-full p-0.75 bg-linear-to-tr from-vynk-primary via-vynk-secondary to-vynk-accent relative group-hover:scale-105 transition-transform duration-200">
      <div className="w-full h-full rounded-full border-2 border-vynk-bg-1 overflow-hidden bg-white">
        <img src={story.author?.avatar || 'https://via.placeholder.com/150'} alt={story.author?.username} className="w-full h-full object-cover" />
      </div>
    </div>
    <span className="text-xs text-vynk-text font-medium w-16 truncate text-center">{story.author?.username}</span>
  </div>
);

const PostCard = ({ post: initialPost, onDelete }) => {
  const [post, setPost] = useState(initialPost);
  const { user } = useContext(AuthContext);
  const [showCommentDrawer, setShowCommentDrawer] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

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
      setPost(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card mb-6 overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={post.author?.avatar || 'https://via.placeholder.com/150'} alt="avatar" className="w-10 h-10 rounded-full border border-vynk-border object-cover shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-vynk-text hover:underline cursor-pointer">{post.author?.username}</h3>
              <p className="text-[11px] text-vynk-muted">{post.author?.role || 'User'} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {post.author?._id === user?.id && (
              <button onClick={() => onDelete(post._id)} className="text-red-500/50 hover:text-red-500 p-1 transition-colors"><Trash2 size={16}/></button>
            )}
            <button className="text-vynk-muted hover:text-vynk-text p-1"><MoreHorizontal size={20}/></button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-vynk-text leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div className="w-full max-h-125 overflow-hidden bg-black/5 flex items-center justify-center">
            {post.mediaType === 'video' ? (
               <video src={post.mediaUrl} controls className="w-full max-h-125 object-contain" />
            ) : (
               <img src={post.mediaUrl} alt="Post media" className="w-full max-h-125 object-contain" />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-between border-t border-vynk-border/50">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-vynk-primary' : 'text-vynk-muted hover:text-vynk-primary'}`}>
              <motion.div whileTap={{ scale: 0.8 }}>
                <Heart size={22} className={isLiked ? 'fill-vynk-primary' : ''} />
              </motion.div>
              <span className="text-sm font-semibold">{post.likes?.length || 0}</span>
            </button>
            
            <button onClick={() => setShowCommentDrawer(true)} className="flex items-center gap-2 text-vynk-muted hover:text-vynk-text transition-colors">
              <MessageCircle size={22} />
              <span className="text-sm font-semibold">{post.comments?.length || 0}</span>
            </button>
            
            <button className="flex items-center gap-2 text-vynk-muted hover:text-vynk-text transition-colors">
              <Share2 size={20} />
            </button>
          </div>
          
          <button onClick={handleSave} className={`transition-colors ${isSaved ? 'text-vynk-secondary' : 'text-vynk-muted hover:text-vynk-secondary'}`}>
             <motion.div whileTap={{ scale: 0.8 }}>
               <Bookmark size={22} className={isSaved ? 'fill-vynk-secondary' : ''} />
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
        onLikeComment={() => {}} // placeholder for nested comment likes
        onDeleteComment={() => {}} // placeholder for deleting comments
      />
    </>
  );
};

const FeedComposer = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl && !selectedFile) return;
    setIsSubmitting(true);
    const submitPost = async (mediaBase64, mediaTypeStr) => {
      try {
        const payload = {
          content,
          mediaUrl: mediaBase64 || '',
          mediaType: mediaTypeStr || 'text',
          category: 'General',
          tags: []
        };
        const newPost = await postApi.createPost(payload);
        setContent('');
        setMediaUrl('');
        setSelectedFile(null);
        setShowUploader(false);
        onPostCreated(newPost);
        toast.success('Post created successfully!');
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
      submitPost(mediaUrl, mediaUrl ? 'image' : 'text');
    }
  };

  const handleCameraCapture = (base64Data) => {
    setMediaUrl(base64Data);
  };

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-secondary to-vynk-accent overflow-hidden shrink-0">
          <img src={user?.avatar || 'https://via.placeholder.com/150'} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share a project, thought, or note..."
            className="w-full bg-transparent border-none resize-none focus:ring-0 text-vynk-text text-lg placeholder:text-vynk-muted pt-2 min-h-15"
          />
          {mediaUrl && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-vynk-border inline-block max-w-xs">
               <img src={mediaUrl} alt="Preview" className="w-full h-auto" />
               <button onClick={() => setMediaUrl('')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"><X size={14}/></button>
            </div>
          )}
          {showUploader && !mediaUrl && !selectedFile && (
            <div className="mt-4">
               <MediaUploader onFileSelect={setSelectedFile} accept="image/*,video/*" label="Upload Photo/Video" />
            </div>
          )}
          {selectedFile && (
            <div className="relative mt-4 p-4 rounded-xl border border-vynk-border inline-block">
               <p className="text-vynk-text text-sm font-bold">{selectedFile.name}</p>
               <button onClick={() => setSelectedFile(null)} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><X size={14}/></button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-vynk-border/50">
        <div className="flex items-center gap-2 text-vynk-muted">
          <button onClick={() => { setShowCamera(true); setShowUploader(false); setMediaUrl(''); setSelectedFile(null); }} className="p-2 rounded-full hover:bg-vynk-primary/10 hover:text-vynk-primary transition-colors tooltip-trigger relative group">
            <Camera size={20}/>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Camera</span>
          </button>
          <button onClick={() => { setShowUploader(!showUploader); setMediaUrl(''); }} className="p-2 rounded-full hover:bg-vynk-secondary/10 hover:text-vynk-secondary transition-colors relative group">
            <ImageIcon size={20}/>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Gallery</span>
          </button>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={(!content.trim() && !mediaUrl && !selectedFile) || isSubmitting}
          className="btn-primary py-1.5 px-4 text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? 'Posting...' : <><Send size={14} /> Post</>}
        </button>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};


const Feed = () => {
  const [activeTab, setActiveTab] = useState('For You');
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Story camera state
  const [showStoryCamera, setShowStoryCamera] = useState(false);
  const [showStoryUploader, setShowStoryUploader] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedPosts, fetchedStories] = await Promise.all([
        postApi.getPosts(),
        storyApi.getStories().catch(() => []) // Catch if missing
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
      toast.success('Post deleted');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  const handleCreateStory = async (base64Data) => {
    setIsUploadingStory(true);
    try {
      const payload = {
        mediaUrl: base64Data,
        mediaType: 'image',
        caption: ''
      };

      console.log("story payload", payload);
      const newStory = await storyApi.createStory(payload);
      console.log("story response", newStory);
      
      setStories([newStory, ...stories]);
      toast.success('Story uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload story');
    } finally {
      setIsUploadingStory(false);
    }
  };

  const handleStoryFileUpload = async () => {
    if (!storyFile) return;
    setIsUploadingStory(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const payload = {
            mediaUrl: reader.result,
            mediaType: storyFile.type.startsWith('video') ? 'video' : 'image',
            caption: ''
          };
          console.log("story payload", payload);
          const newStory = await storyApi.createStory(payload);
          console.log("story response", newStory);
          
          setStories([newStory, ...stories]);
          toast.success('Story uploaded!');
          setShowStoryUploader(false);
          setStoryFile(null);
        } catch (err) {
          console.error(err);
          toast.error(err.response?.data?.message || 'Failed to upload story');
        } finally {
          setIsUploadingStory(false);
        }
      };
      reader.readAsDataURL(storyFile);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload story');
      setIsUploadingStory(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 md:pb-6">
      
      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0 group relative">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-vynk-muted flex items-center justify-center bg-white/50 hover:bg-white transition-colors text-vynk-primary overflow-hidden">
            <PlusCircle size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-xs text-vynk-text font-medium mt-1">Add Story</span>
          
          {/* Quick Action Overlay */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-vynk-border p-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none group-hover:pointer-events-auto">
            <button onClick={() => setShowStoryCamera(true)} className="p-2 hover:bg-vynk-bg-2 rounded-lg text-vynk-primary"><Camera size={18}/></button>
            <button onClick={() => setShowStoryUploader(true)} className="p-2 hover:bg-vynk-bg-2 rounded-lg text-vynk-secondary"><ImageIcon size={18}/></button>
          </div>
        </div>
        {stories.map(story => (
          <StoryRing key={story._id} story={story} onClick={() => window.location.href = '/stories'} />
        ))}
      </div>

      {showStoryCamera && (
        <CameraCapture 
          onCapture={handleCreateStory} 
          onClose={() => setShowStoryCamera(false)} 
        />
      )}

      <AnimatePresence>
        {showStoryUploader && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-vynk-bg rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-vynk-border"
            >
              <h2 className="text-xl font-bold text-vynk-text mb-4">Upload Story</h2>
              <div className="mb-4">
                 <MediaUploader onFileSelect={setStoryFile} accept="image/*,video/*" label="Upload Photo/Video" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowStoryUploader(false)} className="flex-1 py-2 rounded-xl border border-vynk-border text-vynk-text font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleStoryFileUpload} disabled={!storyFile || isUploadingStory} className="flex-1 btn-primary py-2 flex justify-center items-center">
                  {isUploadingStory ? 'Uploading...' : 'Share'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedComposer onPostCreated={handlePostCreated} />

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-vynk-border px-2">
        {['For You', 'Following', 'Students', 'Developers'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === tab ? 'text-vynk-text' : 'text-vynk-muted hover:text-vynk-text/80'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="feed-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-vynk-text rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Feed Posts */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-vynk-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-vynk-muted bg-white/30 rounded-2xl border border-vynk-border">
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
