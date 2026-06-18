import { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Image as ImageIcon, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Mock Data
const MOCK_POSTS = [
  {
    id: '1',
    author: { name: 'Alex Developer', avatar: '', role: 'Developer' },
    content: 'Just launched my new open source project! Check it out.',
    likes: 42,
    comments: 5,
    shares: 2,
    time: '2h ago'
  },
  {
    id: '2',
    author: { name: 'Sarah Designer', avatar: '', role: 'Creator' },
    content: 'Exploring some new glassmorphism UI trends today. Loving the Vynk color palette! ✨',
    likes: 128,
    comments: 12,
    shares: 8,
    time: '5h ago'
  }
];

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [newPost, setNewPost] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    
    // TODO: API Integration
    const post = {
      id: Date.now().toString(),
      author: { name: user?.username || 'You', avatar: '', role: user?.role || 'Student' },
      content: newPost,
      likes: 0, comments: 0, shares: 0, time: 'Just now'
    };
    
    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 max-w-3xl mx-auto flex flex-col gap-6">
      
      {/* Create Post Box */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-mint to-vynk-peach shrink-0"></div>
          <form onSubmit={handlePost} className="flex-1 flex flex-col gap-3">
            <textarea 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share something with your network..." 
              className="w-full bg-transparent border-none resize-none focus:ring-0 text-vynk-charcoal placeholder-vynk-charcoal/50 text-lg outline-none"
              rows="2"
            ></textarea>
            <div className="flex justify-between items-center border-t border-white/20 pt-3">
              <div className="flex gap-2">
                <button type="button" className="p-2 text-vynk-charcoal/60 hover:text-vynk-coral hover:bg-white/50 rounded-full transition-colors">
                  <ImageIcon size={20} />
                </button>
              </div>
              <button type="submit" disabled={!newPost.trim()} className="btn-primary py-2 px-6 flex items-center gap-2 disabled:opacity-50">
                Post <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Feed Cards */}
      <div className="flex flex-col gap-6 pb-12">
        {posts.map((post, idx) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-5 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-vynk-lavender to-vynk-lilac"></div>
                <div>
                  <h3 className="font-bold text-vynk-charcoal leading-tight">{post.author.name}</h3>
                  <p className="text-xs text-vynk-charcoal/60">{post.author.role} • {post.time}</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <p className="text-vynk-charcoal/90 text-[15px]">{post.content}</p>

            {/* Actions */}
            <div className="flex justify-between items-center border-t border-white/20 pt-3 mt-2">
              <div className="flex gap-6">
                <button className="flex items-center gap-1.5 text-vynk-charcoal/60 hover:text-vynk-coral transition-colors text-sm font-medium">
                  <Heart size={18} /> {post.likes}
                </button>
                <button className="flex items-center gap-1.5 text-vynk-charcoal/60 hover:text-vynk-lavender transition-colors text-sm font-medium">
                  <MessageCircle size={18} /> {post.comments}
                </button>
                <button className="flex items-center gap-1.5 text-vynk-charcoal/60 hover:text-vynk-mint transition-colors text-sm font-medium">
                  <Share2 size={18} /> {post.shares}
                </button>
              </div>
              <button className="text-vynk-charcoal/60 hover:text-vynk-peach transition-colors">
                <Bookmark size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
