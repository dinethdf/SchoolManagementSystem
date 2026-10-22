/**
 * Teacher Layout Component
 * 
 * Provides the overall page structure for Teachers.
 * Includes:
 * - Top Navbar with user profile & logout
 * - Left Sidebar with links to Teacher features (Classes, Attendance, Grades)
 * - Main content area where child pages render via <Outlet />
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function TeacherLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation links specific to the Teacher role
  const teacherNavigationItems = [
    { label: 'Dashboard', path: '/teacher', icon: '📊', exact: true },
    { label: 'My Classes', path: '/teacher/classes', icon: '🏫' },
    { label: 'Attendance', path: '/teacher/attendance', icon: '📅' },
    { label: 'Grades & Results', path: '/teacher/grades', icon: '📝' },
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
          navigationItems={teacherNavigationItems}
          roleTitle="Teacher Portal"
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
