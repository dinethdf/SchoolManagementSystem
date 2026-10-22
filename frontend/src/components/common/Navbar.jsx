/**
 * Common Top Navbar Component
 * 
 * Displays:
 * 1. School Management System title & logo badge
 * 2. Logged-in user information (username and styled role badge)
 * 3. Logout button that clears session and redirects to /login
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();

  // Function to handle logging out
  function handleLogoutClick() {
    logoutUser();
    toast.success('Successfully logged out.');
    navigate('/login');
  }

  // Get user role in lowercase for styling
  const userRole = currentUser && currentUser.role ? currentUser.role.toLowerCase() : '';

  // Determine badge color based on role
  let roleBadgeClasses = 'bg-gray-100 text-gray-700';
  if (userRole === 'admin') {
    roleBadgeClasses = 'bg-purple-100 text-purple-700 border border-purple-200';
  } else if (userRole === 'teacher') {
    roleBadgeClasses = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  } else if (userRole === 'student') {
    roleBadgeClasses = 'bg-blue-100 text-blue-700 border border-blue-200';
  } else if (userRole === 'parent') {
    roleBadgeClasses = 'bg-amber-100 text-amber-700 border border-amber-200';
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10">
      {/* Left side: Mobile menu toggle button + System Title */}
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {/* Hamburger menu icon */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        )}

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SMS
          </div>
          <span className="text-base sm:text-lg font-bold text-gray-900 hidden sm:inline">
            School Management System
          </span>
        </div>
      </div>

      {/* Right side: User information + Role badge + Logout button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {currentUser && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">
              {currentUser.username}
            </p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${roleBadgeClasses}`}
            >
              {currentUser.role}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          size="small"
          onClick={handleLogoutClick}
          className="text-gray-600 hover:text-red-600 hover:border-red-300"
        >
          {/* Logout icon */}
          <svg
            className="w-4 h-4 mr-1 text-current inline"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Logout
        </Button>
      </div>
    </header>
  );
}
