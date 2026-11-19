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
// DEMO ACCOUNTS (For Quick Login & Testing)
// Pre-configured accounts for testing each role during
// viva presentations and development without backend seeders.
// ============================================================
export const DEMO_ACCOUNTS = {
  [USER_ROLES.ADMIN]: {
    id: 1,
    role: USER_ROLES.ADMIN,
    username: 'admin',
    password: 'adminpassword123',
    email: 'admin@school.edu',
    first_name: 'System',
    last_name: 'Administrator',
    title: 'Administrator',
    description: 'Full system management and controls',
    badgeColor: 'indigo',
    dashboardRoute: '/admin',
  },
  [USER_ROLES.TEACHER]: {
    id: 2,
    role: USER_ROLES.TEACHER,
    username: 'teacher_sarah',
    password: 'teacherpassword123',
    email: 'sarah.teacher@school.edu',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    title: 'Teacher',
    description: 'Mark attendance and grade assessments',
    badgeColor: 'emerald',
    dashboardRoute: '/teacher',
  },
  [USER_ROLES.STUDENT]: {
    id: 3,
    role: USER_ROLES.STUDENT,
    username: 'student_alex',
    password: 'studentpassword123',
    email: 'alex.student@school.edu',
    first_name: 'Alex',
    last_name: 'Morgan',
    title: 'Student',
    description: 'View daily classes and report cards',
    badgeColor: 'blue',
    dashboardRoute: '/student',
  },
  [USER_ROLES.PARENT]: {
    id: 4,
    role: USER_ROLES.PARENT,
    username: 'parent_john',
    password: 'parentpassword123',
    email: 'john.parent@school.edu',
    first_name: 'John',
    last_name: 'Morgan',
    title: 'Parent',
    description: 'Monitor child attendance and grades',
    badgeColor: 'purple',
    dashboardRoute: '/parent',
  },
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
  ASSIGNMENTS: '/api/assignments/',
};

// ============================================================
// ASSIGNMENT STATUSES & TYPES
// Standard choices matching the backend choices
// ============================================================
export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  LATE: 'late',
  GRADED: 'graded',
};

export const ASSIGNMENT_TYPES = {
  HOMEWORK: 'homework',
  CLASSWORK: 'classwork',
  PROJECT: 'project',
};
