import { apiClient } from './api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await apiClient.get(`/resumes/${id}`);
    return response.data;
  },

  getMyResumes: async (params = {}) => {
    const response = await apiClient.get('/resumes/my-resumes', { params });
    return response.data;
  },

  getLatestResume: async () => {
    const response = await apiClient.get('/resumes/latest');
    return response.data;
  },

  syncResumeToProfile: async (resumeId, syncData = {}) => {
    const response = await apiClient.post(`/resumes/${resumeId}/sync-profile`, syncData);
    return response.data;
  },

  deleteResume: async (resumeId) => {
    const response = await apiClient.delete(`/resumes/${resumeId}`);
    return response.data;
  },
};
