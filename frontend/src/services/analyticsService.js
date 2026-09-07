import { apiClient } from './api';

export const analyticsService = {
  getDashboardAnalytics: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },
};
