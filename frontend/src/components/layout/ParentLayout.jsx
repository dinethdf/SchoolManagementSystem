import React from 'react';
import { Outlet } from 'react-router-dom';

export default function ParentLayout() {
  return (
    <div className="parent-layout flex h-screen bg-gray-100">
      <aside className="w-64 bg-purple-800 text-white p-4">Parent Sidebar</aside>
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 text-xl font-semibold">Parent Header</header>
        <Outlet />
      </main>
    </div>
  );
}
