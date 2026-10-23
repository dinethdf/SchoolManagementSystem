/**
 * Reusable Status Badge Component
 * 
 * Displays a small, color-coded pill badge indicating an item's status.
 * Used across the system for:
 * - Attendance: 'present', 'absent', 'late', 'excused'
 * - Academic grades: 'pass', 'fail'
 * - Account state: 'active', 'inactive', 'pending'
 * 
 * STANDARDS FOLLOWED:
 * - Rule 1 & 4: Clear if/else logic instead of nested ternaries.
 * - Rule 2: Detailed comments explaining every status color mapping.
 * - Rule 3: Clear, descriptive prop names and variable names.
 * 
 * PROPS:
 * - status: String indicating the current status (e.g. 'present', 'absent')
 * - label: Optional custom display text (defaults to capitalized status string)
 * - size: 'small' or 'medium' (controls padding and font size)
 */
import React from 'react';

export default function StatusBadge({ status = 'pending', label = null, size = 'medium' }) {
  // Normalize the status string to lowercase for safe matching
  const normalizedStatus = status ? String(status).toLowerCase().trim() : 'pending';

  // -------------------------------------------------------------
  // 1. Determine Badge Colors Based on Status
  // -------------------------------------------------------------
  // Default fallback styling (Neutral Gray)
  let badgeClasses = 'bg-gray-100 text-gray-700 border-gray-200';
  let dotColorClass = 'bg-gray-400';
  let defaultDisplayText = 'Pending';

  // Positive Statuses: Green (Present, Active, Pass)
  if (normalizedStatus === 'present' || normalizedStatus === 'active' || normalizedStatus === 'pass') {
    badgeClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColorClass = 'bg-emerald-500';
    if (normalizedStatus === 'present') defaultDisplayText = 'Present';
    if (normalizedStatus === 'active') defaultDisplayText = 'Active';
    if (normalizedStatus === 'pass') defaultDisplayText = 'Passed';
  }
  // Negative Statuses: Red (Absent, Inactive, Fail)
  else if (normalizedStatus === 'absent' || normalizedStatus === 'inactive' || normalizedStatus === 'fail') {
    badgeClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColorClass = 'bg-rose-500';
    if (normalizedStatus === 'absent') defaultDisplayText = 'Absent';
    if (normalizedStatus === 'inactive') defaultDisplayText = 'Inactive';
    if (normalizedStatus === 'fail') defaultDisplayText = 'Failed';
  }
  // Warning Statuses: Amber (Late, Pending, Warning)
  else if (normalizedStatus === 'late' || normalizedStatus === 'pending') {
    badgeClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColorClass = 'bg-amber-500';
    if (normalizedStatus === 'late') defaultDisplayText = 'Late';
    if (normalizedStatus === 'pending') defaultDisplayText = 'Pending';
  }
  // Informational Statuses: Blue / Purple (Excused, Enrolled, Admin)
  else if (normalizedStatus === 'excused' || normalizedStatus === 'enrolled') {
    badgeClasses = 'bg-sky-50 text-sky-700 border-sky-200';
    dotColorClass = 'bg-sky-500';
    if (normalizedStatus === 'excused') defaultDisplayText = 'Excused';
    if (normalizedStatus === 'enrolled') defaultDisplayText = 'Enrolled';
  }

  // -------------------------------------------------------------
  // 2. Determine Size Styling
  // -------------------------------------------------------------
  let sizeClasses = 'px-2.5 py-0.5 text-xs';
  if (size === 'small') {
    sizeClasses = 'px-2 py-0.5 text-[11px]';
  }

  // Use provided custom label if given, otherwise use our calculated friendly text
  const displayText = label !== null && label !== undefined ? label : defaultDisplayText;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${badgeClasses} ${sizeClasses}`}
    >
      {/* Small colored indicator dot */}
      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${dotColorClass}`} />
      {displayText}
    </span>
  );
}
