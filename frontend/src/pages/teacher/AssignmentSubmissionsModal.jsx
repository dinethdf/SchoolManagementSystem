/**
 * Assignment Submissions & Grading Modal
 * 
 * Enables teachers to review all student submissions for a selected assignment,
 * read their written solutions, award marks, and provide constructive feedback.
 * 
 * Follows GEMINI.md Rules:
 * - Simple React patterns (useState, standard loops and handlers)
 * - Clear inline comments explaining submission grading logic
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AssignmentStatusBadge from '../../components/common/AssignmentStatusBadge';
import { fetchAssignmentSubmissions, gradeSubmission } from '../../api/assignments';

export default function AssignmentSubmissionsModal({
  isOpen,
  onClose,
  assignment,
  onGradeSubmitted,
}) {
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gradingSubId, setGradingSubId] = useState(null);

  // Local state map for grading inputs: { [submissionId]: { marks: '', feedback: '' } }
  const [gradeInputs, setGradeInputs] = useState({});

  // -------------------------------------------------------------------------
  // Fetch submissions when modal opens with a valid assignment
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function loadSubmissions() {
      if (!assignment?.id || !isOpen) return;
      try {
        setIsLoading(true);
        const response = await fetchAssignmentSubmissions(assignment.id);
        const list = response?.data || response?.submissions || [];
        setSubmissionsList(list);

        // Pre-fill grading inputs for each submission
        const initialInputs = {};
        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          initialInputs[item.id] = {
            marks: item.marks_obtained !== null ? String(item.marks_obtained) : '',
            feedback: item.teacher_feedback || '',
          };
        }
        setGradeInputs(initialInputs);
      } catch (err) {
        toast.error('Failed to load student submissions.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmissions();
  }, [assignment?.id, isOpen]);

  // Update marks or feedback input for a specific student submission
  function handleInputChange(submissionId, field, value) {
    setGradeInputs((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [field]: value,
      },
    }));
  }

  // Submit grade for a single submission
  async function handleSaveGrade(submissionId) {
    const currentInput = gradeInputs[submissionId];
    if (!currentInput || currentInput.marks === '') {
      toast.error('Please enter marks before saving.');
      return;
    }

    const marksNum = Number(currentInput.marks);
    if (isNaN(marksNum) || marksNum < 0) {
      toast.error('Please enter a valid positive number for marks.');
      return;
    }

    if (marksNum > assignment.max_marks) {
      toast.error(`Marks cannot exceed maximum allowed (${assignment.max_marks}).`);
      return;
    }

    try {
      setGradingSubId(submissionId);
      await gradeSubmission(assignment.id, submissionId, {
        marks_obtained: marksNum,
        teacher_feedback: currentInput.feedback.trim(),
      });

      toast.success('Grade recorded successfully!');

      // Update the local submission status
      setSubmissionsList((prevList) => {
        const updatedList = [];
        for (let i = 0; i < prevList.length; i++) {
          const item = prevList[i];
          if (item.id === submissionId) {
            updatedList.push({
              ...item,
              marks_obtained: marksNum,
              teacher_feedback: currentInput.feedback.trim(),
              status: 'graded',
            });
          } else {
            updatedList.push(item);
          }
        }
        return updatedList;
      });

      if (onGradeSubmitted) {
        onGradeSubmitted();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Failed to save grade.';
      toast.error(errorMsg);
    } finally {
      setGradingSubId(null);
    }
  }

  if (!assignment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submissions: ${assignment.title}`}
      description={`Review student answers for ${assignment.subject_name || 'Subject'} (${assignment.class_name || 'Class'}). Maximum Marks: ${assignment.max_marks}.`}
      size="2xl"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" message="Loading class roster and submissions..." />
          </div>
        ) : submissionsList.length === 0 ? (
          <EmptyState
            title="No submissions found"
            description="No students are enrolled in this class or assigned to this task."
          />
        ) : (
          <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto pr-1">
            {submissionsList.map((submission) => {
              const currentInput = gradeInputs[submission.id] || { marks: '', feedback: '' };
              const isPending = submission.status === 'pending';

              return (
                <div key={submission.id} className="py-4 space-y-3">
                  {/* Student row header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {submission.student_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Admission No: {submission.admission_number}
                        {submission.roll_number && ` • Roll: ${submission.roll_number}`}
                      </p>
                    </div>
                    <AssignmentStatusBadge status={submission.status} />
                  </div>

                  {/* Student written solution preview */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Student's Answer:
                    </p>
                    {isPending ? (
                      <p className="text-xs italic text-gray-400">
                        Student has not submitted their work yet.
                      </p>
                    ) : (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {submission.submission_text || 'Empty submission.'}
                      </p>
                    )}
                  </div>

                  {/* Teacher Grading Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center pt-1">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-600 mb-0.5">
                        Marks (Max: {assignment.max_marks})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={assignment.max_marks}
                        step="0.5"
                        placeholder="0"
                        value={currentInput.marks}
                        onChange={(e) => handleInputChange(submission.id, 'marks', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-xs font-medium text-gray-600 mb-0.5">
                        Feedback / Remarks
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Well reasoned, check problem 3."
                        value={currentInput.feedback}
                        onChange={(e) => handleInputChange(submission.id, 'feedback', e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 pt-5">
                      <Button
                        size="sm"
                        variant={submission.status === 'graded' ? 'outline' : 'primary'}
                        className="w-full"
                        isLoading={gradingSubId === submission.id}
                        onClick={() => handleSaveGrade(submission.id)}
                      >
                        {submission.status === 'graded' ? 'Update Grade' : 'Save Grade'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
