import axiosInstance from './axios';

export const storyApi = {
  createStory: async (storyData) => {
    const res = await axiosInstance.post('/stories', storyData);
    return res.data;
  },
  getStories: async () => {
    const res = await axiosInstance.get('/stories');
    return res.data;
  },
  viewStory: async (id) => {
    const res = await axiosInstance.post(`/stories/${id}/view`);
    return res.data;
  },
  likeStory: async (id) => {
    const res = await axiosInstance.post(`/stories/${id}/like`);
    return res.data;
  },
  replyStory: async (id, message) => {
    const res = await axiosInstance.post(`/stories/${id}/reply`, { message });
    return res.data;
  },
  deleteStory: async (id) => {
    const res = await axiosInstance.delete(`/stories/${id}`);
    return res.data;
  }
};
