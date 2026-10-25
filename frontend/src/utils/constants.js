/**
 * Application-wide Constants
 * 
 * This file stores all the constant values used throughout the app.
 * By keeping them here in one place, we avoid "magic values" scattered
 * across different files. If we need to change a value, we only change it here.
 */

// ============================================================
// USER ROLES
// These are the exact role strings that come from the backend API.
// Django stores roles as lowercase ('admin', 'teacher', etc.)
// ============================================================
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

// ============================================================
// LOCAL STORAGE KEYS
// Keys used to store data in the browser's localStorage.
// We use constants so we never accidentally misspell a key name.
// ============================================================
export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'sms_access_token',
  REFRESH_TOKEN: 'sms_refresh_token',
  USER_DATA: 'sms_user_data',
};

// ============================================================
// API ROUTE PREFIXES
// Base path segments used by the API functions.
// The full URL is: VITE_API_BASE_URL + API_ROUTES.something
// ============================================================
export const API_ROUTES = {
  AUTH_LOGIN: '/api/auth/login/',
  AUTH_REGISTER: '/api/auth/register/',
  AUTH_REFRESH: '/api/auth/token/refresh/',
  AUTH_ME: '/api/auth/me/',
  CLASSES: '/api/academics/classes/',
  SUBJECTS: '/api/academics/subjects/',
  STUDENTS: '/api/people/students/',
  TEACHERS: '/api/people/teachers/',
  PARENTS: '/api/people/parents/',
  ATTENDANCE: '/api/attendance/',
  GRADES: '/api/grades/',
};
