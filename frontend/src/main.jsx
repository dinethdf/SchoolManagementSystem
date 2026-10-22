import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Import Tailwind CSS styling
import './index.css';

/**
 * Entry point for the React application.
 * Initializes React DOM root and renders the App component wrapped in StrictMode.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
