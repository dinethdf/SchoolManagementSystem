/**
 * Reusable Page Header Component
 * 
 * Placed at the very top of every page/dashboard to provide:
 * 1. Consistent title and subtitle typography
 * 2. An optional primary action button (e.g., "+ Add New Class", "+ Enroll Student")
 * 3. An optional badge or indicator (e.g., "Academic Year 2026-2027")
 * 
 * PROPS:
 * - title: Main heading text (e.g. "Classes & Sections")
 * - subtitle: Helpful one-sentence description below the title
 * - badge: Optional text or badge to show beside title
 * - actionLabel: Optional label for the main action button
 * - onAction: Callback function when action button is clicked
 * - actionVariant: Color style of action button ('primary', 'secondary', 'outline')
 */
import React from 'react';
import Button from './Button';

export default function PageHeader({
  title,
  subtitle = null,
  badge = null,
  actionLabel = null,
  onAction = null,
  actionVariant = 'primary',
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200">
      {/* Left Column: Title, Badge, and Subtitle */}
      <div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>

          {/* Optional inline badge beside the title */}
          {badge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {badge}
            </span>
          )}
        </div>

        {/* Optional descriptive subtitle */}
        {subtitle && (
          <p className="mt-1 text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Column: Optional Action Button */}
      {actionLabel && onAction && (
        <div className="flex items-center space-x-3">
          <Button
            variant={actionVariant}
            size="medium"
            onClick={onAction}
            className="w-full md:w-auto"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
