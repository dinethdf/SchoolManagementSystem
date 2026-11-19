/**
 * Student Submit Assignment Modal Component
 * 
 * Allows an enrolled student to read instructions, type their solution,
 * and submit their completed homework to the teacher.
 * 
 * Follows GEMINI.md Rules:
 * - Simple React Hook Form with clear error handling
 * - Descriptive comments explaining all operations
 * - File under 300 lines
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ModalFooter from '../../components/common/ModalFooter';
import DueDateBadge from '../../components/common/DueDateBadge';
import { submitAssignment } from '../../api/assignments';

export default function SubmitAssignmentModal({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      submission_text: '',
    },
  });

  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function handleFormSubmit(formData) {
    if (!assignment?.id) return;

    try {
      setIsSubmitting(true);
      const payload = {
        submission_text: formData.submission_text.trim(),
      };

      const response = await submitAssignment(assignment.id, payload);
      toast.success(response.message || 'Assignment submitted successfully!');
      reset();
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.submission_text?.[0] ||
        err?.response?.data?.error ||
        'Failed to submit assignment. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!assignment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Submit: ${assignment.title}`}
      description={`Subject: ${assignment.subject_name} • Max Marks: ${assignment.max_marks}`}
      size="lg"
      footer={
        <ModalFooter
          onCancel={handleClose}
          onSubmit={handleSubmit(handleFormSubmit)}
          submitText="Turn In Assignment"
          isSubmitting={isSubmitting}
        />
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Due date info banner */}
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <DueDateBadge dueDate={assignment.due_date} isOverdue={assignment.is_overdue} />
          <span className="text-xs text-blue-800 font-medium">
            Teacher: {assignment.assigned_by_name}
          </span>
        </div>

        {/* Teacher Instructions */}
        <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Assignment Instructions:
          </h4>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {assignment.description}
          </p>
        </div>

        {/* Student Solution Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Solution / Answer Text:
          </label>
          <textarea
            rows={6}
            placeholder="Type your complete solution, steps, or answers here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            {...register('submission_text', {
              required: 'Please type your answer before submitting.',
              minLength: {
                value: 5,
                message: 'Your answer should be at least 5 characters long.',
              },
            })}
          />
          {errors.submission_text && (
            <p className="mt-1 text-xs text-rose-600">
              {errors.submission_text.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
