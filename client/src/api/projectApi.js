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
  upvoteProject: async (id) => {
    const res = await api.put(`/projects/${id}/upvote`);
    return res.data;
  },
  collaborate: async (id) => {
    const res = await api.post(`/projects/${id}/collaborate`);
    return res.data;
  },
  viewProject: async (id) => {
    const res = await api.post(`/projects/${id}/view`);
    return res.data;
  },
  getProjectById: async (id) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  }
};
