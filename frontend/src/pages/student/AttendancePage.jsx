/**
 * Student Attendance Page
 * 
 * Allows students to:
 * 1. View their overall attendance percentage and status distribution.
 * 2. Review their daily attendance record history with teacher remarks.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import AttendanceSummaryCard from '../../components/common/AttendanceSummaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { fetchMyAttendance, fetchMyAttendanceSummary } from '../../api/attendance';

export default function StudentAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadAttendanceData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        // Fetch history and summary in parallel
        const [historyRes, summaryRes] = await Promise.all([
          fetchMyAttendance(),
          fetchMyAttendanceSummary(),
        ]);

        const records = historyRes?.attendance || (Array.isArray(historyRes) ? historyRes : []);
        const summary = summaryRes?.summary || summaryRes;

        setAttendanceRecords(records);
        setSummaryData(summary);
      } catch (err) {
        setErrorMessage('Failed to load your attendance data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    loadAttendanceData();
  }, []);

  // Helper for status badge colors
  function getStatusBadge(status) {
    const s = String(status).toLowerCase();
    if (s === 'present') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Present</span>;
    } else if (s === 'late') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Late</span>;
    } else if (s === 'absent') {
      return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Absent</span>;
    }
    return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Excused</span>;
  }

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner text="Loading your attendance records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My Attendance"
        description="Monitor your school attendance record and session history."
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Metric Card */}
      <AttendanceSummaryCard summary={summaryData} title="My Attendance Rate" />

      {/* Daily Records Table */}
      <SectionCard
        title="Attendance Log"
        description={`Displaying all ${attendanceRecords.length} recorded daily check-ins.`}
      >
        {attendanceRecords.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="Your teachers have not recorded any attendance sessions yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Class / Batch</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.date}</td>
                    <td className="px-5 py-4 text-slate-600">{item.class_name || 'Class Roster'}</td>
                    <td className="px-5 py-4 text-slate-600">{item.subject_name || 'General Session'}</td>
                    <td className="px-5 py-4 text-center">{getStatusBadge(item.status)}</td>
                    <td className="px-5 py-4 text-xs text-slate-500 italic">
                      {item.remarks || 'No notes added'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
