import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Image as ImageIcon, Video, AlignLeft, CheckSquare, Send, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// --- MOCK DATA ---
const MOCK_STORIES = [
  { id: 1, user: 'alex_dev', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, user: 'sarah_ui', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, user: 'mike_code', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, user: 'emma_ai', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, user: 'josh_sys', avatar: 'https://i.pravatar.cc/150?u=5' },
];

const MOCK_POSTS = [
  {
    id: 1,
    author: { name: 'Sarah Designer', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=2' },
    content: 'Just wrapped up a massive redesign for a fintech startup! Really proud of how we pushed the glassmorphism aesthetic while maintaining high accessibility standards. Thoughts? 🎨✨',
    image: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1000',
    likes: 124,
    comments: 12,
    time: '2h ago',
    isLiked: false,
    isSaved: false
  },
  {
    id: 2,
    author: { name: 'Alex Developer', role: 'Full Stack Student', avatar: 'https://i.pravatar.cc/150?u=1' },
    content: 'Finally figured out Framer Motion layout animations. It took me a whole weekend but it was totally worth it. The layout transitions are butter smooth now! 🚀',
    likes: 89,
    comments: 5,
    time: '4h ago',
    isLiked: true,
    isSaved: true
  }
];

// --- COMPONENTS ---

const StoryRing = ({ story }) => (
  <div className="flex flex-col items-center gap-1 cursor-pointer group shrink-0">
    <div className="w-16 h-16 rounded-full p-0.75 bg-linear-to-tr from-vynk-primary via-vynk-secondary to-vynk-accent relative group-hover:scale-105 transition-transform duration-200">
      <div className="w-full h-full rounded-full border-2 border-vynk-bg-1 overflow-hidden bg-white">
        <img src={story.avatar} alt={story.user} className="w-full h-full object-cover" />
      </div>
    </div>
    <span className="text-xs text-vynk-text font-medium w-16 truncate text-center">{story.user}</span>
  </div>
);

const PostCard = ({ post: initialPost }) => {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = () => {
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleSave = () => {
    setPost(prev => ({ ...prev, isSaved: !prev.isSaved }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card mb-6 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={post.author.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-vynk-border object-cover" />
          <div>
            <h3 className="font-bold text-sm text-vynk-text hover:underline cursor-pointer">{post.author.name}</h3>
            <p className="text-xs text-vynk-muted">{post.author.role} • {post.time}</p>
          </div>
        </div>
        <button className="text-vynk-muted hover:text-vynk-text p-1"><MoreHorizontal size={20}/></button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-vynk-text leading-relaxed">{post.content}</p>
      </div>

      {/* Media */}
      {post.image && (
        <div className="w-full max-h-100 overflow-hidden bg-vynk-bg-2">
          <img src={post.image} alt="Post media" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="p-4 flex items-center justify-between border-t border-vynk-border/50">
        <div className="flex items-center gap-6">
          <button onClick={handleLike} className={`flex items-center gap-2 group transition-colors ${post.isLiked ? 'text-vynk-primary' : 'text-vynk-muted hover:text-vynk-primary'}`}>
            <motion.div whileTap={{ scale: 0.8 }}>
              <Heart size={22} className={post.isLiked ? 'fill-vynk-primary' : ''} />
            </motion.div>
            <span className="text-sm font-semibold">{post.likes}</span>
          </button>
          
          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-vynk-muted hover:text-vynk-text transition-colors">
            <MessageCircle size={22} />
            <span className="text-sm font-semibold">{post.comments}</span>
          </button>
          
          <button className="flex items-center gap-2 text-vynk-muted hover:text-vynk-text transition-colors">
            <Share2 size={20} />
          </button>
        </div>
        
        <button onClick={handleSave} className={`transition-colors ${post.isSaved ? 'text-vynk-secondary' : 'text-vynk-muted hover:text-vynk-secondary'}`}>
           <motion.div whileTap={{ scale: 0.8 }}>
             <Bookmark size={22} className={post.isSaved ? 'fill-vynk-secondary' : ''} />
           </motion.div>
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-vynk-border/50 bg-vynk-bg-2/30"
          >
            <div className="p-4 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-vynk-primary shrink-0"></div>
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-white/60 border border-vynk-border rounded-full py-1.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-vynk-secondary/50"
                />
                {commentText && (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-vynk-primary hover:scale-110 transition-transform">
                    <Send size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FeedComposer = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-secondary to-vynk-accent overflow-hidden shrink-0">
          {user?.avatar && <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />}
        </div>
        <textarea 
          placeholder="What's on your mind? Share a project, thought, or note..."
          className="w-full bg-transparent border-none resize-none focus:ring-0 text-vynk-text text-lg placeholder:text-vynk-muted pt-2 min-h-15"
        />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-vynk-border/50">
        <div className="flex items-center gap-2 text-vynk-muted">
          <button className="p-2 rounded-full hover:bg-vynk-primary/10 hover:text-vynk-primary transition-colors"><ImageIcon size={20}/></button>
          <button className="p-2 rounded-full hover:bg-vynk-secondary/10 hover:text-vynk-secondary transition-colors"><Video size={20}/></button>
          <button className="p-2 rounded-full hover:bg-vynk-accent/20 hover:text-emerald-500 transition-colors"><AlignLeft size={20}/></button>
          <button className="p-2 rounded-full hover:bg-yellow-500/10 hover:text-yellow-600 transition-colors"><CheckSquare size={20}/></button>
        </div>
        <button className="btn-primary py-1.5 px-4 text-sm">Post</button>
      </div>
    </div>
  );
};


const Feed = () => {
  const [activeTab, setActiveTab] = useState('For You');

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 pb-24 md:pb-6">
      
      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-vynk-muted flex items-center justify-center bg-white/50 hover:bg-white transition-colors text-vynk-primary">
            <PlusSquare size={24} />
          </div>
          <span className="text-xs text-vynk-text font-medium">Add Story</span>
        </div>
        {MOCK_STORIES.map(story => (
          <StoryRing key={story.id} story={story} />
        ))}
      </div>

      <FeedComposer />

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
        {MOCK_POSTS.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {MOCK_POSTS.map(post => (
          <PostCard key={`dup-${post.id}`} post={{...post, id: post.id + 10}} />
        ))}
      </div>

    </div>
  );
};

// Simple icon that wasn't imported at top
const PlusSquare = ({ size }) => <PlusCircle size={size} />;
import { PlusCircle } from 'lucide-react';

export default Feed;
