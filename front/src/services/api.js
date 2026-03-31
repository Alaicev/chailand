import axios from 'axios';

const API_URL = 'http://localhost:5070/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const prizeAPI = {
  getAll: () => api.get('/prizes'),
  getById: (id) => api.get(`/prizes/${id}`),
  search: (query) => api.get(`/prizes/search?query=${query}`),
};

export const packetAPI = {
  getAll: () => api.get('/packets'),
  getById: (id) => api.get(`/packets/${id}`),
};

export const imageAPI = {
  getAll: () => api.get('/images'),
};

export const galleryAPI = {
  getAll: (center) => api.get(`/gallery${center ? `?center=${encodeURIComponent(center)}` : ''}`),
  getCenters: () => api.get('/gallery/centers'),
  getStats: () => api.get('/gallery/stats'),
  getPaginated: (page = 1, limit = 12, center) => 
    api.get(`/gallery/paginated?page=${page}&limit=${limit}${center ? `&center=${encodeURIComponent(center)}` : ''}`),
  getById: (id) => api.get(`/gallery/${id}`),
};

export const messageAPI = {
  create: (data) => api.post('/messages', data),
};



export default {
  ...galleryAPI,
  ...prizeAPI,
  ...packetAPI,
  ...imageAPI,
  ...messageAPI,
};