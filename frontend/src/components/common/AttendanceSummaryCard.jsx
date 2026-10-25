/**
 * AttendanceSummaryCard Component
 * 
 * Displays a student's attendance summary metrics with a visual progress bar.
 * Used on Student and Parent dashboards, and the dedicated Attendance page.
 * 
 * Props:
 * - summary: { total_days, present_days, absent_days, late_days, excused_days, attendance_percentage }
 * - title: string, optional header title
 */

import React from 'react';

export default function AttendanceSummaryCard({
  summary,
  title = 'Overall Attendance',
}) {
  // If no summary data is passed yet, provide safe fallbacks
  const totalDays = summary?.total_days || 0;
  const presentDays = summary?.present_days || 0;
  const absentDays = summary?.absent_days || 0;
  const lateDays = summary?.late_days || 0;
  const excusedDays = summary?.excused_days || 0;
  const percentage = Number(summary?.attendance_percentage || 0);

  // Determine indicator color based on percentage
  let progressColor = 'bg-rose-500';
  let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
  let statusText = 'Low Attendance';

  if (percentage >= 85) {
    progressColor = 'bg-emerald-500';
    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    statusText = 'Excellent';
  } else if (percentage >= 75) {
    progressColor = 'bg-blue-500';
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    statusText = 'Good';
  } else if (percentage >= 60) {
    progressColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Needs Attention';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Header with Title and Status Tag */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Based on {totalDays} recorded school sessions</p>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {/* Main Percentage Display & Progress Bar */}
      <div className="py-5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-extrabold text-slate-900">
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-slate-500">
            Target: 85.0%
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>

      {/* Grid of 4 Breakdown Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        {/* Present Days */}
        <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
          <p className="text-xs font-medium text-emerald-800">Present</p>
          <p className="text-xl font-bold text-emerald-900 mt-0.5">{presentDays}</p>
        </div>

        {/* Late Days */}
        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-100">
          <p className="text-xs font-medium text-amber-800">Late</p>
          <p className="text-xl font-bold text-amber-900 mt-0.5">{lateDays}</p>
        </div>

        {/* Absent Days */}
        <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
          <p className="text-xs font-medium text-rose-800">Absent</p>
          <p className="text-xl font-bold text-rose-900 mt-0.5">{absentDays}</p>
        </div>

        {/* Excused Days */}
        <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
          <p className="text-xs font-medium text-blue-800">Excused</p>
          <p className="text-xl font-bold text-blue-900 mt-0.5">{excusedDays}</p>
        </div>
      </div>
    </div>
  );
}
