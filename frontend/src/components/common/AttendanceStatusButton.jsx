/**
 * AttendanceStatusButton Component
 * 
 * A reusable group of four status buttons (Present, Absent, Late, Excused).
 * Allows teachers to quickly toggle the attendance state of a student.
 * 
 * Props:
 * - selectedStatus: 'present' | 'absent' | 'late' | 'excused'
 * - onStatusChange: function called with the new status value when a button is clicked
 * - isDisabled: optional boolean to disable interaction
 */

import React from 'react';

// Define the 4 valid status options and their color styles
const STATUS_OPTIONS = [
  {
    key: 'present',
    label: 'Present',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
    inactiveClass: 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50',
  },
  {
    key: 'absent',
    label: 'Absent',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    inactiveClass: 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50',
  },
  {
    key: 'late',
    label: 'Late',
    activeClass: 'bg-amber-600 text-white border-amber-600 shadow-sm',
    inactiveClass: 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50',
  },
  {
    key: 'excused',
    label: 'Excused',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-sm',
    inactiveClass: 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50',
  },
];

export default function AttendanceStatusButton({
  selectedStatus = 'present',
  onStatusChange,
  isDisabled = false,
}) {
  return (
    <div className="inline-flex rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {STATUS_OPTIONS.map((option) => {
        const isSelected = selectedStatus === option.key;

        // Apply active color if currently selected, otherwise inactive styling
        let buttonStyle = option.inactiveClass;
        if (isSelected) {
          buttonStyle = option.activeClass;
        }

        return (
          <button
            key={option.key}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (onStatusChange) {
                onStatusChange(option.key);
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold border-r last:border-r-0 transition-all duration-150 focus:outline-none ${buttonStyle} ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
