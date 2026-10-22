/**
 * Custom Hook: useAuth
 * 
 * This is a simple helper hook that makes it easy to access the
 * AuthContext from any component. Instead of writing:
 *   import { useContext } from 'react';
 *   import { AuthContext } from '../context/AuthContext';
 *   const auth = useContext(AuthContext);
 * 
 * You can just write:
 *   import { useAuth } from '../hooks/useAuth';
 *   const { currentUser, logoutUser } = useAuth();
 * 
 * It also checks that we are inside an AuthProvider — if not, it
 * throws a helpful error message so the developer knows what to fix.
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// This function is our custom hook
export function useAuth() {
  // Get the value that AuthProvider is sharing through context
  const authContextValue = useContext(AuthContext);

  // If authContextValue is null, it means this hook was used outside of AuthProvider.
  // That is a developer mistake, so we throw a clear error to help them fix it.
  if (authContextValue === null) {
    throw new Error(
      'useAuth() was called outside of an AuthProvider. ' +
      'Make sure your component is wrapped inside <AuthProvider> in App.jsx.'
    );
  }

  // Return the auth context so components can destructure what they need:
  // const { currentUser, isAuthenticated, loginUser, logoutUser, isLoading } = useAuth();
  return authContextValue;
}
