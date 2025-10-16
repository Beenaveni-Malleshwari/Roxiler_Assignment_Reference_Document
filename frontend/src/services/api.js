import axios from 'axios';

// Prefer environment variable set in frontend/.env, otherwise fallback to the known deployed backend
const DEFAULT_REMOTE = 'https://roxiler-systems-backend-bu80.onrender.com/api';
const API_BASE_URL = process.env.REACT_APP_API_URL || DEFAULT_REMOTE;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10s timeout to fail fast when backend is down
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response indicates a network/CORS/connection problem
    if (!error.response) {
      console.error('API network or CORS error:', error);
      const networkError = new Error(`Unable to reach server at ${API_BASE_URL}. Please ensure the backend is reachable.`);
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  updatePassword: (passwordData) => api.patch('/auth/update-password', passwordData),
};

export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  addUser: (userData) => api.post('/admin/users', userData),
  getStores: (params) => api.get('/admin/stores', { params }),
  addStore: (storeData) => api.post('/admin/stores', storeData),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
};

export const userAPI = {
  getStores: (search) => api.get('/user/stores', { params: { search } }),
  submitRating: (ratingData) => api.post('/user/ratings', ratingData),
  updateRating: (storeId, rating) => api.patch(`/user/ratings/${storeId}`, { rating }),
};

export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
};

export default api;