import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="admin-layout flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white p-4">Admin Sidebar</aside>
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 text-xl font-semibold">Admin Header</header>
        <Outlet />
      </main>
    </div>
  );
}
