import axios from 'axios';
import { logout, authSuccess } from '../store/slices/authSlice';
import { store } from '../store';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send HttpOnly refresh token cookie
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Silent token refresh on 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint (sends HttpOnly cookie automatically)
        const refreshResponse = await axios.post('/api/v1/auth/refresh', {}, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data.data.accessToken;

        // Update store with new token
        const currentState = store.getState().auth;
        store.dispatch(authSuccess({
          user: currentState.user,
          school: currentState.school,
          token: newAccessToken,
        }));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
