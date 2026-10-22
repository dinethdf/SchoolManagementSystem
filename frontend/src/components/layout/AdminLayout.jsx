/**
 * Admin Layout Component
 * 
 * Provides the overall page structure for School Administrators.
 * Includes:
 * - Top Navbar with user profile & logout
 * - Left Sidebar with links to Admin features (Classes, Subjects, Students, Teachers, Parents)
 * - Main content area where child pages render via <Outlet />
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function AdminLayout() {
  // Mobile sidebar visibility state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation links specific to the School Admin role
  const adminNavigationItems = [
    { label: 'Dashboard', path: '/admin', icon: '📊', exact: true },
    { label: 'Classes & Sections', path: '/admin/classes', icon: '🏫' },
    { label: 'Subjects', path: '/admin/subjects', icon: '📖' },
    { label: 'Students', path: '/admin/students', icon: '🎓' },
    { label: 'Teachers', path: '/admin/teachers', icon: '👨‍🏫' },
    { label: 'Parents', path: '/admin/parents', icon: '👨‍👩‍👧' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Body: Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-Specific Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navigationItems={adminNavigationItems}
          roleTitle="Admin Portal"
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
