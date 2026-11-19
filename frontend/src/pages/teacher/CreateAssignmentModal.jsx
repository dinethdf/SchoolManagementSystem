/**
 * Create Assignment Modal Component
 * 
 * Enables teachers to create and post a new homework, classwork, or project.
 * Automatically validates input and initializes pending student submissions.
 * 
 * Follows GEMINI.md Rules:
 * - Simple, step-by-step React Hook Form pattern
 * - Descriptive comments explaining all props and form handlers
 * - Kept under 300 lines (modular component)
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ModalFooter from '../../components/common/ModalFooter';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { createAssignment } from '../../api/assignments';
import { ASSIGNMENT_TYPES } from '../../utils/constants';

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  classList = [],
  subjectList = [],
  onAssignmentCreated,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form with clear default values
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      assignment_type: ASSIGNMENT_TYPES.HOMEWORK,
      school_class: '',
      subject: '',
      max_marks: 20,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    },
  });

  // Handle modal cancellation
  function handleClose() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  // Handle form submission to create assignment
  async function handleFormSubmit(formData) {
    try {
      setIsSubmitting(true);

      // Package payload with integer IDs and trimmed strings
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignment_type: formData.assignment_type,
        school_class: Number(formData.school_class),
        subject: Number(formData.subject),
        max_marks: Number(formData.max_marks),
        due_date: formData.due_date,
      };

      const response = await createAssignment(payload);
      toast.success(response.message || 'Assignment created and distributed to class!');
      reset();
      onClose();

      // Trigger list refresh in parent page
      if (onAssignmentCreated) {
        onAssignmentCreated();
      }
    } catch (err) {
      const errorMsg =
        err?.response?.data?.errors?.title?.[0] ||
        err?.response?.data?.error ||
        'Failed to create assignment. Please check all fields.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Assignment"
      description="Post homework, classwork, or project tasks for your students."
      size="lg"
      footer={
        <ModalFooter
          onCancel={handleClose}
          onSubmit={handleSubmit(handleFormSubmit)}
          submitText="Publish Assignment"
          isSubmitting={isSubmitting}
        />
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Assignment Title */}
        <Input
          label="Assignment Title"
          placeholder="e.g. Chapter 5 Practice Problems"
          {...register('title', { required: 'Please enter an assignment title.' })}
          error={errors.title?.message}
        />

        {/* Two-column layout for Type and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Assignment Type"
            {...register('assignment_type', { required: 'Select a type.' })}
            error={errors.assignment_type?.message}
          >
            <option value={ASSIGNMENT_TYPES.HOMEWORK}>Homework</option>
            <option value={ASSIGNMENT_TYPES.CLASSWORK}>Classwork</option>
            <option value={ASSIGNMENT_TYPES.PROJECT}>Project</option>
          </Select>

          <Input
            type="date"
            label="Due Date"
            {...register('due_date', { required: 'Please choose a due date.' })}
            error={errors.due_date?.message}
          />
        </div>

        {/* Two-column layout for Target Class and Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Target Class"
            {...register('school_class', { required: 'Please select a class.' })}
            error={errors.school_class?.message}
          >
            <option value="">-- Choose Class --</option>
            {classList.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>

          <Select
            label="Subject"
            {...register('subject', { required: 'Please select a subject.' })}
            error={errors.subject?.message}
          >
            <option value="">-- Choose Subject --</option>
            {subjectList.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name} ({subj.code})
              </option>
            ))}
          </Select>
        </div>

        {/* Maximum Marks */}
        <Input
          type="number"
          label="Maximum Marks"
          placeholder="20"
          {...register('max_marks', {
            required: 'Enter max marks.',
            min: { value: 1, message: 'Max marks must be at least 1.' },
          })}
          error={errors.max_marks?.message}
        />

        {/* Instructions / Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions / Questions
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write clear instructions, problem numbers, or questions for students..."
            {...register('description', { required: 'Please provide instructions.' })}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
