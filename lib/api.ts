import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

interface OrganizationData {
  organizationId: string;
  name: string;
  logo?: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  maxUsers: number;
  maxDoctors: number;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
}

interface OrganizationUpdateData {
  name?: string;
  logo?: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  maxUsers?: number;
  maxDoctors?: number;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  console.log('API Request to:', config.url, 'Token:', token ? 'Present' : 'Missing');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header set:', config.headers.Authorization?.substring(0, 20) + '...');
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 error detected, redirecting to login');
      // Clear token and redirect to login page
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

  // Organizations
  createOrganization: async (organizationData: OrganizationData) => {
    const response = await api.post('/superadmin/organizations', organizationData);
    return response.data;
  },

  getAllOrganizations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await api.get('/superadmin/organizations', { params });
    return response.data;
  },

  getOrganizationById: async (id: string) => {
    const response = await api.get(`/superadmin/organizations/${id}`);
    return response.data;
  },

  updateOrganization: async (id: string, updateData: OrganizationUpdateData) => {
    const response = await api.put(`/superadmin/organizations/${id}`, updateData);
    return response.data;
  },

  deleteOrganization: async (id: string) => {
    const response = await api.delete(`/superadmin/organizations/${id}`);
    return response.data;
  },

  toggleOrganizationStatus: async (id: string) => {
    const response = await api.patch(`/superadmin/organizations/${id}/toggle-status`);
    return response.data;
  },

  getOrganizationStats: async () => {
    const response = await api.get('/superadmin/organizations/stats');
    return response.data;
  },
};

export default api; 