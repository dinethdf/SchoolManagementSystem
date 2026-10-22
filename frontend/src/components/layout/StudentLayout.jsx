/**
 * Student Layout Component
 * 
 * Provides the overall page structure for Students.
 * Includes:
 * - Top Navbar with student profile & logout
 * - Left Sidebar with links to Student views (Profile, Attendance, Grades)
 * - Main content area where child pages render via <Outlet />
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function StudentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation links specific to the Student role
  const studentNavigationItems = [
    { label: 'Dashboard', path: '/student', icon: '📊', exact: true },
    { label: 'My Profile', path: '/student/profile', icon: '👤' },
    { label: 'My Attendance', path: '/student/attendance', icon: '📅' },
    { label: 'My Grades', path: '/student/grades', icon: '📝' },
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
          navigationItems={studentNavigationItems}
          roleTitle="Student Portal"
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
