/**
 * Admin Classes & Sections Management Page
 * 
 * Allows School Administrators to:
 * 1. View all configured grade levels, sections, and room allocations.
 * 2. Create a new SchoolClass record using an interactive Modal form.
 * 
 * USES:
 * - PageHeader
 * - Table (with StatusBadge and action buttons)
 * - Modal + FormSection for creating classes
 * - createClass API with TanStack Query useMutation
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fetchClasses, createClass } from '../../api/classes';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import FormSection from '../../components/common/FormSection';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ClassesPage() {
  const queryClient = useQueryClient();

  // State to control visibility of "Add Class" modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize React Hook Form for new class creation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      grade_level: '10',
      section: 'A',
      academic_year: '2026-2027',
      room_number: '',
    },
  });

  // -----------------------------------------------------------
  // Step 1: Fetch Classes using TanStack Query
  // -----------------------------------------------------------
  const classesQuery = useQuery({
    queryKey: ['adminClassesList'],
    queryFn: fetchClasses,
  });

  // Extract classes array safely from backend response
  let classList = [];
  if (Array.isArray(classesQuery.data)) {
    classList = classesQuery.data;
  } else if (classesQuery.data && Array.isArray(classesQuery.data.classes)) {
    classList = classesQuery.data.classes;
  }

  // -----------------------------------------------------------
  // Step 2: Create Class Mutation
  // -----------------------------------------------------------
  const createClassMutation = useMutation({
    mutationFn: createClass,
    onSuccess: function (response) {
      toast.success(response.message || 'Class created successfully!');
      // Invalidate query to auto-refresh table
      queryClient.invalidateQueries({ queryKey: ['adminClassesList'] });
      // Reset form and close modal
      reset();
      setIsAddModalOpen(false);
    },
    onError: function (error) {
      let message = 'Failed to create class. Please check your inputs.';
      if (error.response && error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      toast.error(message);
    },
  });

  // Form submit handler
  function onSubmitNewClass(formData) {
    createClassMutation.mutate({
      name: formData.name,
      grade_level: parseInt(formData.grade_level, 10),
      section: formData.section.toUpperCase(),
      academic_year: formData.academic_year,
      room_number: formData.room_number || '',
    });
  }

  // -----------------------------------------------------------
  // Step 3: Table Column Definitions
  // -----------------------------------------------------------
  const columns = [
    {
      key: 'name',
      header: 'Class Name',
      render: function (row) {
        return (
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
              {row.section || 'A'}
            </span>
            <span className="font-bold text-gray-900">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'grade_level',
      header: 'Grade',
      render: (row) => <span>Grade {row.grade_level}</span>,
    },
    {
      key: 'section',
      header: 'Section',
      render: (row) => (
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
          Section {row.section}
        </span>
      ),
    },
    {
      key: 'academic_year',
      header: 'Academic Year',
    },
    {
      key: 'room_number',
      header: 'Room',
      render: (row) => <span>{row.room_number || 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" label="In Session" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage grade levels, section divisions, and classroom room allocations."
        badge={`${classList.length} Total`}
        actionLabel="+ Add New Class"
        onAction={() => setIsAddModalOpen(true)}
      />

      {/* 2. Classes Table */}
      <Table
        columns={columns}
        data={classList}
        isLoading={classesQuery.isLoading}
        emptyTitle="No classes created yet"
        emptyDescription="Create your first grade level and section to begin allocating students."
        emptyActionLabel="+ Add First Class"
        onEmptyAction={() => setIsAddModalOpen(true)}
      />

      {/* 3. Add New Class Modal Dialog */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New School Class"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmitNewClass)} className="space-y-4">
          <FormSection
            title="Class Information"
            description="Specify the title, academic year, and room location for this section."
            columns={2}
          >
            <Input
              label="Class Name"
              name="name"
              placeholder="e.g. Grade 10-A"
              isRequired={true}
              error={errors.name ? errors.name.message : null}
              {...register('name', { required: 'Class name is required' })}
            />

            <div>
              <label htmlFor="grade_level" className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <select
                id="grade_level"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...register('grade_level', { required: 'Please select grade' })}
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
                <option value="6">Grade 6</option>
                <option value="7">Grade 7</option>
                <option value="8">Grade 8</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
                <option value="11">Grade 11</option>
                <option value="12">Grade 12</option>
              </select>
            </div>

            <Input
              label="Section"
              name="section"
              placeholder="e.g. A, B, C"
              isRequired={true}
              error={errors.section ? errors.section.message : null}
              {...register('section', { required: 'Section is required' })}
            />

            <Input
              label="Academic Year"
              name="academic_year"
              placeholder="e.g. 2026-2027"
              isRequired={true}
              error={errors.academic_year ? errors.academic_year.message : null}
              {...register('academic_year', { required: 'Academic year is required' })}
            />

            <Input
              label="Room Number / Hall"
              name="room_number"
              placeholder="e.g. Room 101, Science Lab 2"
              {...register('room_number')}
            />
          </FormSection>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="small"
              onClick={() => setIsAddModalOpen(false)}
              disabled={createClassMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="small"
              isLoading={createClassMutation.isPending}
            >
              Save Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
