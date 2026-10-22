/**
 * Reusable Loading Spinner Component
 * 
 * This component displays an animated spinning circle while data
 * is being loaded from the backend or while checking authentication status.
 * 
 * PROPS:
 * - message: Optional text to display below the spinner (default: 'Loading...')
 * - isFullScreen: If true, covers the whole screen (centered)
 * - size: 'small', 'medium', or 'large' (controls the spinner size)
 */
import React from 'react';

export default function LoadingSpinner({
  message = 'Loading...',
  isFullScreen = false,
  size = 'medium',
}) {
  // Determine spinner dimensions based on the 'size' prop
  let spinnerDimensionsClass = 'w-10 h-10 border-4';

  if (size === 'small') {
    spinnerDimensionsClass = 'w-6 h-6 border-2';
  } else if (size === 'large') {
    spinnerDimensionsClass = 'w-16 h-16 border-4';
  }

  // Base container styles
  // If isFullScreen is true, we center the spinner in the full viewport height
  let containerClasses = 'flex flex-col items-center justify-center p-6';
  if (isFullScreen) {
    containerClasses = 'flex flex-col items-center justify-center min-h-screen bg-gray-50';
  }

  return (
    <div className={containerClasses} role="status" aria-label="Loading">
      {/* Animated spinning circle using Tailwind CSS utility classes */}
      <div
        className={`${spinnerDimensionsClass} border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />

      {/* Optional helper message below spinner */}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
