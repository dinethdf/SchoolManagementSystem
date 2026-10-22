/**
 * Axios Instance Configuration
 * 
 * This file creates a customized version of Axios (the HTTP library we use
 * to talk to the backend). Instead of writing the base URL and JWT token
 * in every single API call, we configure it ONCE here and reuse it everywhere.
 * 
 * KEY FEATURES:
 * 1. baseURL — Every request automatically uses http://127.0.0.1:8000 as the base.
 *    So instead of writing 'http://127.0.0.1:8000/api/auth/login/', we just write '/api/auth/login/'.
 * 
 * 2. Request Interceptor — Before EVERY request is sent, it automatically adds
 *    the JWT access token in the Authorization header. So the backend knows who we are.
 * 
 * 3. Response Interceptor — If the backend returns a 401 (Unauthorized) error,
 *    it means our access token has expired. This interceptor automatically tries
 *    to get a new access token using the refresh token, then retries the original request.
 *    If the refresh also fails, it logs the user out.
 */
import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// Read the API base URL from the .env file (VITE_API_BASE_URL=http://127.0.0.1:8000)
// If the env variable is not set, fall back to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create a customized Axios instance with our default settings
const axiosInstance = axios.create({
  // Every request will automatically have this as the base URL
  baseURL: API_BASE_URL,

  // We tell the backend we are sending JSON data
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// This runs BEFORE every request is sent to the backend.
// It adds the JWT access token to the Authorization header.
// This is how the backend knows which user is making the request.
// ============================================================
axiosInstance.interceptors.request.use(
  function (requestConfig) {
    // Read the access token from localStorage
    const accessTokenFromStorage = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

    // If we have a token, add it to the Authorization header
    if (accessTokenFromStorage) {
      // The backend expects the format: "Bearer <token>"
      requestConfig.headers['Authorization'] = 'Bearer ' + accessTokenFromStorage;
    }

    // Return the modified config so the request continues
    return requestConfig;
  },
  function (requestError) {
    // If there was an error setting up the request, reject it
    return Promise.reject(requestError);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// This runs AFTER the backend sends a response.
// If the response is a 401 (token expired), we try to refresh the token.
// If refreshing also fails, we clear everything and redirect to login.
// ============================================================
axiosInstance.interceptors.response.use(
  function (successResponse) {
    // If the response was successful (200-299), just return it as-is
    return successResponse;
  },
  async function (errorResponse) {
    // Get details about the failed request
    const originalRequest = errorResponse.config;

    // Check if the error was 401 (Unauthorized = token expired)
    // and that we haven't already tried to retry this request (to avoid infinite loops)
    const isUnauthorizedError = errorResponse.response && errorResponse.response.status === 401;
    const hasNotBeenRetried = !originalRequest._hasBeenRetried;

    if (isUnauthorizedError && hasNotBeenRetried) {
      // Mark this request so we don't retry it again
      originalRequest._hasBeenRetried = true;

      // Read the refresh token from localStorage
      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          // Try to get a new access token from the backend
          // We use axios directly here (not axiosInstance) to avoid interceptor loops
          const tokenRefreshResponse = await axios.post(
            API_BASE_URL + '/api/auth/token/refresh/',
            { refresh: refreshToken }
          );

          // Get the new access token from the response
          const newAccessToken = tokenRefreshResponse.data.access;

          // Save the new access token to localStorage
          localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

          // Update the Authorization header on the original failed request
          originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

          // Retry the original request with the new token
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If the refresh also failed, the user's session is truly expired.
          // Clear all stored auth data and redirect to the login page.
          console.error('Token refresh failed. Logging user out.');
          localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

          // Redirect to login page
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available — redirect to login
        window.location.href = '/login';
      }
    }

    // If the error was NOT a 401, or if we already retried, just reject it
    // so the calling code can handle it with its own try/catch
    return Promise.reject(errorResponse);
  }
);

export default axiosInstance;
