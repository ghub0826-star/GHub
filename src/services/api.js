import axios from 'axios';

// Support both Vite (import.meta.env) and Create React App (process.env)
const BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_URL) 
  ? import.meta.env.VITE_API_URL 
  : (process.env.REACT_APP_API_URL || 'http://localhost:4000/api');

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: ensure Authorization header is always attached if token exists
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('ghub_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) { /* ignore */ }

  // PENTING: Jika body adalah FormData (upload file), hapus Content-Type yang ditetapkan
  // secara default. Browser/axios harus men-generate 'multipart/form-data; boundary=...'
  // secara otomatis. Jika Content-Type: application/json dibiarkan, multer tidak bisa
  // parse field file dan mengembalikan 400 No File.
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  return config;
}, (error) => Promise.reject(error));

// Response interceptor: auto-refresh token on 401 if refresh token is available
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('ghub_refresh_token');
        if (refresh) {
          const res = await axios.post(`${BASE}/auth/refresh`, { refreshToken: refresh });
          if (res.data && res.data.success && res.data.accessToken) {
            localStorage.setItem('ghub_access_token', res.data.accessToken);
            if (res.data.refreshToken) localStorage.setItem('ghub_refresh_token', res.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshErr) {
        try {
          localStorage.removeItem('ghub_access_token');
          localStorage.removeItem('ghub_refresh_token');
          localStorage.removeItem('ghub_user');
        } catch (e) { /* ignore */ }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
