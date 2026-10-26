/**
 * Attendance System API Service
 *
 * Provides API functions to communicate with the Django attendance endpoints:
 * - Teacher/Admin:
 *   - POST   /api/attendance/bulk/                    -> Bulk mark attendance for a class
 *   - GET    /api/attendance/class/<id>/?date=        -> View class attendance for a date
 *   - GET    /api/attendance/student/<id>/            -> Student attendance history (teacher/admin view)
 *   - GET    /api/attendance/student/<id>/summary/    -> Student attendance % summary (teacher/admin view)
 * - Student:
 *   - GET    /api/attendance/my-attendance/           -> Own attendance history
 *   - GET    /api/attendance/my-attendance/summary/   -> Own attendance % summary
 * - Parent:
 *   - GET    /api/attendance/my-children/             -> All children's attendance
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

const BASE = API_ROUTES.ATTENDANCE; // '/api/attendance/'

// ============================================================
// TEACHER / ADMIN ENDPOINTS
// ============================================================

/**
 * Bulk mark attendance for all students in a class
 * @param {Object} payload - { school_class: number, date: 'YYYY-MM-DD', subject?: number, attendance_list: Array<{student: number, status: string, remarks?: string}> }
 * @returns {Promise<Object>} { success, message, records_saved, errors }
 */
export async function bulkMarkAttendance(payload) {
  const response = await axiosInstance.post(`${BASE}bulk/`, payload);
  return response.data;
}

/**
 * Fetch attendance records for a specific class on a specific date
 * @param {number|string} classId - School class ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Object>} { success, class_name, date, total_records, attendance: [...] }
 */
export async function fetchClassAttendance(classId, date) {
  const response = await axiosInstance.get(`${BASE}class/${classId}/`, {
    params: { date },
  });
  return response.data;
}

/**
 * Fetch full attendance history for a specific student (teacher/admin view)
 * @param {number|string} studentId - Student profile ID
 * @returns {Promise<Object>} { success, student_name, student_admission_number, total_records, attendance: [...] }
 */
export async function fetchStudentAttendanceHistory(studentId) {
  const response = await axiosInstance.get(`${BASE}student/${studentId}/`);
  return response.data;
}

/**
 * Fetch attendance percentage summary for a specific student (teacher/admin view)
 * @param {number|string} studentId - Student profile ID
 * @returns {Promise<Object>} { success, summary: { total_days, present_days, absent_days, late_days, excused_days, attendance_percentage, student_name, student_admission_number } }
 */
export async function fetchStudentAttendanceSummary(studentId) {
  const response = await axiosInstance.get(`${BASE}student/${studentId}/summary/`);
  return response.data;
}

// ============================================================
// STUDENT ENDPOINTS (Own Data Only)
// ============================================================

/**
 * Fetch the currently logged-in student's own full attendance history
 * @returns {Promise<Object>} { success, total_records, attendance: [...] }
 */
export async function fetchMyAttendance() {
  const response = await axiosInstance.get(`${BASE}my-attendance/`);
  return response.data;
}

/**
 * Fetch the currently logged-in student's own attendance percentage summary
 * @returns {Promise<Object>} { success, summary: { total_days, present_days, absent_days, late_days, excused_days, attendance_percentage } }
 */
export async function fetchMyAttendanceSummary() {
  const response = await axiosInstance.get(`${BASE}my-attendance/summary/`);
  return response.data;
}

// ============================================================
// PARENT ENDPOINTS (Children's Data)
// ============================================================

/**
 * Fetch attendance records for all children linked to the current parent
 * @returns {Promise<Object>} { success, total_children, children: [{ student_id, student_name, admission_number, class_name, summary, attendance: [...] }] }
 */
export async function fetchMyChildrenAttendance() {
  const response = await axiosInstance.get(`${BASE}my-children/`);
  return response.data;
}