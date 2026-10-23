/**
 * Reusable Empty State Component
 * 
 * Fulfills Rule 9 of our Beginner-Friendly Coding Standards:
 * "Show an empty state message when a list has no items."
 * 
 * Instead of showing an empty blank space or broken table, this component
 * displays a friendly icon, a clear description of what's missing, and an
 * optional call-to-action button to help the user take the next step.
 * 
 * PROPS:
 * - icon: Emoji or icon element (default: '📋')
 * - title: Heading message (e.g., "No Students Found")
 * - description: Helpful guidance (e.g., "Start by enrolling your first student.")
 * - actionLabel: Optional button label (e.g., "+ Enroll Student")
 * - onAction: Callback when button is clicked
 */
import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon = '📋',
  title = 'No records found',
  description = 'There are currently no items to display in this list.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl shadow-2xs mb-4">
        {icon}
      </div>

      {/* Main Title */}
      <h3 className="text-base font-bold text-gray-900 tracking-tight">
        {title}
      </h3>

      {/* Guidance Description */}
      <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm">
        {description}
      </p>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
