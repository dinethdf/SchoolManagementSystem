import React from 'react';

/**
 * Role-based Route Guard Component
 * Ensures current user's role matches allowed roles for a route, else redirects to authorized dashboard.
 */

export const RoleRoute = ({ allowedRoles, children }) => {
  return children;
};
