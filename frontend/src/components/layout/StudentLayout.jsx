import React from 'react';
import { Outlet } from 'react-router-dom';

export default function StudentLayout() {
  return (
    <div className="student-layout flex h-screen bg-gray-100">
      <aside className="w-64 bg-blue-800 text-white p-4">Student Sidebar</aside>
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 text-xl font-semibold">Student Header</header>
        <Outlet />
      </main>
    </div>
  );
}
