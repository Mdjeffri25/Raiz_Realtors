import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raiz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      let message = 'An unexpected error occurred.';

      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      }

      const isLoginRequest = error.config?.url?.includes('/auth/login');

      switch (status) {
        case 400:
          message = message || 'Invalid request. Please check your input.';
          break;
        case 401:
          if (isLoginRequest) {
            message = 'Invalid email or password.';
          } else {
            message = 'Your session has expired. Please log in again.';
            localStorage.removeItem('raiz_token');
            localStorage.removeItem('raiz_user');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = message || 'The requested resource was not found.';
          break;
        case 409:
          message = message || 'A conflict occurred with the existing resource.';
          break;
        case 500:
          message = 'A server error occurred. Please try again later.';
          break;
        default:
          message = message || 'An unexpected error occurred.';
      }

      return Promise.reject({ status, message, data });
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Unable to connect to the server. Please check your connection.',
      });
    }

    return Promise.reject({ status: 0, message: error.message || 'An unexpected error occurred.' });
  }
);

export default axiosClient;
