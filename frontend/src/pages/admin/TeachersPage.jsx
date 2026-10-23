/**
 * Admin Faculty / Teachers Management Page
 * 
 * Allows School Administrators to view all registered teachers,
 * their employee identification numbers, and academic credentials.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeachers } from '../../api/students';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarBadge from '../../components/common/AvatarBadge';

export default function TeachersPage() {
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
      <PageHeader
        title="Faculty Members"
        subtitle="School teaching staff, academic qualifications, and departmental assignments."
        badge={`${teacherList.length} Faculty`}
      />

      <Table
        columns={columns}
        data={teacherList}
        isLoading={teachersQuery.isLoading}
        emptyTitle="No teachers registered"
        emptyDescription="Teaching faculty created in the system will be listed here."
      />
    </div>
  );
}
