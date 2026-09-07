import { apiClient } from './api';

export const applicationService = {
  // Candidate Operations
  applyToJob: async (jobId, candidateNotes = '', resumeId = null) => {
    const response = await apiClient.post('/applications/apply', {
      jobId,
      candidateNotes,
      resumeId,
    });
    return response.data;
  },

  getMyApplications: async (params = {}) => {
    const response = await apiClient.get('/applications/my-applications', { params });
    return response.data;
  },

  getApplicationById: async (id) => {
    const response = await apiClient.get(`/applications/${id}`);
    return response.data;
  },

  withdrawApplication: async (id) => {
    const response = await apiClient.delete(`/applications/${id}/withdraw`);
    return response.data;
  },

  // HR Recruiter Operations
  getJobApplications: async (jobId, params = {}) => {
    const response = await apiClient.get(`/applications/job/${jobId}`, { params });
    return response.data;
  },

  getRecruiterPipeline: async (params = {}) => {
    const response = await apiClient.get('/applications/recruiter-pipeline', { params });
    return response.data;
  },

  updateApplicationStatus: async (id, status, hrNotes = '') => {
    const response = await apiClient.patch(`/applications/${id}/status`, {
      status,
      hrNotes,
    });
    return response.data;
  },

  getPipelineStats: async () => {
    const response = await apiClient.get('/applications/stats');
    return response.data;
  },
};
