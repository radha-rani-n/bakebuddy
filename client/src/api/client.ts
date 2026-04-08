import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            (import.meta.env.VITE_API_URL || '/api') + '/auth/refresh',
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );
          localStorage.setItem('access_token', data.session.access_token);
          localStorage.setItem('refresh_token', data.session.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh failed — clear and redirect
        }
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
