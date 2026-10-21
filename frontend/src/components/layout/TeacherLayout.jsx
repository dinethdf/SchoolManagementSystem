import React from 'react';
import { Outlet } from 'react-router-dom';

export default function TeacherLayout() {
  return (
    <div className="teacher-layout flex h-screen bg-gray-100">
      <aside className="w-64 bg-emerald-800 text-white p-4">Teacher Sidebar</aside>
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 text-xl font-semibold">Teacher Header</header>
        <Outlet />
      </main>
    </div>
  );
}
