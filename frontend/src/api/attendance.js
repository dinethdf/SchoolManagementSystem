/**
 * Attendance API Service
 * 
 * Provides API functions to interact with the Django attendance endpoints:
 * - POST /api/attendance/bulk/                          -> Bulk mark attendance for a class
 * - GET  /api/attendance/class/<class_id>/?date=YYYY-MM-DD -> Get class attendance records
 * - GET  /api/attendance/student/<student_id>/          -> Student attendance history (Teacher/Admin)
 * - GET  /api/attendance/student/<student_id>/summary/  -> Student attendance summary (Teacher/Admin)
 * - GET  /api/attendance/my-attendance/                 -> Logged-in student attendance history
 * - GET  /api/attendance/my-attendance/summary/         -> Logged-in student attendance summary
 * - GET  /api/attendance/my-children/                   -> Parent's children attendance
 */

import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// BULK MARK ATTENDANCE (Teacher / Admin)
// Submits attendance statuses for all students in a class for a specific date
// ============================================================
export async function bulkMarkAttendance(attendanceSubmissionData) {
  // Post data: { school_class, date, subject (optional), attendance_list: [...] }
  const apiResponse = await axiosInstance.post(
    `${API_ROUTES.ATTENDANCE}bulk/`,
    attendanceSubmissionData
  );
  return apiResponse.data;
}

// ============================================================
// FETCH CLASS ATTENDANCE BY DATE (Teacher / Admin)
// Retrieves attendance records for a class on a specific date
// ============================================================
export async function fetchClassAttendance(classId, selectedDateString) {
  let requestUrl = `${API_ROUTES.ATTENDANCE}class/${classId}/`;
  if (selectedDateString) {
    requestUrl = `${requestUrl}?date=${selectedDateString}`;
  }
  const apiResponse = await axiosInstance.get(requestUrl);
  return apiResponse.data;
}

// ============================================================
// FETCH STUDENT ATTENDANCE HISTORY (Teacher / Admin)
// Retrieves full attendance history for a single student
// ============================================================
export async function fetchStudentAttendanceHistory(studentId) {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.ATTENDANCE}student/${studentId}/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH STUDENT ATTENDANCE SUMMARY (Teacher / Admin)
// Retrieves percentage and status counts for a single student
// ============================================================
export async function fetchStudentAttendanceSummary(studentId) {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.ATTENDANCE}student/${studentId}/summary/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY ATTENDANCE HISTORY (Student)
// Retrieves the logged-in student's personal attendance history
// ============================================================
export async function fetchMyAttendance() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.ATTENDANCE}my-attendance/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY ATTENDANCE SUMMARY (Student)
// Retrieves the logged-in student's percentage and attendance counts
// ============================================================
export async function fetchMyAttendanceSummary() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.ATTENDANCE}my-attendance/summary/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY CHILDREN ATTENDANCE (Parent)
// Retrieves attendance summaries and logs for all children of logged-in parent
// ============================================================
export async function fetchMyChildrenAttendance() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.ATTENDANCE}my-children/`
  );
  return apiResponse.data;
}
