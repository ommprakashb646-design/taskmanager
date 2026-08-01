import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
client.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// If access token expired (401), try to refresh it once, then retry the request
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/login/refresh/`, { refresh });
          localStorage.setItem('access', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return client(originalRequest);
        } catch  {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;