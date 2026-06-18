import { useState, useEffect } from 'react';
import { Bell, Heart, UserPlus, MessageCircle, Star, Hash } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={18} />;
      case 'follow': return <UserPlus size={18} />;
      case 'comment': return <MessageCircle size={18} />;
      case 'project': return <Star size={18} />;
      case 'community': return <Hash size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'like': return 'text-vynk-coral bg-vynk-peach/20';
      case 'follow': return 'text-emerald-600 bg-vynk-mint/20';
      case 'comment': return 'text-purple-600 bg-vynk-lavender/20';
      case 'project': return 'text-yellow-600 bg-yellow-100';
      case 'community': return 'text-blue-600 bg-blue-100';
      default: return 'text-vynk-charcoal bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 max-w-3xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-vynk-text"><Bell className="text-vynk-primary"/> Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="text-sm font-bold text-vynk-primary hover:text-vynk-secondary transition-colors">Mark all as read</button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-vynk-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-vynk-muted">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => (
            <motion.div 
              key={notif._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => !notif.isRead && handleMarkRead(notif._id)}
              className={`glass-card p-4 flex gap-4 items-center cursor-pointer transition-colors ${!notif.isRead ? 'bg-white/80 border-l-4 border-l-vynk-primary shadow-sm' : 'bg-white/40 opacity-70'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <p className="text-sm text-vynk-text flex-1">
                {notif.message}
              </p>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-vynk-primary shrink-0"></div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
