import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api';

const BACKEND_WAKE_KEY = 'raiz_backend_wake';
const BACKEND_WAKE_TIME = 5 * 60 * 1000; // 5 minutes

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Separate client for health check.
// This prevents the health request from triggering itself.
const healthClient = axios.create({
  baseURL,
  timeout: 30000,
});

let backendWakePromise = null;

export async function wakeBackend(force = false) {
  try {
    // Reuse recent successful wake-up
    if (!force) {
      const stored = sessionStorage.getItem(
        BACKEND_WAKE_KEY
      );

      if (stored) {
        const timestamp = Number(stored);

        if (
          !Number.isNaN(timestamp) &&
          Date.now() - timestamp < BACKEND_WAKE_TIME
        ) {
          return true;
        }
      }
    }

    // If another request is already waking Render,
    // wait for the same request instead of sending another.
    if (backendWakePromise) {
      return backendWakePromise;
    }

    backendWakePromise = healthClient
      .get('/health')
      .then(() => {
        sessionStorage.setItem(
          BACKEND_WAKE_KEY,
          String(Date.now())
        );

        return true;
      })
      .finally(() => {
        backendWakePromise = null;
      });

    return await backendWakePromise;
  } catch (error) {
    backendWakePromise = null;
    sessionStorage.removeItem(BACKEND_WAKE_KEY);

    throw {
      status: 0,
      message:
        'Unable to connect to the CRM server. Please try again.',
    };
  }
}

axiosClient.interceptors.request.use(
  async (config) => {
    const url = config.url || '';

    const isHealthRequest =
      url.includes('/health');

    const isLoginRequest =
      url.includes('/auth/login');

    // Login and health are handled separately.
    // Every other API request automatically wakes Render first.
    if (!isHealthRequest && !isLoginRequest) {
      try {
        await wakeBackend();
      } catch (error) {
        return Promise.reject(error);
      }
    }

    const token =
      localStorage.getItem('raiz_token');

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
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

      let message =
        'An unexpected error occurred.';

      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        }
      }

      const isLoginRequest =
        error.config?.url?.includes(
          '/auth/login'
        );

      switch (status) {
        case 400:
          message =
            message ||
            'Invalid request. Please check your input.';
          break;

        case 401:
          if (isLoginRequest) {
            message =
              'Invalid email or password.';
          } else {
            message =
              'Your session has expired. Please log in again.';

            localStorage.removeItem(
              'raiz_token'
            );

            localStorage.removeItem(
              'raiz_user'
            );

            if (
              window.location.pathname !==
              '/login'
            ) {
              window.location.href =
                '/login';
            }
          }
          break;

        case 403:
          message =
            'You do not have permission to perform this action.';
          break;

        case 404:
          message =
            message ||
            'The requested resource was not found.';
          break;

        case 409:
          message =
            message ||
            'A conflict occurred with the existing resource.';
          break;

        case 500:
          message =
            'A server error occurred. Please try again later.';
          break;

        default:
          message =
            message ||
            'An unexpected error occurred.';
      }

      return Promise.reject({
        status,
        message,
        data,
      });
    }

    if (error.request) {
      return Promise.reject({
        status: 0,
        message:
          'Unable to connect to the server. Please try again.',
      });
    }

    return Promise.reject({
      status: 0,
      message:
        error.message ||
        'An unexpected error occurred.',
    });
  }
);

export default axiosClient;