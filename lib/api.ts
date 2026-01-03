import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
}

interface CMSContentData {
  contentType: string;
  content: unknown[];
  isActive?: boolean;
}

interface CMSContentUpdateData {
  content?: unknown[];
  isActive?: boolean;
}

interface ServicePackageData {
  packageId: string;
  serviceType: "care_center" | "health_mitra" | "health_checkup" | "lab_test";
  name: string;
  description: string;
  testsIncluded: string[];
  servicesIncluded: string[];
  price: number;
  originalPrice: number;
  category: string;
  subCategory?: string;
  duration?: number;
  preparationInstructions?: string[];
  tags?: string[];
  popularity?: number;
  isActive?: boolean;
}

interface ServicePackageUpdateData {
  name?: string;
  description?: string;
  testsIncluded?: string[];
  servicesIncluded?: string[];
  price?: number;
  originalPrice?: number;
  category?: string;
  subCategory?: string;
  duration?: number;
  preparationInstructions?: string[];
  tags?: string[];
  popularity?: number;
  isActive?: boolean;
}

interface ServiceData {
  serviceId: string;
  serviceType: "care_center" | "health_mitra" | "health_checkup" | "lab_test";
  name: string;
  category?: string;
  price: number;
  originalPrice?: number;
  isActive?: boolean;
}

interface ServiceUpdateData {
  name?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  isActive?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  console.log(
    "API Request to:",
    config.url,
    "Token:",
    token ? "Present" : "Missing"
  );
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      "Authorization header set:",
      config.headers.Authorization?.substring(0, 20) + "..."
    );
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401 error detected, redirecting to login");
      // Clear token and redirect to login page
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const superAdminAPI = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post("/superadmin/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/superadmin/auth/profile");
    return response.data;
  },

  // Dashboard
  getOverview: async () => {
    const response = await api.get("/superadmin/dashboard/overview");
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/superadmin/dashboard/stats");
    return response.data;
  },

  // Organizations
  createOrganization: async (organizationData: OrganizationData) => {
    const response = await api.post(
      "/superadmin/organizations",
      organizationData
    );
    return response.data;
  },

  getAllOrganizations: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await api.get("/superadmin/organizations", { params });
    return response.data;
  },

  getOrganizationById: async (id: string) => {
    const response = await api.get(`/superadmin/organizations/${id}`);
    return response.data;
  },

  updateOrganization: async (
    id: string,
    updateData: OrganizationUpdateData
  ) => {
    const response = await api.put(
      `/superadmin/organizations/${id}`,
      updateData
    );
    return response.data;
  },

  deleteOrganization: async (id: string) => {
    const response = await api.delete(`/superadmin/organizations/${id}`);
    return response.data;
  },

  toggleOrganizationStatus: async (id: string) => {
    const response = await api.patch(
      `/superadmin/organizations/${id}/toggle-status`
    );
    return response.data;
  },

  getOrganizationStats: async () => {
    const response = await api.get("/superadmin/organizations/stats");
    return response.data;
  },

  // Users
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const response = await api.get("/superadmin/users", { params });
    return response.data;
  },

  searchUsers: async (params?: {
    search?: string;
    status?: string;
    emailVerified?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/superadmin/users/search", { params });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/superadmin/users/${id}`);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get("/superadmin/users/stats");
    return response.data;
  },

  toggleUserStatus: async (id: string) => {
    const response = await api.patch(`/superadmin/users/${id}/toggle-status`);
    return response.data;
  },

  // Doctors
  getAllDoctors: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    specialization?: string;
  }) => {
    const response = await api.get("/superadmin/doctors", { params });
    return response.data;
  },

  searchDoctors: async (params?: {
    search?: string;
    status?: string;
    emailVerified?: string;
    specialization?: string;
    experienceMin?: number;
    experienceMax?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/superadmin/doctors/search", { params });
    return response.data;
  },

  getDoctorById: async (id: string) => {
    const response = await api.get(`/superadmin/doctors/${id}`);
    return response.data;
  },

  getDoctorStats: async () => {
    const response = await api.get("/superadmin/doctors/stats");
    return response.data;
  },

  getSpecializations: async () => {
    const response = await api.get("/superadmin/doctors/specializations");
    return response.data;
  },

  toggleDoctorStatus: async (id: string) => {
    const response = await api.patch(`/superadmin/doctors/${id}/toggle-status`);
    return response.data;
  },

  // Bookings
  getAllBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    serviceType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const response = await api.get("/superadmin/bookings", { params });
    return response.data;
  },

  getBookingById: async (id: string) => {
    const response = await api.get(`/superadmin/bookings/${id}`);
    return response.data;
  },

  updateBookingStatus: async (id: string, status: string, reason?: string) => {
    const response = await api.patch(`/superadmin/bookings/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  cancelBooking: async (id: string, reason?: string) => {
    const response = await api.patch(`/superadmin/bookings/${id}/cancel`, {
      reason,
    });
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get("/superadmin/bookings/stats");
    return response.data;
  },

  deleteBooking: async (id: string) => {
    const response = await api.delete(`/superadmin/bookings/${id}`);
    return response.data;
  },

  // CMS Content
  getAllCMSContent: async (params?: {
    contentType?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get("/superadmin/cms", { params });
    return response.data;
  },

  getCMSContentById: async (id: string) => {
    const response = await api.get(`/superadmin/cms/${id}`);
    return response.data;
  },

  createCMSContent: async (contentData: CMSContentData) => {
    const response = await api.post("/superadmin/cms", contentData);
    return response.data;
  },

  updateCMSContent: async (id: string, updateData: CMSContentUpdateData) => {
    const response = await api.patch(`/superadmin/cms/${id}`, updateData);
    return response.data;
  },

  deleteCMSContent: async (id: string) => {
    const response = await api.delete(`/superadmin/cms/${id}`);
    return response.data;
  },

  // Service Packages
  getAllServicePackages: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    serviceType?: string;
    category?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get("/superadmin/service-packages", { params });
    return response.data;
  },

  getServicePackageById: async (id: string) => {
    const response = await api.get(`/superadmin/service-packages/${id}`);
    return response.data;
  },

  createServicePackage: async (packageData: ServicePackageData) => {
    const response = await api.post("/superadmin/service-packages", packageData);
    return response.data;
  },

  updateServicePackage: async (id: string, updateData: ServicePackageUpdateData) => {
    const response = await api.put(`/superadmin/service-packages/${id}`, updateData);
    return response.data;
  },

  deleteServicePackage: async (id: string) => {
    const response = await api.delete(`/superadmin/service-packages/${id}`);
    return response.data;
  },

  toggleServicePackageStatus: async (id: string) => {
    const response = await api.patch(`/superadmin/service-packages/${id}/toggle-status`);
    return response.data;
  },

  // Services (Individual services with pricing)
  getAllServices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    serviceType?: string;
    category?: string;
    isActive?: boolean;
  }) => {
    const response = await api.get("/superadmin/services", { params });
    return response.data;
  },

  getServiceById: async (id: string) => {
    const response = await api.get(`/superadmin/services/${id}`);
    return response.data;
  },

  createService: async (serviceData: ServiceData) => {
    const response = await api.post("/superadmin/services", serviceData);
    return response.data;
  },

  updateService: async (id: string, updateData: ServiceUpdateData) => {
    const response = await api.put(`/superadmin/services/${id}`, updateData);
    return response.data;
  },

  bulkUpdateServices: async (updates: Array<{ serviceId: string; price: number; originalPrice?: number }>) => {
    const response = await api.post("/superadmin/services/bulk-update", { updates });
    return response.data;
  },

  deleteService: async (id: string) => {
    const response = await api.delete(`/superadmin/services/${id}`);
    return response.data;
  },

  toggleServiceStatus: async (id: string) => {
    const response = await api.patch(`/superadmin/services/${id}/toggle-status`);
    return response.data;
  },

};

export default api;
