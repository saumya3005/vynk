import api from './axios';

export const noteApi = {
  getNotes: async () => {
    const res = await api.get('/notes');
    return res.data;
  },
  uploadNote: async (data) => {
    const res = await api.post('/notes', data);
    return res.data;
  },
  saveNote: async (id) => {
    const res = await api.put(`/notes/${id}/save`);
    return res.data;
  },
  downloadNote: async (id) => {
    const res = await api.put(`/notes/${id}/download`);
    return res.data;
  }
};
