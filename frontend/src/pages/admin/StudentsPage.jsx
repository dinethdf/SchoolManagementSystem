/**
 * Admin Student Management Page
 * 
 * Allows School Administrators to:
 * 1. View all enrolled students across all grade levels.
 * 2. Search by student name, roll number, or admission number.
 * 3. Inspect individual student academic and contact details.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStudents } from '../../api/students';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import StatusBadge from '../../components/common/StatusBadge';
import AvatarBadge from '../../components/common/AvatarBadge';
import Button from '../../components/common/Button';

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all students from backend
  const studentsQuery = useQuery({
    queryKey: ['adminStudentsList'],
    queryFn: fetchStudents,
  });

  // Extract array safely from response
  let studentList = [];
  if (Array.isArray(studentsQuery.data)) {
    studentList = studentsQuery.data;
  } else if (studentsQuery.data && Array.isArray(studentsQuery.data.students)) {
    studentList = studentsQuery.data.students;
  }

  // Filter students based on search term
  const filteredStudents = studentList.filter(function (student) {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const username = (student.user && student.user.username) ? student.user.username.toLowerCase() : '';
    const fullName = (student.user && student.user.full_name) ? student.user.full_name.toLowerCase() : '';
    const admissionNo = student.admission_number ? student.admission_number.toLowerCase() : '';
    return username.includes(term) || fullName.includes(term) || admissionNo.includes(term);
  });

  // Table Column Definitions
  const columns = [
    {
      key: 'name',
      header: 'Student',
      render: function (row) {
        const studentName = row.user?.full_name || row.user?.username || 'Student';
        return (
          <div className="flex items-center space-x-3">
            <AvatarBadge name={studentName} size="small" roleColor="blue" />
            <div>
              <p className="font-bold text-gray-900 leading-tight">{studentName}</p>
              <p className="text-xs text-gray-500">{row.user?.email || 'No email'}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'admission_number',
      header: 'Admission #',
      render: (row) => (
        <span className="font-mono text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
          {row.admission_number}
        </span>
      ),
    },
    {
      key: 'enrolled_class',
      header: 'Class / Section',
      render: function (row) {
        return (
          <span className="font-medium text-gray-800">
            {row.enrolled_class_details ? row.enrolled_class_details.name : 'Unassigned'}
          </span>
        );
      },
    },
    {
      key: 'roll_number',
      header: 'Roll #',
      render: (row) => <span>{row.roll_number || 'N/A'}</span>,
    },
    {
      key: 'emergency_contact',
      header: 'Emergency Contact',
      render: function (row) {
        return (
          <div className="text-xs">
            <p className="font-semibold text-gray-800">{row.emergency_contact_name || 'N/A'}</p>
            <p className="text-gray-500">{row.emergency_contact_phone || ''}</p>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: () => <StatusBadge status="active" label="Enrolled" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Student Roster"
        subtitle="Complete database of enrolled students, class allocations, and guardian records."
        badge={`${studentList.length} Enrolled`}
      />

      {/* 2. Search Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by student name or admission #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50/50"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>

        {searchTerm && (
          <Button
            variant="outline"
            size="small"
            onClick={() => setSearchTerm('')}
          >
            Clear Search
          </Button>
        )}
      </div>

      {/* 3. Students Table */}
      <Table
        columns={columns}
        data={filteredStudents}
        isLoading={studentsQuery.isLoading}
        emptyTitle="No students found"
        emptyDescription={
          searchTerm
            ? 'No students matched your search criteria. Try a different query.'
            : 'No students have been enrolled into the system yet.'
        }
      />
    </div>
  );
}
