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
  }
};
