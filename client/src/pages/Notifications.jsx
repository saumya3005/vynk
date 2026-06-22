import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, UserPlus, MessageCircle, Star, Hash, CheckCircle, XCircle, Check } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import { NotificationContext } from '../context/NotificationContext';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '../components/ui/EmptyState';
import { PostSkeleton } from '../components/ui/Skeleton';

const TYPE_META = {
  like:           { icon: Heart,          color: 'from-primary/20 to-primary/5',    iconColor: 'text-primary',   label: 'Liked your post' },
  follow:         { icon: UserPlus,       color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400', label: 'Started following you' },
  follow_request: { icon: UserPlus,       color: 'from-secondary/20 to-secondary/5',iconColor: 'text-secondary', label: 'Requested to follow you' },
  follow_accept:  { icon: CheckCircle,    color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400', label: 'Accepted your follow request' },
  comment:        { icon: MessageCircle,  color: 'from-accent/20 to-accent/5',       iconColor: 'text-accent',    label: 'Commented on your post' },
  project:        { icon: Star,           color: 'from-yellow-500/20 to-yellow-500/5',iconColor: 'text-yellow-400',label: 'Interacted with your project' },
  community:      { icon: Hash,           color: 'from-blue-500/20 to-blue-500/5',  iconColor: 'text-blue-400',  label: 'Community update' },
};

const FollowRequestActions = ({ notif, onAction }) => {
  const [loading, setLoading] = useState(null);

  const handle = async (action) => {
    setLoading(action);
    try {
      // Extract requester ID from the notification link (/profile/:id)
      const requesterId = notif.link?.split('/').pop();
      if (!requesterId) throw new Error('No requester id');
      if (action === 'accept') {
        await userApi.acceptFollowRequest(requesterId);
        toast.success('Follow request accepted');
      } else {
        await userApi.rejectFollowRequest(requesterId);
        toast('Request declined', { icon: '🚫' });
      }
      onAction(notif._id);
    } catch {
      toast.error('Action failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 mt-2 ml-auto shrink-0">
      <button
        onClick={() => handle('accept')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-primary to-secondary text-white text-xs font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {loading === 'accept' ? <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full inline-block" /> : <Check size={12} />}
        Accept
      </button>
      <button
        onClick={() => handle('reject')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-muted text-xs font-bold disabled:opacity-50 hover:text-text hover:border-border transition-colors"
      >
        {loading === 'reject' ? <span className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full inline-block" /> : <XCircle size={12} />}
        Decline
      </button>
    </div>
  );
};

const NotifCard = ({ notif, onMarkRead, onAction, navigate }) => {
  const meta = TYPE_META[notif.type] || TYPE_META.like;
  const IconComp = meta.icon;

  const handleClick = () => {
    if (!notif.isRead) onMarkRead(notif._id);
    if (notif.link) navigate(notif.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleClick}
      className={`glass-card p-4 cursor-pointer transition-all border group relative overflow-hidden ${
        notif.isRead 
          ? 'border-border/20 opacity-70 hover:opacity-100 hover:border-border/40' 
          : 'border-primary/20 shadow-md shadow-primary/5 hover:border-primary/40 bg-primary/5 hover:bg-primary/10'
      }`}
    >
      {/* Subtle hover glow for unread */}
      {!notif.isRead && (
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      <div className="flex gap-4 items-start relative z-10">
        {/* Icon circle */}
        <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${meta.color} flex items-center justify-center shrink-0 shadow-sm`}>
          <IconComp size={20} className={meta.iconColor} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text leading-snug font-medium group-hover:text-primary transition-colors duration-200">
            {notif.message}
          </p>
          <p className="text-[11px] text-muted mt-1 font-medium">
            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
          </p>

          {notif.type === 'follow_request' && !notif.isRead && (
            <div onClick={e => e.stopPropagation()}>
              <FollowRequestActions notif={notif} onAction={onAction} />
            </div>
          )}
        </div>

        {/* Unread dot */}
        {!notif.isRead && (
          <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2 shadow-sm shadow-primary/50" />
        )}
      </div>
    </motion.div>
  );
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { setUnreadCount } = useContext(NotificationContext);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Failed to mark read');
    }
  };

  // Called after accepting/rejecting a follow request — mark as read & remove actions
  const handleFollowAction = (id) => {
    handleMarkRead(id);
  };

  const FILTERS = ['all', 'unread', 'likes', 'follows', 'comments'];

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'likes') return n.type === 'like';
    if (activeFilter === 'follows') return n.type === 'follow' || n.type === 'follow_request' || n.type === 'follow_accept';
    if (activeFilter === 'comments') return n.type === 'comment';
    return true;
  });

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen pt-6 px-4 max-w-2xl mx-auto pb-24 md:pb-12">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Bell className="text-primary" size={26} />
            Notifications
            {unread > 0 && (
              <span className="text-sm font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                {unread} new
              </span>
            )}
          </h1>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm font-bold text-primary hover:text-secondary transition-colors flex items-center gap-1"
          >
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap capitalize transition-all ${
              activeFilter === f
                ? 'bg-linear-to-r from-primary to-secondary text-white shadow-md shadow-primary/20'
                : 'bg-surface-soft text-muted border border-border/40 hover:text-text'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up!"
            message="No notifications in this category."
          />
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map(notif => (
              <NotifCard
                key={notif._id}
                notif={notif}
                onMarkRead={handleMarkRead}
                onAction={handleFollowAction}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Notifications;
