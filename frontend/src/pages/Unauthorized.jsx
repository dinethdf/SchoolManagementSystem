/**
 * Unauthorized Access Page Component (HTTP 403 Forbidden)
 * 
 * This page is displayed when a logged-in user tries to visit a URL
 * that is not permitted for their role (e.g. a Student trying to open /admin).
 * 
 * It explains clearly what happened and provides links to return to
 * their authorized dashboard or log in as a different user.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAuth();

  // Determine the user's appropriate home dashboard based on role
  let userDashboardPath = '/';
  if (currentUser && currentUser.role) {
    userDashboardPath = `/${currentUser.role.toLowerCase()}`;
  }

  // Handle logout and navigate to login screen
  function handleSwitchAccount() {
    logoutUser();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>

        {/* Clear explanation of why this happened */}
        <p className="text-sm text-gray-600 mb-6">
          You do not have the required permissions to view this page.
          {currentUser && (
            <span className="block mt-2 font-medium text-gray-800">
              You are currently logged in as:{' '}
              <span className="capitalize text-indigo-600 font-semibold">
                {currentUser.role}
              </span>{' '}
              ({currentUser.username})
            </span>
          )}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to={userDashboardPath} className="block">
            <Button variant="primary" className="w-full">
              Go to My Authorized Dashboard
            </Button>
          </Link>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSwitchAccount}
          >
            Sign in as Different User
          </Button>
        </div>
      </div>
    </div>
  );
}
