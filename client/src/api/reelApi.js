import axiosInstance from './axios';

export const reelApi = {
  createReel: async (reelData) => {
    const res = await axiosInstance.post('/reels', reelData);
    return res.data;
  },
  getReels: async () => {
    const res = await axiosInstance.get('/reels');
    return res.data;
  },
  likeReel: async (id) => {
    const res = await axiosInstance.put(`/reels/${id}/like`);
    return res.data;
  },
  saveReel: async (id) => {
    const res = await axiosInstance.put(`/reels/${id}/save`);
    return res.data;
  },
  commentReel: async (id, text) => {
    const res = await axiosInstance.post(`/reels/${id}/comment`, { text });
    return res.data;
  },
  viewReel: async (id) => {
    const res = await axiosInstance.post(`/reels/${id}/view`);
    return res.data;
  },
  deleteReel: async (id) => {
    const res = await axiosInstance.delete(`/reels/${id}`);
    return res.data;
  }
};
