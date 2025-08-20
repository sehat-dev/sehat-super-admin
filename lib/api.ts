import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// SuperAdmin API functions
export const superAdminAPI = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('/superadmin/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/superadmin/auth/profile');
    return response.data;
  },

  // Dashboard
  getOverview: async () => {
    const response = await api.get('/superadmin/dashboard/overview');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/superadmin/dashboard/stats');
    return response.data;
  },
};

export default api; 