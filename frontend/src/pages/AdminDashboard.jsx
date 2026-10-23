/**
 * Admin Dashboard Page Component (Redesigned)
 * 
 * Education-first, clean dashboard for School Administrators.
 * Built using our unified reusable components:
 * - PageHeader (with academic term badge)
 * - StatCard (Classes, Students, Teachers, Parents)
 * - SectionCard (wraps Class Roster and Quick Actions)
 * - Table (with StatusBadge and action buttons)
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchClasses } from '../api/classes';
import { fetchStudents, fetchTeachers, fetchParents } from '../api/students';
import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/common/StatCard';
import SectionCard from '../components/common/SectionCard';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // -----------------------------------------------------------
  // Step 1: Fetch Metrics & Classes using TanStack Query
  // -----------------------------------------------------------
  const classesQuery = useQuery({
    queryKey: ['adminClassesList'],
    queryFn: fetchClasses,
  });

  const studentsQuery = useQuery({
    queryKey: ['adminStudentsList'],
    queryFn: fetchStudents,
  });

  const teachersQuery = useQuery({
    queryKey: ['adminTeachersList'],
    queryFn: fetchTeachers,
  });

  const parentsQuery = useQuery({
    queryKey: ['adminParentsList'],
    queryFn: fetchParents,
  });

  // Extract classes array safely from backend response
  let classList = [];
  if (Array.isArray(classesQuery.data)) {
    classList = classesQuery.data;
  } else if (classesQuery.data && Array.isArray(classesQuery.data.classes)) {
    classList = classesQuery.data.classes;
  }

  // Calculate total counts
  const totalClasses =
    classesQuery.data && classesQuery.data.total_count !== undefined
      ? classesQuery.data.total_count
      : classList.length;

  const totalStudents =
    studentsQuery.data && studentsQuery.data.total_count !== undefined
      ? studentsQuery.data.total_count
      : Array.isArray(studentsQuery.data)
      ? studentsQuery.data.length
      : 0;

  const totalTeachers =
    teachersQuery.data && teachersQuery.data.total_count !== undefined
      ? teachersQuery.data.total_count
      : Array.isArray(teachersQuery.data)
      ? teachersQuery.data.length
      : 0;

  const totalParents =
    parentsQuery.data && parentsQuery.data.total_count !== undefined
      ? parentsQuery.data.total_count
      : Array.isArray(parentsQuery.data)
      ? parentsQuery.data.length
      : 0;

  // -----------------------------------------------------------
  // Step 2: Define Table Columns for Classes Overview
  // -----------------------------------------------------------
  const classTableColumns = [
    {
      key: 'name',
      header: 'Class Name',
      render: function (row) {
        return (
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-100">
              {row.section || 'A'}
            </span>
            <span className="font-semibold text-gray-900">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'grade_level',
      header: 'Grade',
      render: function (row) {
        return <span>Grade {row.grade_level}</span>;
      },
    },
    {
      key: 'academic_year',
      header: 'Academic Year',
    },
    {
      key: 'room_number',
      header: 'Room',
      render: function (row) {
        return <span className="text-gray-600">{row.room_number || 'N/A'}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: function () {
        return <StatusBadge status="active" label="In Session" />;
      },
    },
    {
      key: 'actions',
      header: 'Action',
      render: function (row) {
        return (
          <Button
            variant="outline"
            size="small"
            onClick={() => navigate('/admin/classes')}
          >
            Manage
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Welcome back, ${currentUser?.first_name || currentUser?.username || 'Administrator'} 👋`}
        subtitle="School administration control panel and daily academic operations."
        badge="Academic Year 2026-2027"
        actionLabel="+ Add New Class"
        onAction={() => navigate('/admin/classes')}
      />

      {/* 2. Top Metric StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Classes"
          value={totalClasses}
          icon="🏫"
          hint="Active sections"
          trend="In Session"
          trendType="positive"
          accentColor="purple"
          isLoading={classesQuery.isLoading}
        />
        <StatCard
          label="Enrolled Students"
          value={totalStudents}
          icon="🎓"
          hint="Registered students"
          accentColor="blue"
          isLoading={studentsQuery.isLoading}
        />
        <StatCard
          label="Active Faculty"
          value={totalTeachers}
          icon="👨‍🏫"
          hint="Teaching staff"
          accentColor="emerald"
          isLoading={teachersQuery.isLoading}
        />
        <StatCard
          label="Guardians / Parents"
          value={totalParents}
          icon="👨‍👩‍👧"
          hint="Linked accounts"
          accentColor="amber"
          isLoading={parentsQuery.isLoading}
        />
      </div>

      {/* 3. Quick Operations Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/classes')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-xs transition cursor-pointer flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-lg">
            🏫
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Manage Classes</h4>
            <p className="text-xs text-gray-500">Configure grade levels & rooms</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/students')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            🎓
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Enroll Students</h4>
            <p className="text-xs text-gray-500">Add admissions & assign classes</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/admin/teachers')}
          className="p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            👨‍🏫
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Faculty Roster</h4>
            <p className="text-xs text-gray-500">View teacher credentials & subjects</p>
          </div>
        </div>
      </div>

      {/* 4. Active Classes Overview Table */}
      <SectionCard
        title="Class Sections Overview"
        subtitle="All grade levels and classrooms configured in the school."
        actionLabel="View All Classes"
        onAction={() => navigate('/admin/classes')}
      >
        <Table
          columns={classTableColumns}
          data={classList}
          isLoading={classesQuery.isLoading}
          emptyTitle="No classes created yet"
          emptyDescription="Start organizing your school by creating your first grade level and section."
          emptyActionLabel="+ Add First Class"
          onEmptyAction={() => navigate('/admin/classes')}
        />
      </SectionCard>
    </div>
  );
}
