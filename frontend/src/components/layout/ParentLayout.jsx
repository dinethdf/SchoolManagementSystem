/**
 * Parent Layout Component
 * 
 * Configures the navigation items, portal title, and accent color
 * for Parents and Guardians, delegating structure to DashboardLayout.
 */
import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function ParentLayout() {
  const parentNavigationItems = [
    { label: 'Dashboard', path: '/parent', icon: '📊', exact: true },
    { label: 'My Children', path: '/parent/children', icon: '👨‍👩‍👧' },
    { label: 'Attendance Records', path: '/parent/attendance', icon: '📅' },
    { label: 'Academic Reports', path: '/parent/grades', icon: '📝' },
  ];

  return (
    <DashboardLayout
      navigationItems={parentNavigationItems}
      roleTitle="Guardian Portal"
      accentColor="amber"
    />
  );
}
