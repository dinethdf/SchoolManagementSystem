/**
 * Teacher Dashboard Page Component (Redesigned)
 * 
 * Central hub for teaching faculty:
 * - PageHeader with greeting and quick attendance CTA
 * - StatCards for assigned classes, attendance status, and subjects
 * - High-priority action cards for daily attendance and grade entry
 * - Assigned Classes SectionCard
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Hello, ${currentUser?.first_name || currentUser?.username || 'Teacher'} 👋`}
        subtitle="Manage your daily classrooms, mark period attendance, and submit student grades."
        badge="Faculty Portal"
        actionLabel="Mark Attendance Today"
        onAction={() => navigate('/teacher/attendance')}
      />

      {/* 2. Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="My Assigned Classes"
          value="1 Class"
          icon="🏫"
          hint="Grade 10-A (Class Teacher)"
          accentColor="emerald"
        />
        <StatCard
          label="Today's Attendance"
          value="Pending"
          icon="📅"
          hint="Due before 11:00 AM"
          trend="Required Daily"
          trendType="negative"
          accentColor="amber"
        />
        <StatCard
          label="Teaching Subjects"
          value="1 Subject"
          icon="📖"
          hint="Mathematics (MATH-10)"
          accentColor="indigo"
        />
      </div>

      {/* 3. Primary Action Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Action Card */}
        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-3 backdrop-blur-xs">
              Daily Duty
            </div>
            <h3 className="text-xl font-bold">Mark Today's Attendance</h3>
            <p className="mt-1 text-sm text-emerald-100">
              Record present, absent, and late students for Grade 10-A. Automatic notification sent to parents.
            </p>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => navigate('/teacher/attendance')}
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold"
            >
              Open Attendance Sheet &rarr;
            </Button>
          </div>
        </div>

        {/* Grade Entry Action Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white mb-3 backdrop-blur-xs">
              Academic Assessment
            </div>
            <h3 className="text-xl font-bold">Enter Term Grades</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Submit test marks, midterm scores, and final report card remarks for your enrolled students.
            </p>
          </div>
          <div className="mt-6">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => navigate('/teacher/grades')}
              className="bg-white text-indigo-800 hover:bg-indigo-50 font-bold"
            >
              Open Grade Book &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Assigned Class Details Card */}
      <SectionCard
        title="My Assigned Classes"
        subtitle="Students enrolled under your direct supervision."
      >
        <div className="p-5 border-b border-gray-100 last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base border border-emerald-200">
              10-A
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Grade 10-A</h4>
              <p className="text-xs text-gray-500">
                Room 101 &bull; 1 Enrolled Student &bull; Academic Year 2026-2027
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <StatusBadge status="active" label="Class Teacher" />
            <Button
              variant="outline"
              size="small"
              onClick={() => navigate('/teacher/classes')}
            >
              View Roster
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
