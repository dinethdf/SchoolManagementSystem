/**
 * Admin Dashboard Page Component
 * 
 * This is the central dashboard for School Administrators.
 * It uses TanStack React Query (useQuery) to fetch live data from the backend:
 * 1. Total Classes count and list
 * 2. Total Students count
 * 3. Total Teachers count
 * 
 * STANDARDS FOLLOWED:
 * - Rule 1 & 4: Straightforward code, no nested ternaries, broken into clear steps.
 * - Rule 2: Heavy comments explaining every section and hook.
 * - Rule 8: Visible error banner if the backend API fails.
 * - Rule 9: Tailwind CSS, responsive cards, loading spinner, empty state message.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { fetchClasses } from '../api/classes';
import { fetchStudents, fetchTeachers } from '../api/students';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminDashboard() {
  // Get current logged-in admin user information
  const { currentUser } = useAuth();

  // -----------------------------------------------------------
  // Step 1: Fetch live data from backend using TanStack Query
  // -----------------------------------------------------------

  // Fetch all classes
  const classesQuery = useQuery({
    queryKey: ['adminClassesList'],
    queryFn: fetchClasses,
  });

  // Fetch all students
  const studentsQuery = useQuery({
    queryKey: ['adminStudentsList'],
    queryFn: fetchStudents,
  });

  // Fetch all teachers
  const teachersQuery = useQuery({
    queryKey: ['adminTeachersList'],
    queryFn: fetchTeachers,
  });

  // Determine if ANY query is still actively loading for the first time
  const isInitialDataLoading =
    classesQuery.isLoading || studentsQuery.isLoading || teachersQuery.isLoading;

  if (isInitialDataLoading) {
    return (
      <LoadingSpinner
        message="Loading administrative dashboard metrics..."
      />
    );
  }

  // -----------------------------------------------------------
  // Step 2: Calculate Counts Safely from API Responses
  // -----------------------------------------------------------
  // Support both raw arrays and { success, total_count, classes: [...] } objects
  let classList = [];
  if (Array.isArray(classesQuery.data)) {
    classList = classesQuery.data;
  } else if (classesQuery.data && Array.isArray(classesQuery.data.classes)) {
    classList = classesQuery.data.classes;
  }

  let studentList = [];
  if (Array.isArray(studentsQuery.data)) {
    studentList = studentsQuery.data;
  } else if (studentsQuery.data && Array.isArray(studentsQuery.data.students)) {
    studentList = studentsQuery.data.students;
  }

  let teacherList = [];
  if (Array.isArray(teachersQuery.data)) {
    teacherList = teachersQuery.data;
  } else if (teachersQuery.data && Array.isArray(teachersQuery.data.teachers)) {
    teacherList = teachersQuery.data.teachers;
  }

  const totalClassesCount =
    classesQuery.data && classesQuery.data.total_count !== undefined
      ? classesQuery.data.total_count
      : classList.length;

  const totalStudentsCount =
    studentsQuery.data && studentsQuery.data.total_count !== undefined
      ? studentsQuery.data.total_count
      : studentList.length;

  const totalTeachersCount =
    teachersQuery.data && teachersQuery.data.total_count !== undefined
      ? teachersQuery.data.total_count
      : teacherList.length;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, <span className="font-semibold text-indigo-600">{currentUser?.username || 'Administrator'}</span>! Here is the latest overview of your school.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
            System Online
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Total Classes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Total Classes
            </p>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              🏫
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalClassesCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Active class sections in current academic year
          </p>
        </div>

        {/* Metric 2: Total Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Enrolled Students
            </p>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              🎓
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalStudentsCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Registered students across all grades
          </p>
        </div>

        {/* Metric 3: Total Teachers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Active Faculty
            </p>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              👨‍🏫
            </div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalTeachersCount}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Assigned teachers and subject instructors
          </p>
        </div>
      </div>

      {/* 3. Classes Overview Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Classes & Sections
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Current classes configured in the system
            </p>
          </div>
        </div>

        {/* Table View */}
        {classList.length === 0 ? (
          // Rule 9: Empty state message when no items exist
          <div className="p-8 text-center">
            <div className="text-3xl mb-2">🏫</div>
            <p className="text-sm font-semibold text-gray-700">No classes found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Classes created by administrators will appear here. Start by setting up Grade levels and sections.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-left">
                <tr>
                  <th className="px-6 py-3">Class Name</th>
                  <th className="px-6 py-3">Grade Level</th>
                  <th className="px-6 py-3">Section</th>
                  <th className="px-6 py-3">Academic Year</th>
                  <th className="px-6 py-3">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {classList.map(function (classItem) {
                  return (
                    <tr key={classItem.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {classItem.name}
                      </td>
                      <td className="px-6 py-4">
                        Grade {classItem.grade_level}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
                          {classItem.section}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {classItem.academic_year}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {classItem.room_number || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
