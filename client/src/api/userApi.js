import api from './axios';

export const userApi = {
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  getUser: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },
  updateAvatar: async (data) => {
    const res = await api.put('/users/avatar', data);
    return res.data;
  },
  followUser: async (id) => {
    const res = await api.put(`/users/${id}/follow`);
    return res.data;
  }
};
