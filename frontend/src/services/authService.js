import { apiClient } from './api';

export const authService = {
  // 1. Authentication
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 2. User & Profiles
  getFullProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  getCandidateProfile: async () => {
    const response = await apiClient.get('/users/candidate-profile');
    return response.data;
  },

  updateCandidateProfile: async (profileData) => {
    const response = await apiClient.put('/users/candidate-profile', profileData);
    return response.data;
  },

  getHRProfile: async () => {
    const response = await apiClient.get('/users/hr-profile');
    return response.data;
  },

  updateHRProfile: async (profileData) => {
    const response = await apiClient.put('/users/hr-profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put('/users/change-password', passwordData);
    return response.data;
  },
};
