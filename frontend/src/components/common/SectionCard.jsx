/**
 * Reusable Section Card Wrapper Component
 * 
 * Provides a standardized white container for content sections
 * (such as a table of classes, a list of recent students, or a profile summary).
 * 
 * PROPS:
 * - title: Section heading text (e.g., "Active Classes & Sections")
 * - subtitle: Optional explanatory description below the title
 * - actionLabel: Optional text for an action button in the section header
 * - onAction: Function to trigger when header action is clicked
 * - actionElement: Optional custom JSX element placed in the header (e.g. filter buttons)
 * - children: Content inside the section (tables, lists, forms)
 * - className: Additional custom Tailwind styling
 */
import React from 'react';
import Button from './Button';

export default function SectionCard({
  title,
  subtitle = null,
  actionLabel = null,
  onAction = null,
  actionElement = null,
  children,
  className = '',
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden ${className}`}
    >
      {/* 1. Header Section (Title + Optional Action) */}
      {(title || actionLabel || actionElement) && (
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action on the right side of header */}
          <div className="flex items-center space-x-2">
            {actionElement}
            {actionLabel && onAction && (
              <Button variant="outline" size="small" onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Content Body */}
      <div>{children}</div>
    </div>
  );
}
