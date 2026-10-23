/**
 * Admin Layout Component
 * 
 * Configures the navigation items, portal title, and accent color
 * for the School Administrator role, delegating structure to DashboardLayout.
 */
import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function AdminLayout() {
  const adminNavigationItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊', exact: true },
    { label: 'Classes & Sections', path: '/admin/classes', icon: '🏫' },
    { label: 'Subjects', path: '/admin/subjects', icon: '📖' },
    { label: 'Students', path: '/admin/students', icon: '🎓' },
    { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
    { label: 'Parents', path: '/admin/parents', icon: '👨‍👩‍👧' },
  ];

  return (
    <DashboardLayout
      navigationItems={adminNavigationItems}
      roleTitle="School Administration"
      accentColor="purple"
    />
  );
}
