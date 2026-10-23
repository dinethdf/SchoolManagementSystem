/**
 * Unified Dashboard Layout Component
 * 
 * This is the SINGLE BASE LAYOUT used by all 4 system portals:
 * - Admin Portal (AdminLayout)
 * - Teacher Portal (TeacherLayout)
 * - Student Portal (StudentLayout)
 * - Parent Portal (ParentLayout)
 * 
 * WHY THIS IS BETTER:
 * Previously, each role had its own layout with duplicated HTML and logic.
 * Now, this component handles all layout structure, mobile navigation,
 * navbar, sidebar, and logout logic in ONE place.
 * If we change anything in the layout, it automatically updates everywhere!
 * 
 * PROPS:
 * - navigationItems: Array of navigation objects:
 *     [ { label: 'Classes', path: '/admin/classes', icon: '🏫' }, ... ]
 * - roleTitle: Title displayed at top of sidebar (e.g. "Admin Portal")
 * - accentColor: Visual theme color ('purple', 'emerald', 'blue', 'amber')
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import AvatarBadge from '../common/AvatarBadge';
import Button from '../common/Button';

export default function DashboardLayout({
  navigationItems = [],
  roleTitle = 'Portal',
  accentColor = 'indigo',
}) {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();

  // State to control sidebar open/close on mobile viewports
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Logout handler
  function handleLogout() {
    logoutUser();
    toast.success('You have successfully logged out.');
    navigate('/login');
  }

  // Helper to get formatted date string for the header (e.g., "Thursday, Oct 22, 2026")
  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Determine active link styling classes based on accent color
  let activeNavLinkClasses = 'bg-indigo-600 text-white font-semibold shadow-xs';
  if (accentColor === 'purple') {
    activeNavLinkClasses = 'bg-purple-600 text-white font-semibold shadow-xs';
  } else if (accentColor === 'emerald') {
    activeNavLinkClasses = 'bg-emerald-600 text-white font-semibold shadow-xs';
  } else if (accentColor === 'blue') {
    activeNavLinkClasses = 'bg-blue-600 text-white font-semibold shadow-xs';
  } else if (accentColor === 'amber') {
    activeNavLinkClasses = 'bg-amber-600 text-white font-semibold shadow-xs';
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* 1. TOP NAVBAR                                             */}
      {/* ========================================================= */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        {/* Left Section: Mobile Menu Toggle + School Branding */}
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger menu button */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* School Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              SMS
            </div>
            <div>
              <span className="text-base font-bold text-gray-900 leading-none block">
                SchoolMS
              </span>
              <span className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Academic Management System
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Today Date + User Profile Info + Logout */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Current Date Badge */}
          <span className="hidden lg:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            📅 {todayDateString}
          </span>

          {/* User Quick Info */}
          {currentUser && (
            <div className="flex items-center space-x-3 pl-2 sm:border-l sm:border-gray-200">
              <AvatarBadge
                name={currentUser.full_name || currentUser.username}
                size="small"
                roleColor={accentColor}
              />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {currentUser.full_name || currentUser.username}
                </p>
                <p className="text-[11px] text-gray-500 capitalize">
                  {currentUser.role}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            variant="outline"
            size="small"
            onClick={handleLogout}
            className="text-gray-600 hover:text-rose-600 hover:border-rose-200"
          >
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BODY CONTAINER: SIDEBAR + MAIN CONTENT AREA            */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ------------------------------------------------------- */}
        {/* SIDEBAR NAVIGATION                                      */}
        {/* ------------------------------------------------------- */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            {/* Sidebar Header: Role Portal Title */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {roleTitle}
              </span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden text-slate-400 hover:text-white"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1.5">
              {navigationItems.map(function (item) {
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact !== false}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={function ({ isActive }) {
                      if (isActive) {
                        return `flex items-center px-3.5 py-2.5 text-sm rounded-lg transition ${activeNavLinkClasses}`;
                      }
                      return 'flex items-center px-3.5 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition';
                    }}
                  >
                    {item.icon && <span className="mr-3 text-base">{item.icon}</span>}
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer: User Card */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center space-x-3">
              <AvatarBadge
                name={currentUser?.full_name || currentUser?.username}
                size="small"
                roleColor={accentColor}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.full_name || currentUser?.username || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email || 'Logged In'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ------------------------------------------------------- */}
        {/* MAIN CONTENT AREA                                       */}
        {/* ------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
