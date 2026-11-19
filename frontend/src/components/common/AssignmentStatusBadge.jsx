/**
 * Assignment Status Badge Component
 * 
 * Displays a color-coded status badge for homework & assignment submissions:
 * - 'pending'   -> Amber badge (Awaiting student submission)
 * - 'submitted' -> Blue badge (Turned in on time)
 * - 'late'      -> Rose badge (Turned in past deadline)
 * - 'graded'    -> Emerald badge (Evaluated with marks)
 * 
 * Follows GEMINI.md Rules:
 * - Simplicity over cleverness (clear if/else checks)
 * - Full comments explaining each status color mapping
 * - Descriptive variable and prop names
 */

import React from 'react';
import { Clock, CheckCircle2, AlertCircle, Award } from 'lucide-react';

export default function AssignmentStatusBadge({ status = 'pending', size = 'medium' }) {
  // Normalize status string to lowercase
  const normalizedStatus = status ? String(status).toLowerCase().trim() : 'pending';

  // -------------------------------------------------------------------------
  // 1. Determine Badge Styling, Icon, and Label Based on Status
  // -------------------------------------------------------------------------
  let containerClasses = 'bg-gray-100 text-gray-700 border-gray-200';
  let labelText = 'Pending';
  let IconComponent = Clock;

  if (normalizedStatus === 'pending') {
    containerClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    labelText = 'Pending';
    IconComponent = Clock;
  } else if (normalizedStatus === 'submitted') {
    containerClasses = 'bg-blue-50 text-blue-700 border-blue-200';
    labelText = 'Submitted';
    IconComponent = CheckCircle2;
  } else if (normalizedStatus === 'late') {
    containerClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    labelText = 'Late Submission';
    IconComponent = AlertCircle;
  } else if (normalizedStatus === 'graded') {
    containerClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    labelText = 'Graded';
    IconComponent = Award;
  }

  // -------------------------------------------------------------------------
  // 2. Determine Size Styling
  // -------------------------------------------------------------------------
  let sizeClasses = 'px-2.5 py-1 text-xs gap-1.5';
  let iconSize = 13;
  if (size === 'small') {
    sizeClasses = 'px-2 py-0.5 text-[11px] gap-1';
    iconSize = 11;
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs ${containerClasses} ${sizeClasses}`}
    >
      <IconComponent size={iconSize} className="shrink-0" />
      <span>{labelText}</span>
    </span>
  );
}
