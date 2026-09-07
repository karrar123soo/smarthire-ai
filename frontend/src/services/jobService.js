import { apiClient } from './api';

export const jobService = {
  // Public & Candidate: Search and browse jobs
  getAllJobs: async (params = {}) => {
    const response = await apiClient.get('/jobs', { params });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  // HR Recruiter: CRUD operations
  createJob: async (jobData) => {
    const response = await apiClient.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await apiClient.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },

  changeJobStatus: async (id, status) => {
    const response = await apiClient.patch(`/jobs/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  getMyJobs: async (params = {}) => {
    const response = await apiClient.get('/jobs/my-jobs', { params });
    return response.data;
  },

  getJobStats: async () => {
    const response = await apiClient.get('/jobs/stats');
    return response.data;
  },
};
