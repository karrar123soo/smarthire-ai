import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Returns the root origin of the backend server.
 * If API_BASE_URL is a full URL (e.g. https://smarthire-backend.onrender.com/api/v1), returns 'https://smarthire-backend.onrender.com'.
 * If API_BASE_URL is relative (e.g. '/api/v1'), returns '' (current host).
 */
export const getBackendOrigin = () => {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    try {
      const url = new URL(API_BASE_URL);
      return url.origin;
    } catch (e) {
      return '';
    }
  }
  return '';
};

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
