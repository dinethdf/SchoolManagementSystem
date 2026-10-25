/**
 * GradeLetterBadge Component
 * 
 * Displays a colorful letter grade badge (A, B, C, D, F).
 * Used throughout grade lists, student report cards, and dashboard widgets.
 * 
 * Props:
 * - grade: 'A' | 'B' | 'C' | 'D' | 'F' | string
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 */

import React from 'react';

export default function GradeLetterBadge({ grade = 'N/A', size = 'md' }) {
  const normalizedGrade = String(grade).toUpperCase();

  // Determine styling based on the letter grade
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-300';

  if (normalizedGrade === 'A') {
    colorStyles = 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/20';
  } else if (normalizedGrade === 'B') {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-400/20';
  } else if (normalizedGrade === 'C') {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/20';
  } else if (normalizedGrade === 'D') {
    colorStyles = 'bg-orange-50 text-orange-700 border-orange-300 ring-1 ring-orange-400/20';
  } else if (normalizedGrade === 'F') {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-400/20';
  }

  // Determine font and padding size
  let sizeStyles = 'px-2.5 py-0.5 text-xs font-semibold';
  if (size === 'sm') {
    sizeStyles = 'px-2 py-0.5 text-[11px] font-semibold';
  } else if (size === 'lg') {
    sizeStyles = 'px-3.5 py-1 text-sm font-bold';
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md border font-mono ${sizeStyles} ${colorStyles}`}
    >
      Grade {normalizedGrade}
    </span>
  );
}
