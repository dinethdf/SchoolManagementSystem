/**
 * Protected Route Component
 * 
 * This component acts as a security guard for routes that require
 * a user to be logged in before viewing the page.
 * 
 * HOW IT WORKS:
 * 1. While AuthContext is checking if a previous session exists (isLoading = true),
 *    we display a friendly fullscreen loading spinner.
 * 2. If the user is NOT logged in (isAuthenticated = false), we redirect them
 *    to the '/login' page, saving the page they tried to visit so we can
 *    send them back there after successful login.
 * 3. If 'allowedRoles' is provided (e.g., ['admin', 'teacher']), we check if
 *    the current user's role matches. If not, we redirect to '/unauthorized'.
 * 4. If all checks pass, we render <Outlet />, which displays the child route/page.
 */
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = [] }) {
  // Get authentication state from our custom useAuth hook
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  // Get current browser URL location to remember where user came from
  const currentBrowserLocation = useLocation();

  // Step 1: If we are still checking for an existing session, show loading spinner
  if (isLoading) {
    return (
      <LoadingSpinner
        isFullScreen={true}
        message="Verifying your account session..."
      />
    );
  }

  // Step 2: If the user is NOT authenticated, redirect them to the login page
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: currentBrowserLocation }}
        replace={true}
      />
    );
  }

  // Step 3: If this route is restricted to specific roles, check the user's role
  if (allowedRoles.length > 0) {
    const userRole = currentUser && currentUser.role ? currentUser.role.toLowerCase() : '';
    
    // Check whether the user's role is in the allowedRoles list
    let isRolePermitted = false;
    for (let i = 0; i < allowedRoles.length; i++) {
      if (allowedRoles[i].toLowerCase() === userRole) {
        isRolePermitted = true;
        break;
      }
    }

    // If the user's role is not authorized for this route, send them to unauthorized page
    if (!isRolePermitted) {
      return <Navigate to="/unauthorized" replace={true} />;
    }
  }

  // Step 4: All checks passed! Render the child route component
  return <Outlet />;
}
