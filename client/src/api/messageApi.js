import api from './axios';

export const messageApi = {
  getMessages: async (userId) => {
    const res = await api.get(`/messages/${userId}`);
    return res.data;
  },
  sendMessage: async (data) => {
    const res = await api.post('/messages', data);
    return res.data;
  },
  markSeen: async (id) => {
    const res = await api.put(`/messages/${id}/seen`);
    return res.data;
  },
  addReaction: async (id, emoji) => {
    const res = await api.put(`/messages/${id}/reaction`, { emoji });
    return res.data;
  },
  deleteMessage: async (id) => {
    const res = await api.delete(`/messages/${id}`);
    return res.data;
  },
  getActiveUsers: async () => {
    const res = await api.get('/messages/users/active');
    return res.data;
  },
  searchUsers: async (query) => {
    const res = await api.get(`/messages/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  }
};
