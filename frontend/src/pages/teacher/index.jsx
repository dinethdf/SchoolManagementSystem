/**
 * Teacher Dashboard Page Component
 * 
 * Central hub for teaching faculty:
 * - Live stats for assigned classes, active assessments, and attendance records
 * - Quick action buttons for marking daily attendance and submitting grades
 * - Assigned Classes summary list
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchClasses } from '../../api/classes';
import { fetchAssessments } from '../../api/grades';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [classList, setClassList] = useState([]);
  const [assessmentsCount, setAssessmentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherDashboardMetrics() {
      try {
        setIsLoading(true);
        const [classesRes, assessmentsRes] = await Promise.all([
          fetchClasses(),
          fetchAssessments(),
        ]);

        const classes = classesRes?.classes || (Array.isArray(classesRes) ? classesRes : []);
        const assessments = assessmentsRes?.assessments || (Array.isArray(assessmentsRes) ? assessmentsRes : []);

        setClassList(classes);
        setAssessmentsCount(assessments.length);
      } catch (err) {
        // Fallback gracefully if API calls fail
        setClassList([]);
        setAssessmentsCount(0);
      } finally {
        setIsLoading(false);
      }
    }

    loadTeacherDashboardMetrics();
  }, []);

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
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner text="Updating dashboard metrics..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            label="My Assigned Classes"
            value={`${classList.length} ${classList.length === 1 ? 'Class' : 'Classes'}`}
            icon="🏫"
            hint={classList[0]?.name ? `${classList[0].name} (Class Teacher)` : 'Active School Classes'}
            accentColor="emerald"
          />
          <StatCard
            label="Active Assessments"
            value={`${assessmentsCount} Tests`}
            icon="📝"
            hint="Scheduled evaluations"
            trend="Ongoing Term"
            trendType="positive"
            accentColor="indigo"
          />
          <StatCard
            label="Daily Attendance"
            value="Active"
            icon="📅"
            hint="Ready for daily recording"
            trend="Live"
            trendType="positive"
            accentColor="amber"
          />
        </div>
      )}

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
              Record present, absent, and late students for your classes with one-click toggles.
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
              Create tests, input exam marks, and preview student letter grades with automated evaluation.
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
        title="Class Roster Directory"
        subtitle="School classrooms and batches available for your supervision."
      >
        {classList.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No classes found in the system.</p>
        ) : (
          classList.map((classItem) => (
            <div
              key={classItem.id}
              className="p-5 border-b border-gray-100 last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base border border-emerald-200">
                  {classItem.grade_level}-{classItem.section}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">{classItem.name}</h4>
                  <p className="text-xs text-gray-500">
                    Room {classItem.room_number || 'N/A'} &bull; Academic Year {classItem.academic_year}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <StatusBadge status="active" label="Class Active" />
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate('/teacher/attendance')}
                >
                  Take Attendance
                </Button>
              </div>
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}
