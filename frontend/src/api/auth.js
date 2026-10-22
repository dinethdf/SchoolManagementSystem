/**
 * Authentication API Functions
 * 
 * This file contains all the functions that communicate with the
 * backend's authentication endpoints. Each function is responsible
 * for exactly ONE API call.
 * 
 * We import 'axiosInstance' (our configured Axios) so that the
 * JWT token is automatically added to every request header.
 * 
 * ENDPOINTS USED:
 *  - POST /api/auth/login/       → Log in with username + password
 *  - POST /api/auth/register/    → Create a new user account
 *  - GET  /api/auth/me/          → Get the current logged-in user's info
 *  - POST /api/auth/token/refresh/ → Get a new access token (done by axiosInstance automatically)
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// LOGIN USER
// Sends the user's email/username and password to the backend.
// If correct, the backend returns a JWT access token and refresh token.
// ============================================================
export async function loginUser(loginCredentials) {
  // loginCredentials should be an object like: { username: '...', password: '...' }
  const apiResponse = await axiosInstance.post(API_ROUTES.AUTH_LOGIN, loginCredentials);

  // The backend returns: { access: '...token...', refresh: '...token...' }
  return apiResponse.data;
}

// ============================================================
// REGISTER USER
// Sends new user information to the backend to create an account.
// ============================================================
export async function registerUser(registrationData) {
  // registrationData should include: username, email, password, confirm_password, role, etc.
  const apiResponse = await axiosInstance.post(API_ROUTES.AUTH_REGISTER, registrationData);

  // The backend returns the newly created user object
  return apiResponse.data;
}

// ============================================================
// GET CURRENT USER
// Fetches the profile of whoever is currently logged in.
// The axiosInstance automatically adds the JWT token, so the backend
// knows which user is asking.
// ============================================================
export async function getCurrentUser() {
  const apiResponse = await axiosInstance.get(API_ROUTES.AUTH_ME);

  // The backend returns the user's profile data (id, username, email, role, etc.)
  return apiResponse.data;
}
