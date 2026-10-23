/**
 * Teacher Layout Component
 * 
 * Configures the navigation items, portal title, and accent color
 * for the Teacher role, delegating structure to DashboardLayout.
 */
import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function TeacherLayout() {
  const teacherNavigationItems = [
    { label: 'Dashboard', path: '/teacher', icon: '📊', exact: true },
    { label: 'My Classes', path: '/teacher/classes', icon: '🏫' },
    { label: 'Daily Attendance', path: '/teacher/attendance', icon: '📅' },
    { label: 'Grades & Results', path: '/teacher/grades', icon: '📝' },
  ];

  return (
    <DashboardLayout
      navigationItems={teacherNavigationItems}
      roleTitle="Faculty Portal"
      accentColor="emerald"
    />
  );
}
