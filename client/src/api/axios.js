import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000, // OPTIMIZATION: 15s timeout to prevent UI hanging on stalled connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (can be used for performance tracking)
api.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Optional: Log slow requests in development
    if (import.meta.env.DEV) {
        const duration = Date.now() - response.config.metadata.startTime;
        if (duration > 1000) console.warn(`[API PERF] ${response.config.method.toUpperCase()} ${response.config.url} took ${duration}ms`);
    }
    return response;
  },
  (error) => {
    // 401 Handling: Only redirect if we AREN'T currently in an auth flow or landing
    const isPublicPath = ['/', '/login', '/register'].includes(window.location.pathname);
    if (error.response?.status === 401 && !isPublicPath) {
      window.location.href = '/login';
    }
    
    // Handle Timeouts specifically
    if (error.code === 'ECONNABORTED') {
        console.error('Request timed out. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;
