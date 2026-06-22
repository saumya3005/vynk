import api from './axios';

export const searchApi = {
  globalSearch: async (q) => {
    const res = await api.get(`/search?q=${encodeURIComponent(q)}`);
    return res.data;
  },
  getTrending: async () => {
    const res = await api.get('/search/trending');
    return res.data;
  }
};
