/**
 * Student Assignments Page
 * 
 * Allows students to:
 * 1. View all pending assignments assigned to their class.
 * 2. Submit solutions with step-by-step written work.
 * 3. View submitted work, awarded marks, and feedback from teachers.
 * 
 * Follows GEMINI.md Rules:
 * - Simple state management with tabs
 * - Plain loops and clear if/else conditional rendering
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssignmentStatusBadge from '../../components/common/AssignmentStatusBadge';
import AssignmentTypeTag from '../../components/common/AssignmentTypeTag';
import DueDateBadge from '../../components/common/DueDateBadge';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import { fetchStudentAssignments } from '../../api/assignments';

export default function StudentAssignmentsPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState(null);

  // -------------------------------------------------------------------------
  // 1. Fetch current student's assignments
  // -------------------------------------------------------------------------
  async function loadAssignments() {
    try {
      setIsLoading(true);
      const response = await fetchStudentAssignments();
      const list = response?.data || response?.assignments || [];
      setAssignmentsList(list);
    } catch (err) {
      toast.error('Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  // -------------------------------------------------------------------------
  // 2. Separate into Pending vs Completed items
  // -------------------------------------------------------------------------
  const pendingAssignments = [];
  const completedAssignments = [];

  for (let i = 0; i < assignmentsList.length; i++) {
    const item = assignmentsList[i];
    if (item.submission_status === 'pending') {
      pendingAssignments.push(item);
    } else {
      completedAssignments.push(item);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="My Assignments & Homework"
        subtitle="Review upcoming deadlines, turn in your solutions, and check teacher grades."
        badge={`${assignmentsList.length} Total`}
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>Pending Tasks</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-800">
            {pendingAssignments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'completed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <span>Turned In & Graded</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800">
            {completedAssignments.length}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading your homework roster..." />
        </div>
      ) : activeTab === 'pending' ? (
        // =====================================================================
        // Tab 1: Pending Assignments
        // =====================================================================
        pendingAssignments.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="You have no pending assignments right now. Great job!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <AssignmentTypeTag type={assignment.assignment_type} />
                    <DueDateBadge
                      dueDate={assignment.due_date}
                      isOverdue={assignment.is_overdue}
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {assignment.subject_name} • Instructor: {assignment.assigned_by_name}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {assignment.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Worth: <strong>{assignment.max_marks} marks</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedAssignmentForSubmit(assignment)}
                  >
                    Submit Solution
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // =====================================================================
        // Tab 2: Completed / Graded Assignments
        // =====================================================================
        completedAssignments.length === 0 ? (
          <EmptyState
            title="No completed work yet"
            description="Turn in your pending homework assignments to view them here."
          />
        ) : (
          <div className="space-y-4">
            {completedAssignments.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.subject_name} • Due Date: {item.due_date}
                    </p>
                  </div>
                  <AssignmentStatusBadge status={item.submission_status} />
                </div>

                {/* Score & Teacher Feedback Box */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Score:
                    </span>
                    <p className="text-lg font-bold text-gray-900">
                      {item.marks_obtained !== null && item.marks_obtained !== undefined ? (
                        <span className="text-emerald-700">
                          {item.marks_obtained} / {item.max_marks} marks
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Awaiting grading</span>
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-9">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Teacher Remarks:
                    </span>
                    <p className="text-xs text-gray-700 italic">
                      {item.teacher_feedback || 'No remarks entered yet.'}
                    </p>
                  </div>
                </div>

                {/* Student's submitted text preview */}
                <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-100">
                  <strong className="text-gray-700 block mb-1">Your Submitted Answer:</strong>
                  <p className="whitespace-pre-wrap">{item.submission_text}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Submit Assignment Modal */}
      <SubmitAssignmentModal
        isOpen={Boolean(selectedAssignmentForSubmit)}
        onClose={() => setSelectedAssignmentForSubmit(null)}
        assignment={selectedAssignmentForSubmit}
        onSuccess={loadAssignments}
      />
    </div>
  );
}
