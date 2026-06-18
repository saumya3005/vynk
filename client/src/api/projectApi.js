import api from './axios';

export const projectApi = {
  getProjects: async () => {
    const res = await api.get('/projects');
    return res.data;
  },
  createProject: async (data) => {
    const res = await api.post('/projects', data);
    return res.data;
  },
  likeProject: async (id) => {
    const res = await api.put(`/projects/${id}/like`);
    return res.data;
  },
  collaborate: async (id) => {
    const res = await api.post(`/projects/${id}/collaborate`);
    return res.data;
  },
  viewProject: async (id) => {
    const res = await api.post(`/projects/${id}/view`);
    return res.data;
  }
};
