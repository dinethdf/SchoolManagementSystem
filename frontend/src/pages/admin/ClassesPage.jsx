import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createClass, createSubject, fetchClasses } from '../../api/classes';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ModalFooter from '../../components/common/ModalFooter';
import FormSection from '../../components/common/FormSection';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

const CLASS_DEFAULTS = {
  name: '',
  grade_level: '10',
  section: 'A',
  academic_year: '2026-2027',
  room_number: '',
};

const SUBJECT_DEFAULTS = {
  name: '',
  code: '',
  description: '',
  periods_per_week: '5',
  school_class_id: '',
};

function getErrorMessage(error, fallback) {
  const data = error.response?.data;
  const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return firstError || data?.message || error.message || fallback;
}

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const classesQuery = useQuery({ queryKey: ['adminClassesList'], queryFn: fetchClasses });
  const classForm = useForm({ defaultValues: CLASS_DEFAULTS });
  const subjectForm = useForm({ defaultValues: SUBJECT_DEFAULTS });

  const classList = Array.isArray(classesQuery.data)
    ? classesQuery.data
    : classesQuery.data?.classes || [];

  const createClassMutation = useMutation({
    mutationFn: createClass,
    onSuccess: (response) => {
      toast.success(response.message || 'Class created successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminClassesList'] });
      classForm.reset(CLASS_DEFAULTS);
      setIsClassModalOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to create class.')),
  });

  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: (response) => {
      toast.success(response.message || 'Subject created successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminClassesList'] });
      queryClient.invalidateQueries({ queryKey: ['adminSubjectsList'] });
      subjectForm.reset(SUBJECT_DEFAULTS);
      setIsSubjectModalOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to create subject.')),
  });

  const columns = [
    {
      key: 'name',
      header: 'Class Name',
      render: (row) => (
        <div className="flex items-center space-x-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-200 bg-purple-100 text-xs font-bold text-purple-700">{row.section || 'A'}</span>
          <span className="font-bold text-gray-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'grade_level', header: 'Grade', render: (row) => <span>Grade {row.grade_level}</span> },
    {
      key: 'section',
      header: 'Section',
      render: (row) => <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800">Section {row.section}</span>,
    },
    { key: 'academic_year', header: 'Academic Year' },
    { key: 'room_number', header: 'Room', render: (row) => <span>{row.room_number || 'N/A'}</span> },
    { key: 'total_subjects', header: 'Subjects', render: (row) => <span>{row.total_subjects ?? row.subjects?.length ?? 0}</span> },
    { key: 'status', header: 'Status', render: () => <StatusBadge status="active" label="In Session" /> },
  ];

  function closeClassModal() {
    if (createClassMutation.isPending) return;
    classForm.reset(CLASS_DEFAULTS);
    setIsClassModalOpen(false);
  }

  function closeSubjectModal() {
    if (createSubjectMutation.isPending) return;
    subjectForm.reset(SUBJECT_DEFAULTS);
    setIsSubjectModalOpen(false);
  }

  function submitClass(values) {
    createClassMutation.mutate({
      name: values.name.trim(),
      grade_level: Number(values.grade_level),
      section: values.section.trim().toUpperCase(),
      academic_year: values.academic_year.trim(),
      room_number: values.room_number.trim(),
    });
  }

  function submitSubject(values) {
    createSubjectMutation.mutate({
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim(),
      periods_per_week: Number(values.periods_per_week),
      school_class_id: Number(values.school_class_id),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <PageHeader
            title="Classes & Sections"
            subtitle="Manage grade levels, section divisions, subjects, and classroom allocations."
            badge={`${classList.length} Total`}
            actionLabel="+ Add New Class"
            onAction={() => setIsClassModalOpen(true)}
          />
        </div>
        <Button variant="outline" onClick={() => setIsSubjectModalOpen(true)} className="shrink-0">
          + Add Subject
        </Button>
      </div>

      <Table
        columns={columns}
        data={classList}
        isLoading={classesQuery.isLoading}
        emptyTitle="No classes created yet"
        emptyDescription="Create your first grade level and section to begin allocating students."
        emptyActionLabel="+ Add First Class"
        onEmptyAction={() => setIsClassModalOpen(true)}
      />

      <Modal
        isOpen={isClassModalOpen}
        onClose={closeClassModal}
        title="Add New School Class"
        description="Set up a grade, section, academic year, and classroom."
        size="lg"
        isLoading={createClassMutation.isPending}
        footer={<ModalFooter onCancel={closeClassModal} submitFormId="create-class-form" submitLabel="Save Class" isLoading={createClassMutation.isPending} />}
      >
        <form id="create-class-form" onSubmit={classForm.handleSubmit(submitClass)}>
          <FormSection title="Class Information" description="Fields marked required must be completed." columns={2}>
            <Input label="Class name" name="name" placeholder="e.g. Grade 10-A" isRequired error={classForm.formState.errors.name?.message} {...classForm.register('name', { required: 'Class name is required' })} />
            <Select
              label="Grade level"
              name="grade_level"
              isRequired
              options={Array.from({ length: 13 }, (_, index) => ({ value: String(index + 1), label: `Grade ${index + 1}` }))}
              error={classForm.formState.errors.grade_level?.message}
              {...classForm.register('grade_level', { required: 'Please select a grade' })}
            />
            <Input label="Section" name="section" placeholder="A, B, C" isRequired error={classForm.formState.errors.section?.message} {...classForm.register('section', { required: 'Section is required' })} />
            <Input label="Academic year" name="academic_year" placeholder="e.g. 2026-2027" isRequired error={classForm.formState.errors.academic_year?.message} {...classForm.register('academic_year', { required: 'Academic year is required' })} />
            <Input label="Room number / hall" name="room_number" placeholder="e.g. Room 101" {...classForm.register('room_number')} />
          </FormSection>
        </form>
      </Modal>

      <Modal
        isOpen={isSubjectModalOpen}
        onClose={closeSubjectModal}
        title="Add New Subject"
        description="Create a subject and assign it to a school class."
        size="lg"
        isLoading={createSubjectMutation.isPending}
        footer={<ModalFooter onCancel={closeSubjectModal} submitFormId="create-subject-form" submitLabel="Save Subject" isLoading={createSubjectMutation.isPending} disabled={classList.length === 0} />}
      >
        <form id="create-subject-form" onSubmit={subjectForm.handleSubmit(submitSubject)}>
          {classList.length === 0 && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Create a class first, then you can assign a subject to it.
            </div>
          )}
          <FormSection title="Subject Information" description="Choose the class this subject belongs to." columns={2}>
            <Input label="Subject name" name="name" placeholder="e.g. Mathematics" isRequired error={subjectForm.formState.errors.name?.message} {...subjectForm.register('name', { required: 'Subject name is required' })} />
            <Input label="Subject code" name="code" placeholder="e.g. MATH-10" isRequired error={subjectForm.formState.errors.code?.message} {...subjectForm.register('code', { required: 'Subject code is required' })} />
            <Select
              label="School class"
              name="school_class_id"
              placeholder="Select a class"
              isRequired
              options={classList.map((item) => ({ value: String(item.id), label: item.name }))}
              error={subjectForm.formState.errors.school_class_id?.message}
              {...subjectForm.register('school_class_id', { required: 'Please select a class' })}
            />
            <Input label="Periods per week" name="periods_per_week" type="number" min="1" isRequired error={subjectForm.formState.errors.periods_per_week?.message} {...subjectForm.register('periods_per_week', { required: 'Periods per week is required', min: { value: 1, message: 'Must be at least 1' } })} />
            <Input label="Description" name="description" placeholder="Optional subject description" {...subjectForm.register('description')} />
          </FormSection>
        </form>
      </Modal>
    </div>
  );
}
