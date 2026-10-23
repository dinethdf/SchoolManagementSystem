/**
 * Reusable Statistic / Metric Card Component
 * 
 * Used across Admin, Teacher, Student, and Parent dashboards to display:
 * 1. High-level metric value (e.g., "128", "94.2%")
 * 2. Visual icon with color-coded background
 * 3. Contextual label and subtitle/trend hint
 * 
 * PROPS:
 * - label: Description of the metric (e.g. "Total Classes", "Enrolled Students")
 * - value: The numerical or text value to display (e.g. 14, "94.5%")
 * - icon: Emoji or icon element (e.g. "🏫", "🎓")
 * - hint: Helpful explanation text below the number (e.g. "Active in 2026-2027")
 * - trend: Optional trend indicator (e.g. "↑ 4 new", "Above required 85%")
 * - trendType: 'positive' (green), 'negative' (red), 'neutral' (gray)
 * - accentColor: 'indigo', 'purple', 'emerald', 'blue', 'amber'
 * - isLoading: Boolean - shows a placeholder while fetching
 */
import React from 'react';

export default function StatCard({
  label,
  value,
  icon = '📊',
  hint = null,
  trend = null,
  trendType = 'neutral',
  accentColor = 'indigo',
  isLoading = false,
}) {
  // -------------------------------------------------------------
  // 1. Accent Color Styling for the Icon Badge
  // -------------------------------------------------------------
  let iconBackgroundClass = 'bg-indigo-50 text-indigo-600 border-indigo-100';

  if (accentColor === 'purple') {
    iconBackgroundClass = 'bg-purple-50 text-purple-600 border-purple-100';
  } else if (accentColor === 'emerald') {
    iconBackgroundClass = 'bg-emerald-50 text-emerald-600 border-emerald-100';
  } else if (accentColor === 'blue') {
    iconBackgroundClass = 'bg-blue-50 text-blue-600 border-blue-100';
  } else if (accentColor === 'amber') {
    iconBackgroundClass = 'bg-amber-50 text-amber-600 border-amber-100';
  }

  // -------------------------------------------------------------
  // 2. Trend Text Color Styling
  // -------------------------------------------------------------
  let trendColorClass = 'text-gray-500';
  if (trendType === 'positive') {
    trendColorClass = 'text-emerald-600 font-medium';
  } else if (trendType === 'negative') {
    trendColorClass = 'text-rose-600 font-medium';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition duration-150 ease-in-out flex flex-col justify-between">
      {/* Top Row: Label and Icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl border shadow-2xs ${iconBackgroundClass}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Middle Row: Large Value Display */}
      <div className="mt-4">
        {isLoading ? (
          // Loading placeholder
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {value !== null && value !== undefined ? value : 0}
          </p>
        )}
      </div>

      {/* Bottom Row: Optional Trend or Subtitle Hint */}
      {(hint || trend) && (
        <div className="mt-2 text-xs flex items-center space-x-1.5">
          {trend && <span className={trendColorClass}>{trend}</span>}
          {trend && hint && <span className="text-gray-300">&bull;</span>}
          {hint && <span className="text-gray-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
