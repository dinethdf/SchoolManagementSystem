/**
 * Assignments & Homework Management API Client
 *
 * Provides API functions to communicate with the Django assignments endpoints:
 * - Teacher / Admin:
 *   - GET    /api/assignments/                          -> List all assignments
 *   - POST   /api/assignments/                          -> Create a new assignment
 *   - GET    /api/assignments/<id>/                     -> Get assignment details
 *   - PUT    /api/assignments/<id>/                     -> Update assignment details
 *   - DELETE /api/assignments/<id>/                     -> Archive / deactivate assignment
 *   - GET    /api/assignments/<id>/submissions/         -> List all student submissions for an assignment
 *   - POST   /api/assignments/<id>/grade/<submission>/  -> Grade student submission with marks & feedback
 * - Student:
 *   - GET    /api/assignments/my-assignments/           -> Get current student's homework & status
 *   - POST   /api/assignments/<id>/submit/              -> Submit written answer text
 * - Parent:
 *   - GET    /api/assignments/my-children/              -> Get all children's assignments & progress
 */

import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

const BASE_URL = API_ROUTES.ASSIGNMENTS; // '/api/assignments/'

// ==============================================================================
// 1. Teacher & Admin API Functions
// ==============================================================================

/**
 * Fetch all assignments with optional query filters.
 * @param {Object} queryParameters - Optional filters like { class_id, subject_id }
 * @returns {Promise<Object>} Response object containing { success, total_count, data: [...] }
 */
export async function fetchAssignments(queryParameters = {}) {
  const apiResponse = await axiosInstance.get(BASE_URL, {
    params: queryParameters,
  });
  return apiResponse.data;
}

/**
 * Create a new assignment.
 * Automatically initializes pending submission records for students in the class.
 * @param {Object} assignmentData - { title, description, subject, school_class, due_date, max_marks, assignment_type }
 * @returns {Promise<Object>} Response with created assignment record
 */
export async function createAssignment(assignmentData) {
  const apiResponse = await axiosInstance.post(BASE_URL, assignmentData);
  return apiResponse.data;
}

/**
 * Fetch single assignment detail by ID.
 * @param {number|string} assignmentId - The primary key of the assignment
 * @returns {Promise<Object>} Assignment detail data
 */
export async function fetchAssignmentById(assignmentId) {
  const apiResponse = await axiosInstance.get(`${BASE_URL}${assignmentId}/`);
  return apiResponse.data;
}

/**
 * Update an existing assignment.
 * @param {number|string} assignmentId - The primary key of the assignment
 * @param {Object} updatedFields - Fields to update
 * @returns {Promise<Object>} Updated assignment data
 */
export async function updateAssignment(assignmentId, updatedFields) {
  const apiResponse = await axiosInstance.put(`${BASE_URL}${assignmentId}/`, updatedFields);
  return apiResponse.data;
}

/**
 * Archive / deactivate an assignment.
 * @param {number|string} assignmentId - The primary key of the assignment
 * @returns {Promise<Object>} Confirmation response
 */
export async function archiveAssignment(assignmentId) {
  const apiResponse = await axiosInstance.delete(`${BASE_URL}${assignmentId}/`);
  return apiResponse.data;
}

/**
 * Fetch all student submissions for a specific assignment.
 * Used by teachers to see student submission statuses and answers.
 * @param {number|string} assignmentId - The primary key of the assignment
 * @returns {Promise<Object>} List of student submission objects
 */
export async function fetchAssignmentSubmissions(assignmentId) {
  const apiResponse = await axiosInstance.get(`${BASE_URL}${assignmentId}/submissions/`);
  return apiResponse.data;
}

/**
 * Grade a student's submission.
 * @param {number|string} assignmentId - The primary key of the assignment
 * @param {number|string} submissionId - The primary key of the submission record
 * @param {Object} gradingData - { marks_obtained, teacher_feedback }
 * @returns {Promise<Object>} Updated submission record with graded status
 */
export async function gradeSubmission(assignmentId, submissionId, gradingData) {
  const apiResponse = await axiosInstance.post(
    `${BASE_URL}${assignmentId}/grade/${submissionId}/`,
    gradingData
  );
  return apiResponse.data;
}

// ==============================================================================
// 2. Student Portal API Functions
// ==============================================================================

/**
 * Fetch all assignments assigned to the logged-in student's class,
 * along with their personal submission status, marks, and feedback.
 * @returns {Promise<Object>} List of assignments for current student
 */
export async function fetchStudentAssignments() {
  const apiResponse = await axiosInstance.get(`${BASE_URL}my-assignments/`);
  return apiResponse.data;
}

/**
 * Submit written solution text for an assignment.
 * @param {number|string} assignmentId - The assignment being submitted
 * @param {Object} submissionData - { submission_text: string }
 * @returns {Promise<Object>} Submission confirmation and updated record
 */
export async function submitAssignment(assignmentId, submissionData) {
  const apiResponse = await axiosInstance.post(
    `${BASE_URL}${assignmentId}/submit/`,
    submissionData
  );
  return apiResponse.data;
}

// ==============================================================================
// 3. Parent Portal API Functions
// ==============================================================================

/**
 * Fetch all assignments and submission progress for all children linked to this parent.
 * @returns {Promise<Object>} List of children with their assignment lists
 */
export async function fetchParentChildAssignments() {
  const apiResponse = await axiosInstance.get(`${BASE_URL}my-children/`);
  return apiResponse.data;
}
