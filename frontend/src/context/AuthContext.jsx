import React, { createContext } from 'react';

/**
 * Authentication Context Provider
 * Stores user session, JWT token state, login/logout handlers, and user permissions.
 */

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
};
