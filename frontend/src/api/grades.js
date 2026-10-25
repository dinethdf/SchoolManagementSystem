/**
 * Grades & Assessments API Service
 * 
 * Provides API functions to interact with the Django grades endpoints:
 * - GET  /api/grades/assessments/                    -> List all assessments
 * - POST /api/grades/assessments/                    -> Create a new assessment
 * - GET  /api/grades/assessments/<id>/               -> Get assessment details
 * - POST /api/grades/records/bulk/                   -> Bulk enter student marks
 * - GET  /api/grades/student/<student_id>/           -> Student grade history (Teacher/Admin)
 * - GET  /api/grades/student/<student_id>/report-card/ -> Student report card (Teacher/Admin)
 * - GET  /api/grades/my-grades/                      -> Logged-in student grades
 * - GET  /api/grades/my-report-card/                 -> Logged-in student report card
 * - GET  /api/grades/my-children-grades/             -> Parent's children report cards
 */

import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// FETCH ALL ASSESSMENTS (Teacher / Admin)
// Retrieves all tests, midterms, quizzes, and assignments
// ============================================================
export async function fetchAssessments() {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.GRADES}assessments/`);
  return apiResponse.data;
}

// ============================================================
// CREATE A NEW ASSESSMENT (Teacher / Admin)
// Creates an assessment record (name, type, subject, class, max_marks, date, academic_year)
// ============================================================
export async function createAssessment(assessmentData) {
  const apiResponse = await axiosInstance.post(
    `${API_ROUTES.GRADES}assessments/`,
    assessmentData
  );
  return apiResponse.data;
}

// ============================================================
// FETCH SINGLE ASSESSMENT BY ID (Teacher / Admin)
// ============================================================
export async function fetchAssessmentById(assessmentId) {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}assessments/${assessmentId}/`
  );
  return apiResponse.data;
}

// ============================================================
// BULK ENTER MARKS FOR AN ASSESSMENT (Teacher / Admin)
// Submits marks for all students in an assessment at once
// ============================================================
export async function bulkEnterGrades(bulkGradeData) {
  // Expected: { assessment: assessmentId, grade_list: [ { student: id, marks_obtained: num, remarks: '' } ] }
  const apiResponse = await axiosInstance.post(
    `${API_ROUTES.GRADES}records/bulk/`,
    bulkGradeData
  );
  return apiResponse.data;
}

// ============================================================
// FETCH STUDENT GRADE HISTORY (Teacher / Admin)
// Retrieves all grade records scored by a specific student
// ============================================================
export async function fetchStudentGradeHistory(studentId) {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}student/${studentId}/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH STUDENT REPORT CARD (Teacher / Admin)
// Retrieves full report card with subject averages and GPA for a specific student
// ============================================================
export async function fetchStudentReportCard(studentId) {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}student/${studentId}/report-card/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY GRADES (Student)
// Retrieves all personal marks scored by the logged-in student
// ============================================================
export async function fetchMyGrades() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}my-grades/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY REPORT CARD (Student)
// Retrieves full personal report card for the logged-in student
// ============================================================
export async function fetchMyReportCard() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}my-report-card/`
  );
  return apiResponse.data;
}

// ============================================================
// FETCH MY CHILDREN GRADES (Parent)
// Retrieves report cards and assessment records for all linked children
// ============================================================
export async function fetchMyChildrenGrades() {
  const apiResponse = await axiosInstance.get(
    `${API_ROUTES.GRADES}my-children-grades/`
  );
  return apiResponse.data;
}
