import React from 'react';
import { Outlet } from 'react-router-dom';

export default function StaffLayout() {
  return (
    <div className="staff-layout flex h-screen bg-gray-100">
      <aside className="w-64 bg-orange-800 text-white p-4">Staff Sidebar</aside>
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 text-xl font-semibold">Staff Header</header>
        <Outlet />
      </main>
    </div>
  );
}
