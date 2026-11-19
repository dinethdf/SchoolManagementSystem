/**
 * Teacher Assignments Page
 * 
 * Allows teachers to:
 * 1. View all assignments they have published.
 * 2. Filter by classroom or assignment type (homework, classwork, project).
 * 3. Track submission progress per assignment.
 * 4. Launch the Create Assignment modal.
 * 5. Open the Submissions & Grading modal to grade student work.
 * 
 * Follows GEMINI.md Rules:
 * - Functional components + React hooks
 * - Plain loops and clear state management
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssignmentTypeTag from '../../components/common/AssignmentTypeTag';
import DueDateBadge from '../../components/common/DueDateBadge';
import CreateAssignmentModal from './CreateAssignmentModal';
import AssignmentSubmissionsModal from './AssignmentSubmissionsModal';
import { fetchAssignments } from '../../api/assignments';
import { fetchClasses, fetchSubjects } from '../../api/classes';

export default function TeacherAssignmentsPage() {
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [classList, setClassList] = useState([]);
  const [subjectList, setSubjectList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);

  // -------------------------------------------------------------------------
  // 1. Load initial data (assignments, classes, subjects)
  // -------------------------------------------------------------------------
  async function loadData() {
    try {
      setIsLoading(true);
      const [assignmentsResponse, classesResponse, subjectsResponse] = await Promise.all([
        fetchAssignments(),
        fetchClasses(),
        fetchSubjects(),
      ]);

      const assignmentsData =
        assignmentsResponse?.data || assignmentsResponse?.assignments || [];
      const classesData = classesResponse?.classes || (Array.isArray(classesResponse) ? classesResponse : []);
      const subjectsData = subjectsResponse?.subjects || (Array.isArray(subjectsResponse) ? subjectsResponse : []);

      setAssignmentsList(assignmentsData);
      setClassList(classesData);
      setSubjectList(subjectsData);
    } catch (err) {
      toast.error('Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------------------
  // 2. Filter assignments based on dropdown choices
  // -------------------------------------------------------------------------
  const filteredAssignments = [];
  for (let i = 0; i < assignmentsList.length; i++) {
    const item = assignmentsList[i];
    let matchesClass = true;
    let matchesType = true;

    if (selectedClassId && String(item.school_class) !== String(selectedClassId)) {
      matchesClass = false;
    }
    if (selectedType && item.assignment_type !== selectedType) {
      matchesType = false;
    }

    if (matchesClass && matchesType) {
      filteredAssignments.push(item);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Action Button */}
      <PageHeader
        title="Assignments & Homework"
        subtitle="Publish tasks for your classes, monitor student progress, and grade submissions."
        badge={`${assignmentsList.length} Total`}
        actionLabel="+ Create Assignment"
        onAction={() => setIsCreateModalOpen(true)}
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Filter by Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Classes</option>
              {classList.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Filter by Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="homework">Homework</option>
              <option value="classwork">Classwork</option>
              <option value="project">Project</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <Button variant="outline" size="sm" onClick={loadData}>
          Refresh List
        </Button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading assignments..." />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="Create your first class homework assignment to distribute to students."
          actionLabel="+ Create Assignment"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((assignment) => {
            const totalStudents = assignment.total_students_count || 0;
            const submittedCount = assignment.submitted_count || 0;
            const progressPercentage =
              totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top row: Type Tag & Due Date */}
                  <div className="flex items-center justify-between">
                    <AssignmentTypeTag type={assignment.assignment_type} />
                    <DueDateBadge dueDate={assignment.due_date} />
                  </div>

                  {/* Title & Subject info */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {assignment.subject_name} • <span className="font-medium text-gray-700">{assignment.class_name}</span>
                    </p>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-gray-600 line-clamp-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    {assignment.description}
                  </p>

                  {/* Submission Progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                      <span>Submissions:</span>
                      <strong className="text-gray-900 font-semibold">
                        {submittedCount} / {totalStudents} ({progressPercentage}%)
                      </strong>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action: Open Submissions & Grading Drawer */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Max: <strong>{assignment.max_marks} pts</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedAssignmentForGrading(assignment)}
                  >
                    Review & Grade
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Create Assignment */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        classList={classList}
        subjectList={subjectList}
        onAssignmentCreated={loadData}
      />

      {/* Modal 2: Submissions & Grading */}
      <AssignmentSubmissionsModal
        isOpen={Boolean(selectedAssignmentForGrading)}
        onClose={() => setSelectedAssignmentForGrading(null)}
        assignment={selectedAssignmentForGrading}
        onGradeSubmitted={loadData}
      />
    </div>
  );
}
