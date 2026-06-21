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
  },
  getCommunityById: async (id) => {
    const res = await api.get(`/communities/${id}`);
    return res.data;
  },
  requestJoin: async (id, message) => {
    const res = await api.post(`/communities/${id}/request`, { message });
    return res.data;
  },
  manageRequest: async (id, requestId, status) => {
    const res = await api.put(`/communities/${id}/request/${requestId}`, { status });
    return res.data;
  },
  createChannel: async (id, data) => {
    const res = await api.post(`/communities/${id}/channels`, data);
    return res.data;
  },
  deleteChannel: async (id, channelId) => {
    const res = await api.delete(`/communities/${id}/channels/${channelId}`);
    return res.data;
  },
  addPost: async (id, data) => {
    const res = await api.post(`/communities/${id}/posts`, data);
    return res.data;
  },
  likePost: async (id, postId) => {
    const res = await api.put(`/communities/${id}/posts/${postId}/like`);
    return res.data;
  },
  commentPost: async (id, postId, text) => {
    const res = await api.post(`/communities/${id}/posts/${postId}/comment`, { text });
    return res.data;
  }
};
