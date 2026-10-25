/**
 * Parent Attendance Monitoring Page
 * 
 * Allows parents to:
 * 1. Switch between enrolled children linked to their account.
 * 2. View attendance rate and absence counts for the selected child.
 * 3. Inspect recent check-in dates and remarks.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import AttendanceSummaryCard from '../../components/common/AttendanceSummaryCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { fetchMyChildrenAttendance } from '../../api/attendance';

export default function ParentAttendancePage() {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadChildrenAttendance() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetchMyChildrenAttendance();
        const children = response?.children || [];
        setChildrenList(children);
      } catch (err) {
        setErrorMessage('Failed to load children attendance data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadChildrenAttendance();
  }, []);

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
        <LoadingSpinner text="Loading your children's attendance records..." />
      </div>
    );
  }

  if (childrenList.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Child Attendance" description="Track your child's school attendance." />
        <EmptyState
          title="No children linked"
          description="There are currently no student accounts linked to your guardian profile. Please contact the school administration."
        />
      </div>
    );
  }

  const activeChild = childrenList[selectedChildIndex] || childrenList[0];
  const attendanceRecords = activeChild?.attendance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Child Attendance Monitoring"
        description="Review attendance records and absence history for your enrolled children."
      />

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl text-sm font-medium bg-rose-50 text-rose-800 border border-rose-200">
          {errorMessage}
        </div>
      )}

      {/* Child Selector Tabs (if multiple children) */}
      {childrenList.length > 1 && (
        <div className="flex border-b border-slate-200 gap-3 pb-2">
          {childrenList.map((child, idx) => (
            <button
              key={child.student_id || idx}
              onClick={() => setSelectedChildIndex(idx)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                selectedChildIndex === idx
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {child.student_name} ({child.class_name})
            </button>
          ))}
        </div>
      )}

      {/* Child Profile Information Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{activeChild.student_name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Admission #: <span className="font-mono font-medium text-slate-700">{activeChild.admission_number}</span> | Class: <span className="font-medium text-slate-700">{activeChild.class_name}</span>
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full self-start sm:self-auto">
          Enrolled Student
        </span>
      </div>

      {/* Attendance Summary */}
      <AttendanceSummaryCard
        summary={activeChild.summary}
        title={`${activeChild.student_name}'s Attendance Rate`}
      />

      {/* Daily Records Log */}
      <SectionCard
        title="Daily Attendance History"
        description={`Showing all ${attendanceRecords.length} recorded check-ins.`}
      >
        {attendanceRecords.length === 0 ? (
          <EmptyState
            title="No records found"
            description="No attendance sessions have been logged for this student yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Class</th>
                  <th className="px-5 py-3.5">Subject</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">{item.date}</td>
                    <td className="px-5 py-4 text-slate-600">{item.class_name || 'Class Roster'}</td>
                    <td className="px-5 py-4 text-slate-600">{item.subject_name || 'General'}</td>
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
