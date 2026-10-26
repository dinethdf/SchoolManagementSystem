/**
 * Admin Faculty / Teachers Management Page
 *
 * Allows School Administrators to view all registered teachers,
 * their employee identification numbers, and academic credentials.
 * Also allows creating new teacher accounts.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTeachers, createTeacher } from '../../api/students';
import { registerUser } from '../../api/auth';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarBadge from '../../components/common/AvatarBadge';
import Select from '../../components/common/Select';

export default function TeachersPage() {
  const queryClient = useQueryClient();
  const teachersQuery = useQuery({
    queryKey: ['adminTeachersList'],
    queryFn: fetchTeachers,
  });

  // Extract array safely from response
  let teacherList = [];
  if (Array.isArray(teachersQuery.data)) {
    teacherList = teachersQuery.data;
  } else if (teachersQuery.data && Array.isArray(teachersQuery.data.teachers)) {
    teacherList = teachersQuery.data.teachers;
  }

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    // User fields
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    // Teacher profile fields
    employee_id: '',
    qualification: '',
    joining_date: '',
    department: '',
    specialization: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const departments = [
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

  const qualifications = [
    { value: 'bachelors', label: "Bachelor's Degree" },
    { value: 'masters', label: "Master's Degree" },
    { value: 'phd', label: 'PhD / Doctorate' },
    { value: 'bed', label: 'B.Ed' },
    { value: 'med', label: 'M.Ed' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'other', label: 'Other' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required';
    if (!formData.joining_date) newErrors.joining_date = 'Joining date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Step 1: Create user account with role='teacher'
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        role: 'teacher',
      };

      const userResponse = await registerUser(userData);
      const userId = userResponse.id || userResponse.user?.id;

      if (!userId) {
        throw new Error('Failed to get user ID from registration response');
      }

      // Step 2: Create teacher profile linked to the user
      const teacherData = {
        user_id: userId,
        employee_id: formData.employee_id.trim().toUpperCase(),
        qualification: formData.qualification,
        joining_date: formData.joining_date,
        department: formData.department,
        specialization: formData.specialization,
      };

      await createTeacher(teacherData);

      // Success - close modal, reset form, refresh teacher list
      setIsModalOpen(false);
      setFormData({
        username: '', email: '', password: '', confirm_password: '',
        first_name: '', last_name: '', phone_number: '',
        employee_id: '', qualification: '', joining_date: '',
        department: '', specialization: '',
      });
      queryClient.invalidateQueries({ queryKey: ['adminTeachersList'] });
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create teacher account';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitError('');
    setErrors({});
  };

  const columns = [
    {
      key: 'name',
      header: 'Faculty Member',
      render: function (row) {
        const teacherName = row.user?.full_name || row.user?.username || 'Teacher';
        return (
          <div className="flex items-center space-x-3">
            <AvatarBadge name={teacherName} size="small" roleColor="emerald" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">{teacherName}</p>
              <p className="text-xs text-gray-500">{row.user?.email || 'No email'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'employee_id',
      header: 'Employee ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
          {row.employee_id}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span>{row.department || 'General'}</span>,
    },
    {
      key: 'qualification',
      header: 'Qualification',
      render: (row) => <span>{row.qualification || 'N/A'}</span>,
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (row) => <span className="text-gray-600">{row.specialization || 'N/A'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" label="Active Faculty" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Faculty Members"
          subtitle="School teaching staff, academic qualifications, and departmental assignments."
          badge={`${teacherList.length} Faculty`}
        />
        <button
          onClick={openModal}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      <Table
        columns={columns}
        data={teacherList}
        isLoading={teachersQuery.isLoading}
        emptyTitle="No teachers registered"
        emptyDescription="Teaching faculty created in the system will be listed here."
      />

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeModal} aria-hidden="true" />
            {/* Modal Panel */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl transform transition-all">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">Add New Teacher</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close modal">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                {/* User Account Section */}
                <fieldset className="space-y-4">
                  <legend className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">User Account Details</legend>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-full mb-4">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.username ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.username && <p className="mt-1 text-xs text-red-600 font-medium">{errors.username}</p>}
                    </div>
                    <div className="w-full mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-full mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        id="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
                    </div>
                    <div className="w-full mb-4">
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        id="confirm_password"
                        value={formData.confirm_password}
                        onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.confirm_password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.confirm_password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirm_password}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-full mb-4">
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.first_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.first_name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.first_name}</p>}
                    </div>
                    <div className="w-full mb-4">
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.last_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.last_name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="w-full mb-4">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500 transition"
                      disabled={isSubmitting}
                    />
                  </div>
                </fieldset>

                {/* Teacher Profile Section */}
                <fieldset className="space-y-4 pt-4 border-t border-gray-200">
                  <legend className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-2">Teacher Profile</legend>

                  <div className="w-full mb-4">
                    <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange('employee_id', e.target.value.toUpperCase())}
                      className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                        errors.employee_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                      disabled={isSubmitting}
                      placeholder="e.g., TCH001"
                    />
                    {errors.employee_id && <p className="mt-1 text-xs text-red-600 font-medium">{errors.employee_id}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-full mb-4">
                      <Select
                        label="Department"
                        name="department"
                        options={departments}
                        placeholder="Select department"
                        value={formData.department}
                        onChange={(value) => handleInputChange('department', value)}
                        error={errors.department}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="w-full mb-4">
                      <Select
                        label="Qualification"
                        name="qualification"
                        options={qualifications}
                        placeholder="Select qualification"
                        value={formData.qualification}
                        onChange={(value) => handleInputChange('qualification', value)}
                        error={errors.qualification}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="w-full mb-4">
                      <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700 mb-1">Joining Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        id="joining_date"
                        value={formData.joining_date}
                        onChange={(e) => handleInputChange('joining_date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition ${
                          errors.joining_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.joining_date && <p className="mt-1 text-xs text-red-600 font-medium">{errors.joining_date}</p>}
                    </div>
                    <div className="w-full mb-4">
                      <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500 transition"
                        disabled={isSubmitting}
                        placeholder="e.g., Physics, Algebra, British Literature"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Creating...
                      </>
                    ) : (
                      'Create Teacher'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
