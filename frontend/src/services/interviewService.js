import { apiClient } from './api';

export const interviewService = {
  scheduleInterview: async (data) => {
    const response = await apiClient.post('/interviews/schedule', data);
    return response.data;
  },

  getMyInterviews: async (params = {}) => {
    const response = await apiClient.get('/interviews/my-interviews', { params });
    return response.data;
  },

  getInterviewById: async (id) => {
    const response = await apiClient.get(`/interviews/${id}`);
    return response.data;
  },

  submitFeedback: async (id, feedbackData) => {
    const response = await apiClient.post(`/interviews/${id}/feedback`, feedbackData);
    return response.data;
  },

  rescheduleInterview: async (id, newDateTime, newMeetingLink = '') => {
    const response = await apiClient.patch(`/interviews/${id}/reschedule`, null, {
      params: { newDateTime, newMeetingLink },
    });
    return response.data;
  },

  cancelInterview: async (id, reason = '') => {
    const response = await apiClient.delete(`/interviews/${id}/cancel`, {
      params: { reason },
    });
    return response.data;
  },
};
