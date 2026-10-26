import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useModalForm from '../../hooks/useModalForm';
import { fetchTeachers, createTeacher } from '../../api/students';
import { registerUser } from '../../api/auth';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarBadge from '../../components/common/AvatarBadge';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import FormSection from '../../components/common/FormSection';
import Modal from '../../components/common/Modal';
import ModalFooter from '../../components/common/ModalFooter';

const DEFAULT_VALUES = {
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  employee_id: '',
  qualification: '',
  joining_date: '',
  department: '',
  specialization: '',
};

const DEPARTMENTS = [
  { value: 'science', label: 'Science' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'english', label: 'English' },
  { value: 'social_studies', label: 'Social Studies' },
  { value: 'languages', label: 'Languages' },
  { value: 'arts', label: 'Arts' },
  { value: 'physical_education', label: 'Physical Education' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'other', label: 'Other' },
];

const QUALIFICATIONS = [
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
  { value: 'bed', label: 'B.Ed' },
  { value: 'med', label: 'M.Ed' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'other', label: 'Other' },
];

export default function TeachersPage() {
  const teachersQuery = useQuery({ queryKey: ['adminTeachersList'], queryFn: fetchTeachers });
  const teacherForm = useModalForm({
    queryKey: ['adminTeachersList'],
    defaultValues: DEFAULT_VALUES,
    mutationFn: async (values) => {
      const userResponse = await registerUser({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        confirm_password: values.confirm_password,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone_number: values.phone_number.trim(),
        role: 'teacher',
      });
      const userId = userResponse.user?.id || userResponse.id;
      if (!userId) {
        throw new Error('The account was created, but no user ID was returned. Contact an administrator before retrying.');
      }

      return createTeacher({
        user_id: userId,
        employee_id: values.employee_id.trim().toUpperCase(),
        qualification: values.qualification,
        joining_date: values.joining_date,
        department: values.department,
        specialization: values.specialization.trim(),
      });
    },
  });
  const {
    form: { register, watch, formState: { errors } },
    mutation: createTeacherMutation,
  } = teacherForm;
  const password = watch('password');

  const teacherList = Array.isArray(teachersQuery.data)
    ? teachersQuery.data
    : teachersQuery.data?.teachers || [];

  const columns = [
    {
      key: 'name',
      header: 'Faculty Member',
      render: (row) => {
        const name = row.user?.full_name || row.user?.username || 'Teacher';
        return (
          <div className="flex items-center space-x-3">
            <AvatarBadge name={name} size="small" roleColor="emerald" />
            <div>
              <p className="font-bold leading-tight text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{row.user?.email || 'No email'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      render: (row) => <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-800">{row.employee_id}</span>,
    },
    { key: 'department', header: 'Department', render: (row) => <span>{row.department || 'General'}</span> },
    { key: 'qualification', header: 'Qualification', render: (row) => <span>{row.qualification || 'N/A'}</span> },
    { key: 'specialization', header: 'Specialization', render: (row) => <span className="text-gray-600">{row.specialization || 'N/A'}</span> },
    { key: 'status', header: 'Status', render: () => <StatusBadge status="active" label="Active Faculty" /> },
  ];

  function closeModal() {
    teacherForm.closeModal();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Members"
        subtitle="School teaching staff, academic qualifications, and departmental assignments."
        badge={`${teacherList.length} Faculty`}
        actionLabel="+ Add Teacher"
        onAction={() => teacherForm.openModal()}
      />
      <Table
        columns={columns}
        data={teacherList}
        isLoading={teachersQuery.isLoading}
        emptyTitle="No teachers registered"
        emptyDescription="Teaching faculty created in the system will be listed here."
      />

      <Modal
        isOpen={teacherForm.isOpen}
        onClose={closeModal}
        title="Add New Teacher"
        description="Create the teacher’s login and staff profile."
        size="xl"
        isLoading={createTeacherMutation.isPending}
        footer={(
          <ModalFooter
            onCancel={closeModal}
            submitFormId="create-teacher-form"
            submitLabel="Create Teacher"
            isLoading={createTeacherMutation.isPending}
          />
        )}
      >
        <form id="create-teacher-form" onSubmit={teacherForm.submit} className="space-y-6">
          <FormSection title="Login & Contact" description="The teacher will use these credentials to sign in." columns={2}>
            <Input label="Username" name="username" isRequired error={errors.username?.message} {...register('username', { required: 'Username is required' })} />
            <Input label="Email" name="email" type="email" isRequired error={errors.email?.message} {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' } })} />
            <Input label="First name" name="first_name" isRequired error={errors.first_name?.message} {...register('first_name', { required: 'First name is required' })} />
            <Input label="Last name" name="last_name" isRequired error={errors.last_name?.message} {...register('last_name', { required: 'Last name is required' })} />
            <Input label="Password" name="password" type="password" isRequired error={errors.password?.message} {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} />
            <Input label="Confirm password" name="confirm_password" type="password" isRequired error={errors.confirm_password?.message} {...register('confirm_password', { required: 'Please confirm the password', validate: (value) => value === password || 'Passwords do not match' })} />
            <Input label="Phone number" name="phone_number" type="tel" {...register('phone_number')} />
          </FormSection>

          <FormSection title="Staff Profile" description="School employment details for this teacher." columns={2}>
            <Input label="Employee ID" name="employee_id" placeholder="e.g. TCH001" isRequired error={errors.employee_id?.message} {...register('employee_id', { required: 'Employee ID is required' })} />
            <Input label="Joining date" name="joining_date" type="date" isRequired error={errors.joining_date?.message} {...register('joining_date', { required: 'Joining date is required' })} />
            <Select label="Department" name="department" options={DEPARTMENTS} placeholder="Select a department" error={errors.department?.message} {...register('department')} />
            <Select label="Qualification" name="qualification" options={QUALIFICATIONS} placeholder="Select a qualification" error={errors.qualification?.message} {...register('qualification')} />
            <Input label="Specialization" name="specialization" placeholder="e.g. Physics or Algebra" {...register('specialization')} />
          </FormSection>
        </form>
      </Modal>
    </div>
  );
}
