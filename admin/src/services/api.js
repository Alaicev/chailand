import axios from 'axios';

const API_URL = 'http://localhost:5070/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Методы API
export const authAPI = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (userData) => api.post('/users/register', userData),
  verifyToken: () => api.get('/users/verify'),
  getProfile: () => api.get('/users/profile'),
};

export const prizeAPI = {
  getAll: () => api.get('/prizes'),
  getById: (id) => api.get(`/prizes/${id}`),
  create: (prizeData) => api.post('/prizes', prizeData),
  update: (id, prizeData) => api.put(`/prizes/${id}`, prizeData),
  delete: (id) => api.delete(`/prizes/${id}`),
  search: (query) => api.get(`/prizes/search?query=${query}`),
};

export const packetAPI = {
  getAll: () => api.get('/packets'),
  getById: (id) => api.get(`/packets/${id}`),
  create: (packetData) => api.post('/packets', packetData),
  update: (id, packetData) => api.put(`/packets/${id}`, packetData),
  delete: (id) => api.delete(`/packets/${id}`),
};

export const imageAPI = {
  upload: (formData) => api.post('/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAll: () => api.get('/images'),
  delete: (id) => api.delete(`/images/${id}`),
};

export const galleryAPI = {
  getAll: (center) => api.get(`/gallery${center ? `?center=${encodeURIComponent(center)}` : ''}`),
  getCenters: () => api.get('/gallery/centers'),
  getStats: () => api.get('/gallery/stats'),
  getPaginated: (page = 1, limit = 12, center) => 
    api.get(`/gallery/paginated?page=${page}&limit=${limit}${center ? `&center=${encodeURIComponent(center)}` : ''}`),
  getById: (id) => api.get(`/gallery/${id}`),
  upload: (formData) => api.post('/gallery/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, imageData) => api.put(`/gallery/${id}`, imageData),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (email, password) => api.post('/users/login', { email, password }),
  verifyToken: () => api.get('/users/verify'),
  getProfile: () => api.get('/users/profile'),
  getAll: () => api.get('/users/all'), // Нужно создать на бэкенде
  getById: (id) => api.get(`/users/${id}`), // Нужно создать на бэкенде
  updateUser: (id, userData) => api.put(`/users/update/${id}`, userData),
  activateUser: (userId) => api.put(`/users/activate/${userId}`),
  deleteUser: (id) => api.delete(`/users/delete/${id}`),
};
export const messageAPI = {
  create: (data) => api.post('/messages', data),
  getAll: (params) => api.get('/messages', { params }),
  getStats: () => api.get('/messages/stats'),
  getUnreadCount: () => api.get('/messages/unread-count'),
  getById: (id) => api.get(`/messages/${id}`),
  updateReadStatus: (id, is_read) => api.patch(`/messages/${id}/read-status`, { is_read }),
  markAllAsRead: () => api.post('/messages/mark-all-read'),
  update: (id, data) => api.put(`/messages/${id}`, data),
  delete: (id) => api.delete(`/messages/${id}`),
  getExel: (center) => api.post(`/messages/exel`, center),
};

export default {
  ...authAPI,
  ...prizeAPI,
  ...packetAPI,
  ...imageAPI,
  ...galleryAPI,
  ...userAPI,
  ...messageAPI,
};