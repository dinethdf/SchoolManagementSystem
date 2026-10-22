/**
 * Authentication Context
 * 
 * This is the GLOBAL STATE for user authentication in our app.
 * React Context lets us share data (like the logged-in user's info)
 * with ANY component in the app — without passing props through every parent.
 * 
 * WHAT THIS PROVIDES TO THE WHOLE APP:
 *   - currentUser: The logged-in user's data (id, username, email, role)
 *   - isLoading: True while we are checking if a user is already logged in
 *   - loginUser(credentials): Function to log in — saves tokens, sets user
 *   - logoutUser(): Function to log out — clears tokens and user data
 *   - isAuthenticated: True/False — is someone logged in right now?
 * 
 * HOW TO USE IT IN A COMPONENT:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { currentUser, logoutUser } = useAuth();
 */
import React, { createContext, useState, useEffect } from 'react';
import { loginUser as callLoginAPI, getCurrentUser } from '../api/auth';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// Create the context object. Components will read from this.
// The default value is null — it becomes useful only inside AuthProvider.
export const AuthContext = createContext(null);

// ============================================================
// AUTH PROVIDER COMPONENT
// Wrap the entire app with this component so every child component
// can access the authentication state and functions.
// ============================================================
export function AuthProvider({ children }) {
  // 'currentUser' stores the logged-in user's data (or null if nobody is logged in)
  const [currentUser, setCurrentUser] = useState(null);

  // 'isLoading' is true while we are checking if a user is already logged in
  // (e.g., when the page first loads and we check localStorage for an existing session)
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // CHECK FOR EXISTING SESSION ON PAGE LOAD
  // When the app first opens, we check if the user was already logged in.
  // If there is a token in localStorage, we use it to fetch the user's profile.
  // ============================================================
  useEffect(function () {
    // Define the async function inside useEffect (required pattern for async useEffect)
    async function checkIfUserIsAlreadyLoggedIn() {
      // Check if there is an access token stored in the browser
      const existingAccessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

      if (existingAccessToken) {
        // A token exists — try to fetch the user's current profile from the backend.
        // This also validates that the token is still active.
        try {
          const userProfileData = await getCurrentUser();

          // If successful, store the user's data in state
          setCurrentUser(userProfileData);
        } catch (error) {
          // The token is invalid or expired (and refresh also failed).
          // Clear everything so the user sees the login page.
          console.error('Session is invalid. Clearing stored tokens.', error);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);
          setCurrentUser(null);
        }
      }

      // We're done checking — stop showing the loading state
      setIsLoading(false);
    }

    // Run the check
    checkIfUserIsAlreadyLoggedIn();
  }, []); // The empty array means this runs ONCE when the component first mounts

  // ============================================================
  // LOGIN FUNCTION
  // Called when the user submits the login form.
  // It sends credentials to the backend, saves the returned tokens,
  // and then fetches the user's profile to set in state.
  // ============================================================
  async function handleLogin(loginCredentials) {
    // Call the backend login API — throws an error if credentials are wrong
    const tokenResponse = await callLoginAPI(loginCredentials);

    // Save the access token and refresh token to localStorage
    // Access token: used for every API request (expires in 15 minutes)
    // Refresh token: used to get a new access token (expires in 7 days)
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access);
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh);

    // Now fetch the user's full profile data using the new token
    const userProfileData = await getCurrentUser();

    // Save the user's profile to state — this will update all components that use useAuth()
    setCurrentUser(userProfileData);

    // Return the user data so the Login page component can redirect based on role
    return userProfileData;
  }

  // ============================================================
  // LOGOUT FUNCTION
  // Called when the user clicks "Logout".
  // Clears all stored tokens and user data, effectively ending the session.
  // ============================================================
  function handleLogout() {
    // Clear the access token from localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

    // Clear the refresh token from localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

    // Clear any cached user data from localStorage
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA);

    // Update state to null — this will trigger re-render in all components using useAuth()
    // Protected routes will then redirect to the login page
    setCurrentUser(null);
  }

  // ============================================================
  // CONVENIENCE VARIABLE
  // isAuthenticated is simply true if currentUser is not null.
  // Components use this to check if someone is logged in.
  // ============================================================
  const isAuthenticated = currentUser !== null;

  // Build the value object that will be shared with all child components
  const authContextValue = {
    currentUser: currentUser,         // The logged-in user's data (or null)
    isLoading: isLoading,             // True while checking session on startup
    isAuthenticated: isAuthenticated, // True if someone is logged in
    loginUser: handleLogin,           // Function to call when submitting login form
    logoutUser: handleLogout,         // Function to call when clicking logout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
