/**
 * People Profiles API Service (Students, Teachers, Parents)
 * 
 * Provides API functions to communicate with the Django people endpoints:
 * - Students:
 *   - GET  /api/people/students/           -> List all student profiles (Admin & Teacher)
 *   - POST /api/people/students/           -> Enroll a new student (Admin)
 *   - GET  /api/people/students/<id>/      -> Get student details
 *   - GET  /api/people/students/me/        -> Get logged-in student's own profile
 * 
 * - Teachers:
 *   - GET  /api/people/teachers/           -> List all teachers
 *   - POST /api/people/teachers/           -> Add teacher profile
 *   - GET  /api/people/teachers/<id>/      -> Get teacher details
 * 
 * - Parents:
 *   - GET  /api/people/parents/            -> List all parents
 *   - GET  /api/people/parents/my-children/ -> Get logged-in parent's linked children
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// STUDENTS API
// ============================================================

// Fetch list of all student profiles (with class and user info)
export async function fetchStudents() {
  const apiResponse = await axiosInstance.get(API_ROUTES.STUDENTS);
  return apiResponse.data;
}

// Fetch a single student's profile by ID
export async function fetchStudentById(studentId) {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.STUDENTS}${studentId}/`);
  return apiResponse.data;
}

// Fetch the currently logged-in student's own profile
export async function fetchMyStudentProfile() {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.STUDENTS}me/`);
  return apiResponse.data;
}

// Enroll / create a new student profile
export async function createStudent(studentData) {
  const apiResponse = await axiosInstance.post(API_ROUTES.STUDENTS, studentData);
  return apiResponse.data;
}

// ============================================================
// TEACHERS API
// ============================================================

// Fetch list of all teacher profiles
export async function fetchTeachers() {
  const apiResponse = await axiosInstance.get(API_ROUTES.TEACHERS);
  return apiResponse.data;
}

// Fetch a single teacher's profile by ID
export async function fetchTeacherById(teacherId) {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.TEACHERS}${teacherId}/`);
  return apiResponse.data;
}

// Create a new teacher profile (Admin only)
// Expects: { user_id, employee_id, qualification?, joining_date?, department?, specialization? }
export async function createTeacher(teacherData) {
  const apiResponse = await axiosInstance.post(API_ROUTES.TEACHERS, teacherData);
  return apiResponse.data;
}

// ============================================================
// PARENTS API
// ============================================================

// Fetch list of all parent profiles
export async function fetchParents() {
  const apiResponse = await axiosInstance.get(API_ROUTES.PARENTS);
  return apiResponse.data;
}

// Fetch children linked to the currently logged-in parent
export async function fetchMyChildren() {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.PARENTS}my-children/`);
  return apiResponse.data;
}
