/**
 * Common Reusable Modal Dialog Component
 * 
 * Displays a popup dialog centered over the screen with a darkened backdrop.
 * Used for creating new records, editing profiles, or confirmation dialogs.
 * 
 * PROPS:
 * - isOpen: Boolean - controls whether the modal is visible
 * - onClose: Function - called when the user clicks the close button or background
 * - title: Text displayed in the modal header
 * - children: The form or content displayed inside the modal body
 * - maxWidth: Tailwind max-width class (e.g. 'max-w-lg', 'max-w-2xl')
 */
import React, { useEffect } from 'react';

export default function Modal({
  isOpen = false,
  onClose,
  title = '',
  children,
  maxWidth = 'max-w-lg',
}) {
  // Close the modal when the user presses the 'Escape' key on their keyboard
  useEffect(function () {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    // Clean up listener when modal unmounts or closes
    return function () {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* 1. Backdrop Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* 2. Modal Dialog Card */}
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 w-full ${maxWidth}`}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3
              id="modal-title"
              className="text-lg font-bold text-gray-900"
            >
              {title}
            </h3>
            {/* Close 'X' Button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                aria-label="Close dialog"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
