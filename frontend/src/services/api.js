import axios from 'axios';

// Use your deployed backend URL directly
const API_BASE_URL = 'https://roxiler-systems-frontend-tp8k.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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