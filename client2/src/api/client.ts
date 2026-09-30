import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('metrologix_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not on login page, redirect
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('metrologix_token');
        localStorage.removeItem('metrologix_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
