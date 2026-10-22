/**
 * Role Route Guard Component
 * 
 * Re-exports or wraps ProtectedRoute with role restrictions.
 * If used directly, checks if current user's role is in the allowedRoles list.
 */
import React from 'react';
import ProtectedRoute from './ProtectedRoute';

export function RoleRoute({ allowedRoles = [], children }) {
  // Uses ProtectedRoute logic to verify authentication and role access
  return <ProtectedRoute allowedRoles={allowedRoles}>{children}</ProtectedRoute>;
}

export default RoleRoute;
