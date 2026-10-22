/**
 * User Management API Service
 * 
 * Provides API functions for administrative account management:
 * - Registering new users
 * - Updating current user profile
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// CREATE / REGISTER NEW USER
// Admin endpoint to create user accounts
// ============================================================
export async function createUser(userData) {
  const apiResponse = await axiosInstance.post(API_ROUTES.AUTH_REGISTER, userData);
  return apiResponse.data;
}

// ============================================================
// UPDATE CURRENT LOGGED IN USER PROFILE
// Updates user personal details (first_name, last_name, phone_number, etc.)
// ============================================================
export async function updateCurrentUserProfile(profileData) {
  const apiResponse = await axiosInstance.patch(API_ROUTES.AUTH_ME, profileData);
  return apiResponse.data;
}
