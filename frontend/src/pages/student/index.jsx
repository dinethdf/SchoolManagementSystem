/**
 * Student Dashboard Page Component
 * 
 * Education-first personal dashboard for students:
 * - Live Attendance Rate pulled directly from API
 * - Current Term Grade / GPA from official report card API
 * - Quick shortcuts to inspect full attendance history and test marks
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
import GradeLetterBadge from '../../components/common/GradeLetterBadge';
import { fetchMyAttendanceSummary } from '../../api/attendance';
import { fetchMyReportCard } from '../../api/grades';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [reportCard, setReportCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStudentMetrics() {
      try {
        setIsLoading(true);
        const [attRes, gradesRes] = await Promise.all([
          fetchMyAttendanceSummary(),
          fetchMyReportCard(),
        ]);

        setAttendanceSummary(attRes?.summary || null);
        setReportCard(gradesRes?.report_card || null);
      } catch (err) {
        setAttendanceSummary(null);
        setReportCard(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadStudentMetrics();
  }, []);

  const attendancePct = attendanceSummary?.attendance_percentage
    ? `${Number(attendanceSummary.attendance_percentage).toFixed(1)}%`
    : '0.0%';

  const overallGrade = reportCard?.overall_letter_grade || 'N/A';
  const overallPct = reportCard?.overall_percentage ? `${Number(reportCard.overall_percentage).toFixed(1)}%` : '0.0%';
  const subjectsList = reportCard?.subject_summaries || [];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Hello, ${currentUser?.first_name || currentUser?.username || 'Student'} 🎓`}
        subtitle="Track your daily class attendance, examination marks, and term progress."
        badge="Enrolled Student"
        actionLabel="View Attendance"
        onAction={() => navigate('/student/attendance')}
      />

      {/* 2. Top Metric StatCards */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner text="Fetching academic standing..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            label="Attendance Rate"
            value={attendancePct}
            icon="📅"
            hint={`${attendanceSummary?.total_days || 0} Recorded Sessions`}
            trend="Requirement: 75%"
            trendType={Number(attendanceSummary?.attendance_percentage || 0) >= 75 ? 'positive' : 'negative'}
            accentColor="blue"
          />
          <StatCard
            label="Cumulative Score"
            value={overallPct}
            icon="📝"
            hint={`Current Grade: ${overallGrade}`}
            trend={`Standing: Grade ${overallGrade}`}
            trendType="positive"
            accentColor="indigo"
          />
          <StatCard
            label="Enrolled Class"
            value={reportCard?.class_name || 'Grade 10-A'}
            icon="🏫"
            hint={`Session: ${reportCard?.academic_year || '2026-2027'}`}
            accentColor="emerald"
          />
        </div>
      )}

      {/* 3. Subjects Performance Section */}
      <SectionCard
        title="My Registered Subjects"
        subtitle="Current academic evaluation status across your enrolled courses."
      >
        {subjectsList.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No graded subjects recorded yet. Complete assessments to see your standing.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subjectsList.map((sub) => (
              <div
                key={sub.subject_name}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100">
                    {sub.subject_name.substring(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{sub.subject_name}</h4>
                    <p className="text-xs text-gray-500">
                      Average Score: {Number(sub.average_marks).toFixed(1)} &bull; {sub.total_assessments} Assessments Completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <GradeLetterBadge grade={sub.overall_letter_grade} size="sm" />
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => navigate('/student/grades')}
                  >
                    View Report Card
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 4. Action Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-blue-900">Check Your Detailed Report Card</h4>
          <p className="text-xs text-blue-700 mt-0.5">
            View full assessment breakdowns, quiz scores, and teacher comments.
          </p>
        </div>
        <Button
          variant="primary"
          size="medium"
          onClick={() => navigate('/student/grades')}
        >
          Open Report Card &rarr;
        </Button>
      </div>
    </div>
  );
}
