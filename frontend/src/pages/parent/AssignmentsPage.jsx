/**
 * Parent Assignments Page
 * 
 * Allows parents and guardians to:
 * 1. Switch between enrolled children.
 * 2. Monitor child's pending assignments and overdue deadlines.
 * 3. Inspect graded homework scores and teacher remarks.
 * 
 * Follows GEMINI.md Rules:
 * - Direct, readable data flow with loops and simple state
 * - Clear comments explaining the child selection and metric calculation
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssignmentStatusBadge from '../../components/common/AssignmentStatusBadge';
import DueDateBadge from '../../components/common/DueDateBadge';
import { fetchParentChildAssignments } from '../../api/assignments';

export default function ParentAssignmentsPage() {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // -------------------------------------------------------------------------
  // 1. Fetch all children's assignments
  // -------------------------------------------------------------------------
  async function loadData() {
    try {
      setIsLoading(true);
      const response = await fetchParentChildAssignments();
      const list = response?.data || response?.children || [];
      setChildrenList(list);

      // Auto-select the first child
      if (list.length > 0) {
        setSelectedStudentId(String(list[0].student_id));
      }
    } catch (err) {
      toast.error('Failed to load assignments for your children.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------------------
  // 2. Find currently selected child object
  // -------------------------------------------------------------------------
  let selectedChild = null;
  for (let i = 0; i < childrenList.length; i++) {
    if (String(childrenList[i].student_id) === String(selectedStudentId)) {
      selectedChild = childrenList[i];
      break;
    }
  }

  // Calculate summary metrics for the selected child
  let pendingCount = 0;
  let gradedCount = 0;
  let overdueCount = 0;

  const childAssignments = selectedChild?.assignments || [];
  for (let i = 0; i < childAssignments.length; i++) {
    const item = childAssignments[i];
    if (item.status === 'pending') {
      pendingCount = pendingCount + 1;
      if (item.is_overdue) {
        overdueCount = overdueCount + 1;
      }
    } else if (item.status === 'graded') {
      gradedCount = gradedCount + 1;
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Children's Homework & Assignments"
        subtitle="Track deadlines, review submissions, and view teacher feedback for your children."
      />

      {/* Child Selector (if parent has multiple children) */}
      {childrenList.length > 1 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-700">
            Select Child:
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            {childrenList.map((child) => (
              <option key={child.student_id} value={child.student_id}>
                {child.student_name} ({child.class_name})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading homework records..." />
        </div>
      ) : !selectedChild || childAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="Your child currently has no assigned homework records in the system."
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-gray-500 font-semibold uppercase">Total Assigned</span>
              <p className="text-2xl font-bold text-gray-900 mt-1">{childAssignments.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-amber-600 font-semibold uppercase">Pending Tasks</span>
              <p className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-emerald-600 font-semibold uppercase">Graded Work</span>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{gradedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs text-rose-600 font-semibold uppercase">Overdue Tasks</span>
              <p className="text-2xl font-bold text-rose-700 mt-1">{overdueCount}</p>
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {childAssignments.map((item) => (
              <div
                key={item.assignment_id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Subject: <strong className="text-gray-700">{item.subject_name}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <DueDateBadge dueDate={item.due_date} isOverdue={item.is_overdue} />
                    <AssignmentStatusBadge status={item.status} />
                  </div>
                </div>

                {/* Score & Remarks */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Grade / Marks:
                    </span>
                    <p className="text-base font-bold text-gray-900 mt-0.5">
                      {item.marks_obtained !== null && item.marks_obtained !== undefined ? (
                        <span className="text-emerald-700 font-bold">
                          {item.marks_obtained} / {item.max_marks} marks
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Not graded yet</span>
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-9">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Teacher Feedback:
                    </span>
                    <p className="text-xs text-gray-700 italic mt-0.5">
                      {item.teacher_feedback || 'No remarks provided.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
