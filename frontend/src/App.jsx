/**
 * App.jsx — Root Application Component
 * 
 * This is the TOP-LEVEL component of the entire React app.
 * Everything in the app is wrapped inside this component.
 * 
 * WHAT EACH WRAPPER DOES:
 * 
 * 1. <BrowserRouter> — Enables React Router so we can have multiple
 *    pages and URLs (like /login, /admin, /student, etc.)
 * 
 * 2. <QueryClientProvider> — Enables TanStack Query (React Query) for
 *    fetching data from the backend. It manages caching, loading states,
 *    and error states for all our API calls automatically.
 * 
 * 3. <AuthProvider> — Makes the logged-in user's data available to
 *    ALL components in the app through the AuthContext.
 * 
 * 4. <Toaster> — Shows popup notifications (toast messages) anywhere
 *    in the app when we call toast.success() or toast.error().
 * 
 * 5. <AppRoutes> — Defines all the URL routes and which page component
 *    to show for each route (like /login → Login page, /admin → AdminDashboard).
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

// Create a QueryClient instance.
// This manages the cache for all React Query requests in the app.
// We create it OUTSIDE the component so it doesn't get recreated on every render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // If a query fails, retry it 1 time before showing an error
      retry: 1,

      // Consider data "fresh" for 5 minutes (300,000 milliseconds)
      // This avoids unnecessary re-fetching when switching between pages
      staleTime: 5 * 60 * 1000,
    },
  },
});

// The main App component that wraps everything together
export default function App() {
  return (
    // BrowserRouter must be the outermost wrapper so routing works everywhere
    <BrowserRouter>
      {/* QueryClientProvider enables React Query for the whole app */}
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider makes login/logout state available everywhere */}
        <AuthProvider>
          {/* AppRoutes defines which page component to show for each URL */}
          <AppRoutes />

          {/* Toaster renders popup notification messages — it works globally */}
          {/* position="top-right" means notifications appear in the top-right corner */}
          <Toaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
