import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

/**
 * Root Application Component.
 * Sets up providers (QueryClientProvider, AuthProvider) and router.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
