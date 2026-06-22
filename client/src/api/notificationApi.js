import axiosInstance from './axios';

export const notificationApi = {
  getNotifications: async () => {
    const res = await axiosInstance.get('/notifications');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await axiosInstance.get('/notifications/count');
    return res.data.count;
  },
  markRead: async (id) => {
    const res = await axiosInstance.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await axiosInstance.put('/notifications/read-all');
    return res.data;
  }
};
