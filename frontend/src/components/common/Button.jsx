/**
 * Common Reusable Button Component
 * 
 * This component provides a styled, consistent button across the whole application.
 * It supports different color styles (variants), sizes, disabled states,
 * and an automatic loading spinner when an action is in progress.
 * 
 * PROPS:
 * - children: The button text or content (e.g., "Submit", "Cancel")
 * - type: HTML button type ('button', 'submit', 'reset') - defaults to 'button'
 * - variant: Visual style ('primary', 'secondary', 'danger', 'outline') - defaults to 'primary'
 * - size: Size of the button ('small', 'medium', 'large') - defaults to 'medium'
 * - isLoading: If true, displays a small spinner and disables clicking
 * - disabled: If true, disables the button and grays it out
 * - onClick: Function to run when the button is clicked
 * - className: Any extra custom Tailwind CSS classes
 */
import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...otherProps
}) {
  // -------------------------------------------------------------
  // 1. Determine size styling classes
  // -------------------------------------------------------------
  let sizeClasses = 'px-4 py-2 text-sm'; // default medium size

  if (size === 'small') {
    sizeClasses = 'px-3 py-1.5 text-xs';
  } else if (size === 'large') {
    sizeClasses = 'px-6 py-3 text-base';
  }

  // -------------------------------------------------------------
  // 2. Determine color variant styling classes
  // -------------------------------------------------------------
  let variantClasses = 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500';

  if (variant === 'secondary') {
    variantClasses = 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400';
  } else if (variant === 'danger') {
    variantClasses = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
  } else if (variant === 'outline') {
    variantClasses = 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500';
  }

  // -------------------------------------------------------------
  // 3. Determine if button is inactive (disabled or loading)
  // -------------------------------------------------------------
  const isButtonDisabled = disabled || isLoading;

  // Disabled styling: lower opacity and show 'not-allowed' cursor
  const disabledClasses = isButtonDisabled
    ? 'opacity-60 cursor-not-allowed'
    : 'cursor-pointer active:scale-95';

  return (
    <button
      type={type}
      disabled={isButtonDisabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      {...otherProps}
    >
      {/* If isLoading is true, show a small rotating spinner inside the button */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Render the button's content */}
      {children}
    </button>
  );
}
