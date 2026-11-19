/**
 * Due Date Badge Component
 * 
 * Displays the assignment's submission deadline formatted nicely.
 * Highlights with a warning badge if the deadline has passed.
 * 
 * Follows GEMINI.md Rules:
 * - Simple date formatting logic with friendly fallbacks
 * - Explicit conditional checks
 */

import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';

export default function DueDateBadge({ dueDate, isOverdue = false }) {
  if (!dueDate) {
    return <span className="text-gray-400 text-xs">No due date</span>;
  }

  // Format date string safely into readable format (e.g. "Nov 20, 2026")
  let formattedDateString = dueDate;
  try {
    const dateObject = new Date(dueDate + 'T00:00:00');
    if (!isNaN(dateObject.getTime())) {
      formattedDateString = dateObject.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  } catch (err) {
    formattedDateString = dueDate;
  }

  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle size={12} className="shrink-0 text-rose-600" />
        <span>Overdue: {formattedDateString}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <Calendar size={13} className="text-gray-400 shrink-0" />
      <span>Due: <strong className="font-medium text-gray-800">{formattedDateString}</strong></span>
    </span>
  );
}
