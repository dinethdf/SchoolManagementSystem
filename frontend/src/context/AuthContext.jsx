/**
 * Authentication Context
 * 
 * Global state provider for user authentication in our React application.
 * Provides:
 * - currentUser: Logged-in user data object
 * - isLoading: True while checking existing session on startup
 * - isAuthenticated: True if user is logged in
 * - loginUser: Async function to perform login and save session
 * - logoutUser: Function to clear session and tokens
 */
import React, { createContext, useState, useEffect } from 'react';
import { loginUser as callLoginAPI, getCurrentUser } from '../api/auth';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // CHECK FOR EXISTING SESSION ON PAGE LOAD
  // ============================================================
  useEffect(function () {
    async function checkIfUserIsAlreadyLoggedIn() {
      const existingAccessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

      // Verify the token exists and is not literal string 'undefined' or 'null'
      if (
        existingAccessToken &&
        existingAccessToken !== 'undefined' &&
        existingAccessToken !== 'null'
      ) {
        try {
          // Fetch current user's profile using the stored access token
          const userProfileData = await getCurrentUser();
          setCurrentUser(userProfileData);
        } catch (error) {
          console.error('Stored session expired or invalid. Clearing tokens.', error);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
          setCurrentUser(null);
        }
      } else {
        // Clear any corrupted values
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
      }

      setIsLoading(false);
    }

    checkIfUserIsAlreadyLoggedIn();
  }, []);

  // ============================================================
  // LOGIN HANDLER
  // ============================================================
  async function handleLogin(loginCredentials) {
    // 1. Send credentials to Django backend
    const apiResponse = await callLoginAPI(loginCredentials);

    // 2. Extract access token (supporting both standard and nested structures)
    let accessToken = null;
    if (apiResponse.access) {
      accessToken = apiResponse.access;
    } else if (apiResponse.tokens && apiResponse.tokens.access_token) {
      accessToken = apiResponse.tokens.access_token;
    } else if (apiResponse.tokens && apiResponse.tokens.access) {
      accessToken = apiResponse.tokens.access;
    }

    // 3. Extract refresh token
    let refreshToken = null;
    if (apiResponse.refresh) {
      refreshToken = apiResponse.refresh;
    } else if (apiResponse.tokens && apiResponse.tokens.refresh_token) {
      refreshToken = apiResponse.tokens.refresh_token;
    } else if (apiResponse.tokens && apiResponse.tokens.refresh) {
      refreshToken = apiResponse.tokens.refresh;
    }

    if (!accessToken) {
      throw new Error('Access token was not returned by the server.');
    }

    // 4. Save tokens to localStorage
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    // 5. Extract user profile data directly from login response
    let userProfile = apiResponse.user;

    // Fallback: fetch from /api/auth/me/ if user wasn't included in login response
    if (!userProfile) {
      userProfile = await getCurrentUser();
    }

    // 6. Save user profile to localStorage and React state
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA, JSON.stringify(userProfile));
    setCurrentUser(userProfile);

    return userProfile;
  }

  // ============================================================
  // LOGOUT HANDLER
  // ============================================================
  function handleLogout() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
    setCurrentUser(null);
  }

  const isAuthenticated = currentUser !== null;

  const authContextValue = {
    currentUser: currentUser,
    isLoading: isLoading,
    isAuthenticated: isAuthenticated,
    loginUser: handleLogin,
    logoutUser: handleLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
