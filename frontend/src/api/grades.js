/**
 * Grades & Results Management API Service
 *
 * Provides API functions to communicate with the Django grades endpoints:
 * - Teacher/Admin - Assessments:
 *   - GET    /api/grades/assessments/              -> List all assessments
 *   - POST   /api/grades/assessments/              -> Create a new assessment
 *   - GET    /api/grades/assessments/<id>/         -> Get assessment details
 * - Teacher/Admin - Grade Records:
 *   - POST   /api/grades/records/bulk/             -> Bulk enter grades for an assessment
 *   - GET    /api/grades/student/<id>/             -> Student grade history (teacher/admin view)
 *   - GET    /api/grades/student/<id>/report-card/ -> Student report card (teacher/admin view)
 * - Student:
 *   - GET    /api/grades/my-grades/                -> Own grades
 *   - GET    /api/grades/my-report-card/           -> Own report card with GPA
 * - Parent:
 *   - GET    /api/grades/my-children-grades/       -> All children's report cards
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

const BASE = API_ROUTES.GRADES; // '/api/grades/'

// ============================================================
// TEACHER / ADMIN - ASSESSMENTS
// ============================================================

/**
 * Fetch all assessments (newest first)
 * @returns {Promise<Object>} { success, total_count, assessments: [...] }
 */
export async function fetchAssessments() {
  const response = await axiosInstance.get(`${BASE}assessments/`);
  return response.data;
}

/**
 * Create a new assessment
 * @param {Object} data - { name, assessment_type, subject, school_class, max_marks, assessment_date, academic_year }
 * @returns {Promise<Object>} { success, message, assessment: {...} }
 */
export async function createAssessment(data) {
  const response = await axiosInstance.post(`${BASE}assessments/`, data);
  return response.data;
}

/**
 * Fetch details for a single assessment
 * @param {number|string} assessmentId - Assessment ID
 * @returns {Promise<Object>} { success, assessment: {...} }
 */
export async function fetchAssessmentById(assessmentId) {
  const response = await axiosInstance.get(`${BASE}assessments/${assessmentId}/`);
  return response.data;
}

// ============================================================
// TEACHER / ADMIN - GRADE RECORDS
// ============================================================

/**
 * Bulk enter marks for all students in an assessment
 * @param {Object} payload - { assessment: number, grade_list: Array<{student: number, marks_obtained: number, remarks?: string}> }
 * @returns {Promise<Object>} { success, message, records_saved, errors }
 */
export async function bulkEnterGrades(payload) {
  const response = await axiosInstance.post(`${BASE}records/bulk/`, payload);
  return response.data;
}

/**
 * Fetch all grade records for a specific student (teacher/admin view)
 * @param {number|string} studentId - Student profile ID
 * @returns {Promise<Object>} { success, student_name, total_records, grades: [...] }
 */
export async function fetchStudentGradeHistory(studentId) {
  const response = await axiosInstance.get(`${BASE}student/${studentId}/`);
  return response.data;
}

/**
 * Fetch full report card for a specific student (teacher/admin view)
 * @param {number|string} studentId - Student profile ID
 * @returns {Promise<Object>} { success, report_card: {...} }
 */
export async function fetchStudentReportCard(studentId) {
  const response = await axiosInstance.get(`${BASE}student/${studentId}/report-card/`);
  return response.data;
}

// ============================================================
// STUDENT ENDPOINTS (Own Data Only)
// ============================================================

/**
 * Fetch the currently logged-in student's own grade records
 * @returns {Promise<Object>} { success, total_records, grades: [...] }
 */
export async function fetchMyGrades() {
  const response = await axiosInstance.get(`${BASE}my-grades/`);
  return response.data;
}

/**
 * Fetch the currently logged-in student's own full report card with GPA
 * @returns {Promise<Object>} { success, report_card: {...} }
 */
export async function fetchMyReportCard() {
  const response = await axiosInstance.get(`${BASE}my-report-card/`);
  return response.data;
}

// ============================================================
// PARENT ENDPOINTS (Children's Data)
// ============================================================

/**
 * Fetch report cards for all children linked to the current parent
 * @returns {Promise<Object>} { success, total_children, children: [{ report_card data }] }
 */
export async function fetchMyChildrenGrades() {
  const response = await axiosInstance.get(`${BASE}my-children-grades/`);
  return response.data;
}