import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { notificationApi } from '../api/notificationApi';

export const NotificationContext = createContext({ unreadCount: 0, refreshCount: () => {} });

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silent fail
    }
  }, [user]);

  // Poll every 30 seconds while logged in
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    refreshCount();
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [user, refreshCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
