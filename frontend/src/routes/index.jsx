/**
 * Application Routes Configuration
 * 
 * Maps all URL paths in the application to their corresponding pages and layouts:
 * - Public Routes:
 *   - /            -> Public Home / Landing Page
 *   - /login       -> Login Page
 *   - /unauthorized -> Access Denied (403) Page
 * 
 * - Admin Portal (/admin):
 *   - /admin           -> Admin Dashboard
 *   - /admin/classes   -> Classes & Sections Management
 *   - /admin/students  -> Students Roster & Admissions
 *   - /admin/teachers  -> Faculty Members
 *   - /admin/parents   -> Parents & Guardians
 * 
 * - Teacher Portal (/teacher):
 *   - /teacher         -> Teacher Dashboard
 * 
 * - Student Portal (/student):
 *   - /student         -> Student Dashboard
 * 
 * - Parent Portal (/parent):
 *   - /parent          -> Parent Dashboard
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { USER_ROLES } from '../utils/constants';

// Layouts
import AdminLayout from '../components/layout/AdminLayout';
import TeacherLayout from '../components/layout/TeacherLayout';
import StudentLayout from '../components/layout/StudentLayout';
import ParentLayout from '../components/layout/ParentLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import ClassesPage from '../pages/admin/ClassesPage';
import StudentsPage from '../pages/admin/StudentsPage';
import TeachersPage from '../pages/admin/TeachersPage';
import ParentsPage from '../pages/admin/ParentsPage';

// Role Dashboards & Feature Pages
import TeacherDashboard from '../pages/teacher';
import TeacherAttendancePage from '../pages/teacher/AttendancePage';
import TeacherGradesPage from '../pages/teacher/GradesPage';

import StudentDashboard from '../pages/student';
import StudentAttendancePage from '../pages/student/AttendancePage';
import StudentGradesPage from '../pages/student/GradesPage';

import ParentDashboard from '../pages/parent';
import ParentAttendancePage from '../pages/parent/AttendancePage';
import ParentGradesPage from '../pages/parent/GradesPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ------------------------------------------------------------- */}
      {/* 1. Public Routes                                              */}
      {/* ------------------------------------------------------------- */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* ------------------------------------------------------------- */}
      {/* 2. Admin Portal (Restricted to 'admin' role)                   */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="parents" element={<ParentsPage />} />
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 3. Teacher Portal (Restricted to 'teacher' role)               */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="grades" element={<TeacherGradesPage />} />
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 4. Student Portal (Restricted to 'student' role)               */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="grades" element={<StudentGradesPage />} />
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 5. Parent Portal (Restricted to 'parent' role)                 */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.PARENT]} />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentDashboard />} />
          <Route path="attendance" element={<ParentAttendancePage />} />
          <Route path="grades" element={<ParentGradesPage />} />
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 6. Fallback / Not Found Route (Redirect to Home)               */}
      {/* ------------------------------------------------------------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
