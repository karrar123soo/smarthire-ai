import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smarthire_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token might be expired or invalid
      if (localStorage.getItem('smarthire_token')) {
        console.warn('Session expired or unauthorized. Clearing stored token.');
        localStorage.removeItem('smarthire_token');
        localStorage.removeItem('smarthire_user');
      }
    }
    return Promise.reject(error);
  }
);

export const healthApi = {
  getBasicHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
  getSystemInfo: async () => {
    const response = await apiClient.get('/health/system-info');
    return response.data;
  },
};
