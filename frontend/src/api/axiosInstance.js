/**
 * Axios Instance Configuration
 * 
 * Pre-configured Axios client with baseURL, headers, request interceptors (JWT injection),
 * and response interceptors (401 token refresh/handling).
 */
import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// Read the API base URL from the .env file (VITE_API_BASE_URL=http://127.0.0.1:8000)
// If the env variable is not set, fall back to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create a customized Axios instance with default settings
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// Adds the JWT access token to Authorization header before each request.
// ============================================================
axiosInstance.interceptors.request.use(
  function (requestConfig) {
    const accessTokenFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

    // Validate token exists and is not literal string 'undefined' or 'null'
    if (
      accessTokenFromStorage &&
      accessTokenFromStorage !== 'undefined' &&
      accessTokenFromStorage !== 'null'
    ) {
      requestConfig.headers['Authorization'] = 'Bearer ' + accessTokenFromStorage;
    }

    return requestConfig;
  },
  function (requestError) {
    return Promise.reject(requestError);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// Handles 401 token expiration and auto-refreshes using refresh token.
// ============================================================
axiosInstance.interceptors.response.use(
  function (successResponse) {
    return successResponse;
  },
  async function (errorResponse) {
    const originalRequest = errorResponse.config;

    // Do NOT intercept 401 on login or token refresh endpoints
    const requestUrl = originalRequest && originalRequest.url ? originalRequest.url : '';
    const isAuthEndpoint =
      requestUrl.includes('/api/auth/login/') ||
      requestUrl.includes('/api/auth/token/refresh/');

    if (isAuthEndpoint) {
      return Promise.reject(errorResponse);
    }

    // Check if error is 401 and not already retried
    const isUnauthorized = errorResponse.response && errorResponse.response.status === 401;
    const hasNotBeenRetried = originalRequest && !originalRequest._hasBeenRetried;

    if (isUnauthorized && hasNotBeenRetried) {
      originalRequest._hasBeenRetried = true;

      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken && refreshToken !== 'undefined' && refreshToken !== 'null') {
        try {
          // Attempt to refresh the access token
          const tokenRefreshResponse = await axios.post(
            API_BASE_URL + '/api/auth/token/refresh/',
            { refresh: refreshToken }
          );

          const newAccessToken =
            tokenRefreshResponse.data.access || tokenRefreshResponse.data.access_token;

          if (newAccessToken) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed. Clearing session.');
          localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(errorResponse);
  }
);

export default axiosInstance;
