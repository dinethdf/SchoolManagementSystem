/**
 * Application Routes Configuration
 * 
 * Maps all URL paths in the application to their corresponding pages and layouts:
 * - Public Routes:
 *   - /            -> Public Home / Landing Page
 *   - /login       -> Login Page (handles username + password)
 *   - /unauthorized -> Access Denied (403) Page
 * 
 * - Protected Routes (wrapped with ProtectedRoute):
 *   - /admin/*    -> School Admin Portal (requires role: 'admin')
 *   - /teacher/*  -> Teacher Portal (requires role: 'teacher')
 *   - /student/*  -> Student Portal (requires role: 'student')
 *   - /parent/*   -> Parent Portal (requires role: 'parent')
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

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Unauthorized from '../pages/Unauthorized';
import AdminDashboard from '../pages/AdminDashboard';
import TeacherDashboard from '../pages/teacher';
import StudentDashboard from '../pages/student';
import ParentDashboard from '../pages/parent';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ------------------------------------------------------------- */}
      {/* 1. Public Routes (accessible to anyone)                        */}
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
          {/* Sub-routes for Classes, Subjects, Students, Teachers will go here */}
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 3. Teacher Portal (Restricted to 'teacher' role)               */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.TEACHER]} />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          {/* Sub-routes for Attendance, Grades, Classes will go here */}
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 4. Student Portal (Restricted to 'student' role)               */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          {/* Sub-routes for Profile, Attendance, Grades will go here */}
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 5. Parent Portal (Restricted to 'parent' role)                 */}
      {/* ------------------------------------------------------------- */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.PARENT]} />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<ParentDashboard />} />
          {/* Sub-routes for Children, Attendance, Reports will go here */}
        </Route>
      </Route>

      {/* ------------------------------------------------------------- */}
      {/* 6. Fallback / Not Found Route (Redirect to Home)               */}
      {/* ------------------------------------------------------------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
