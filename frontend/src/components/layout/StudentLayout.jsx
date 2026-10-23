/**
 * Student Layout Component
 * 
 * Configures the navigation items, portal title, and accent color
 * for the Student role, delegating structure to DashboardLayout.
 */
import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function StudentLayout() {
  const studentNavigationItems = [
    { label: 'Dashboard', path: '/student', icon: '📊', exact: true },
    { label: 'My Profile', path: '/student/profile', icon: '👤' },
    { label: 'My Attendance', path: '/student/attendance', icon: '📅' },
    { label: 'My Grades', path: '/student/grades', icon: '📝' },
  ];

  return (
    <DashboardLayout
      navigationItems={studentNavigationItems}
      roleTitle="Student Portal"
      accentColor="blue"
    />
  );
}
