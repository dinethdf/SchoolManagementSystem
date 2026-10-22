/**
 * Common Sidebar Navigation Component
 * 
 * Displays navigation links based on the user's role.
 * Automatically highlights the currently active link using React Router's <NavLink>.
 * Supports mobile responsive open/close overlay.
 * 
 * PROPS:
 * - isOpen: Boolean indicating if sidebar is open on mobile screens
 * - onClose: Function to close sidebar when clicking backdrop or a link on mobile
 * - navigationItems: Array of { label, path, icon } navigation items
 */
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({
  isOpen = false,
  onClose,
  navigationItems = [],
  roleTitle = 'Navigation',
}) {
  return (
    <>
      {/* 1. Mobile Backdrop Overlay (clicks outside sidebar close it) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 2. Sidebar Navigation Bar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Top Title / Section Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {roleTitle}
            </span>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="p-4 space-y-1">
            {navigationItems.map(function (item) {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact !== false}
                  onClick={onClose}
                  className={function ({ isActive }) {
                    // Active link styling: bright text with indigo background highlight
                    if (isActive) {
                      return 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white shadow-sm';
                    }
                    // Inactive link styling: muted text with hover effect
                    return 'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition';
                  }}
                >
                  {/* Optional Icon */}
                  {item.icon && <span className="mr-3 text-lg">{item.icon}</span>}
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          SMS v1.0 &bull; Role Portal
        </div>
      </aside>
    </>
  );
}
