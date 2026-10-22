/**
 * Parent Layout Component
 * 
 * Provides the overall page structure for Parents and Guardians.
 * Includes:
 * - Top Navbar with parent profile & logout
 * - Left Sidebar with links to Parent views (Children, Attendance, Grades)
 * - Main content area where child pages render via <Outlet />
 */
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

export default function ParentLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Navigation links specific to the Parent role
  const parentNavigationItems = [
    { label: 'Dashboard', path: '/parent', icon: '📊', exact: true },
    { label: 'My Children', path: '/parent/children', icon: '👨‍👩‍👧' },
    { label: 'Attendance', path: '/parent/attendance', icon: '📅' },
    { label: 'Academic Grades', path: '/parent/grades', icon: '📝' },
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
          navigationItems={parentNavigationItems}
          roleTitle="Parent Portal"
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
