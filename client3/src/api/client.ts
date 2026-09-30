import axios from 'axios';

function resolveApiBaseUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && envUrl !== '/api') {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('VITE_API_URL') || localStorage.getItem('API_BASE_URL');
    if (saved && saved.trim() !== '') {
      return saved.replace(/\/+$/, '');
    }

    // If deployed on Render static frontend, automatically point to backend service
    if (window.location.hostname.endsWith('.onrender.com')) {
      return 'https://metrologix-backend.onrender.com/api';
    }
  }

  return '/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
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
