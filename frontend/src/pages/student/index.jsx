/**
 * Student Dashboard Page Component (Redesigned)
 * 
 * Education-first personal dashboard for students:
 * - PageHeader with student greeting
 * - StatCards for Attendance Rate, Current Term GPA, and Enrolled Subjects
 * - My Subjects SectionCard
 * - Recent Academic Performance Card
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Hello, ${currentUser?.first_name || currentUser?.username || 'Student'} 🎓`}
        subtitle="Track your daily class attendance, examination marks, and term progress."
        badge="Enrolled Student"
        actionLabel="View Full Profile"
        onAction={() => navigate('/student/profile')}
        actionVariant="outline"
      />

      {/* 2. Top Metric StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Attendance Rate"
          value="94.0%"
          icon="📅"
          hint="Good Standing"
          trend="Above 85% requirement"
          trendType="positive"
          accentColor="blue"
        />
        <StatCard
          label="Current Term GPA"
          value="3.85"
          icon="📝"
          hint="Honor Roll"
          trend="Scale of 4.0"
          trendType="positive"
          accentColor="indigo"
        />
        <StatCard
          label="Enrolled Class"
          value="Grade 10-A"
          icon="🏫"
          hint="Room 101"
          accentColor="emerald"
        />
      </div>

      {/* 3. Enrolled Subjects Section */}
      <SectionCard
        title="My Enrolled Subjects"
        subtitle="Subjects scheduled for your academic term."
      >
        <div className="divide-y divide-gray-100">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                MATH
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Mathematics (MATH-10)
                </h4>
                <p className="text-xs text-gray-500">
                  Instructor: Sarah Connor &bull; 5 Periods / Week
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <StatusBadge status="pass" label="Current Standing: A" />
              <Button
                variant="outline"
                size="small"
                onClick={() => navigate('/student/grades')}
              >
                View Marks
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 4. Attendance Summary Tip Card */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-900">
        <span className="text-base">💡</span>
        <div>
          <span className="font-bold block mb-0.5">Exam Eligibility Requirement:</span>
          Students must maintain at least <strong>75% attendance</strong> to be eligible to sit for end-of-term examinations. Your current attendance is healthy at <strong>94.0%</strong>.
        </div>
      </div>
    </div>
  );
}
