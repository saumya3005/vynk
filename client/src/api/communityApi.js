import api from './axios';

export const communityApi = {
  getCommunities: async () => {
    const res = await api.get('/communities');
    return res.data;
  },
  createCommunity: async (data) => {
    const res = await api.post('/communities', data);
    return res.data;
  },
  joinCommunity: async (id) => {
    const res = await api.put(`/communities/${id}/join`);
    return res.data;
  },
  leaveCommunity: async (id) => {
    const res = await api.put(`/communities/${id}/leave`);
    return res.data;
  }
};
