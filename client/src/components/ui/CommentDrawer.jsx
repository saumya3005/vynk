import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const CommentDrawer = ({ isOpen, onClose, comments = [], onAddComment, onDeleteComment, onLikeComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    await onAddComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-150 md:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full md:w-96 md:right-0 md:left-auto md:top-0 md:bottom-0 h-[80vh] md:h-screen bg-bg z-200 rounded-t-3xl md:rounded-none shadow-2xl flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-border"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-white/50 backdrop-blur-md">
              <h3 className="font-bold text-lg text-text">Comments <span className="text-muted text-sm font-normal">({comments.length})</span></h3>
              <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors text-text">
                <X size={20} />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scrollbar-hide">
              {comments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted">
                  <p className="text-sm font-bold">No comments yet.</p>
                  <p className="text-xs">Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-3 group">
                    <img src={c.author?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
                    <div className="flex-1">
                      <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-sm shadow-sm relative">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-text">{c.author?.username}</span>
                          <span className="text-[10px] text-muted font-bold tracking-wider uppercase">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-text/90">{c.text}</p>
                      </div>
                      <div className="flex gap-4 mt-2 px-2 text-xs font-bold text-muted">
                        <button 
                          onClick={() => onLikeComment(c._id)} 
                          className={`flex items-center gap-1 hover:text-primary transition-colors ${c.likes?.includes(currentUser?.id) ? 'text-primary' : ''}`}
                        >
                          <Heart size={12} className={c.likes?.includes(currentUser?.id) ? 'fill-primary' : ''} /> {c.likes?.length || 0}
                        </button>
                        <button className="hover:text-text transition-colors">Reply</button>
                        {c.author?._id === currentUser?.id && (
                          <button onClick={() => onDeleteComment(c._id)} className="text-red-500/50 hover:text-red-500 transition-colors ml-auto opacity-0 group-hover:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-border">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <img src={currentUser?.avatar || 'https://via.placeholder.com/40'} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-border" />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-surface border-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!newComment.trim() || isSubmitting}
                    className="absolute right-1 top-1 bottom-1 aspect-square bg-primary rounded-full text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentDrawer;
