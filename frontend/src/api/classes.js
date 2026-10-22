/**
 * Class & Subject Management API Service
 * 
 * Provides API functions to communicate with the Django academics endpoints:
 * - GET    /api/academics/classes/            -> List all classes
 * - POST   /api/academics/classes/            -> Create a new class
 * - GET    /api/academics/classes/<id>/       -> Get a specific class
 * - PATCH  /api/academics/classes/<id>/       -> Update a class
 * - DELETE /api/academics/classes/<id>/       -> Delete a class
 * - GET    /api/academics/classes/<id>/subjects/ -> List subjects for a specific class
 * - GET    /api/academics/subjects/           -> List all subjects
 * - POST   /api/academics/subjects/           -> Create a new subject
 */
import axiosInstance from './axiosInstance';
import { API_ROUTES } from '../utils/constants';

// ============================================================
// FETCH ALL CLASSES
// Returns a list of all school classes (e.g., Grade 10-A, 10-B)
// ============================================================
export async function fetchClasses() {
  const apiResponse = await axiosInstance.get(API_ROUTES.CLASSES);
  return apiResponse.data;
}

// ============================================================
// CREATE A NEW CLASS
// Sends new class data (name, grade_level, section, academic_year, room_number, class_teacher)
// ============================================================
export async function createClass(classData) {
  const apiResponse = await axiosInstance.post(API_ROUTES.CLASSES, classData);
  return apiResponse.data;
}

// ============================================================
// FETCH A SINGLE CLASS BY ID
// ============================================================
export async function fetchClassById(classId) {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.CLASSES}${classId}/`);
  return apiResponse.data;
}

// ============================================================
// FETCH SUBJECTS FOR A SPECIFIC CLASS
// ============================================================
export async function fetchSubjectsByClass(classId) {
  const apiResponse = await axiosInstance.get(`${API_ROUTES.CLASSES}${classId}/subjects/`);
  return apiResponse.data;
}

// ============================================================
// FETCH ALL SUBJECTS
// Returns a list of all subjects across classes
// ============================================================
export async function fetchSubjects() {
  const apiResponse = await axiosInstance.get(API_ROUTES.SUBJECTS);
  return apiResponse.data;
}

// ============================================================
// CREATE A NEW SUBJECT
// ============================================================
export async function createSubject(subjectData) {
  const apiResponse = await axiosInstance.post(API_ROUTES.SUBJECTS, subjectData);
  return apiResponse.data;
}
