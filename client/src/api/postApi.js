import api from './axios';

export const postApi = {
  getPosts: async () => {
    const res = await api.get('/posts');
    return res.data;
  },
  getFeedFollowing: async () => {
    const res = await api.get('/posts/feed/following');
    return res.data;
  },
  getFeedForYou: async () => {
    const res = await api.get('/posts/feed/foryou');
    return res.data;
  },
  getFeedTrending: async () => {
    const res = await api.get('/posts/feed/trending');
    return res.data;
  },
  getPost: async (id) => {
    const res = await api.get(`/posts/${id}`);
    return res.data;
  },
  createPost: async (data) => {
    const res = await api.post('/posts', data);
    return res.data;
  },
  likePost: async (id) => {
    const res = await api.put(`/posts/${id}/like`);
    return res.data;
  },
  savePost: async (id) => {
    const res = await api.put(`/posts/${id}/save`);
    return res.data;
  },
  sharePost: async (id) => {
    const res = await api.post(`/posts/${id}/share`);
    return res.data;
  },
  addComment: async (id, text) => {
    const res = await api.post(`/posts/${id}/comments`, { text });
    return res.data;
  },
  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },
  deleteComment: async (postId, commentId) => {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },
  votePoll: async (postId, optionIndex) => {
    const res = await api.put(`/posts/${postId}/vote`, { optionIndex });
    return res.data;
  }
};
