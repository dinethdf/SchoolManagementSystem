/**
 * Parent Dashboard Page Component
 * 
 * Education-first portal for parents and guardians:
 * - Live child attendance and academic summary
 * - Quick shortcuts to view detailed attendance history and official report cards
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import DataCard from '../../components/common/DataCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchMyChildrenAttendance } from '../../api/attendance';
import { fetchMyChildrenGrades } from '../../api/grades';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [childrenAttendance, setChildrenAttendance] = useState([]);
  const [childrenGrades, setChildrenGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParentDashboardMetrics() {
      try {
        setIsLoading(true);
        const [attRes, gradesRes] = await Promise.all([
          fetchMyChildrenAttendance(),
          fetchMyChildrenGrades(),
        ]);

        setChildrenAttendance(attRes?.children || []);
        setChildrenGrades(gradesRes?.children || []);
      } catch (err) {
        setChildrenAttendance([]);
        setChildrenGrades([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadParentDashboardMetrics();
  }, []);

  const totalChildren = childrenAttendance.length;
  const primaryChild = childrenAttendance[0] || null;
  const primaryGradeRecord = childrenGrades[0] || null;

  const attendanceRate = primaryChild?.summary?.attendance_percentage
    ? `${Number(primaryChild.summary.attendance_percentage).toFixed(1)}%`
    : 'N/A';

  const academicStanding = primaryGradeRecord?.overall_letter_grade
    ? `Grade ${primaryGradeRecord.overall_letter_grade} (${Number(primaryGradeRecord.overall_percentage).toFixed(1)}%)`
    : 'No grades yet';

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Welcome, ${currentUser?.first_name || currentUser?.username || 'Guardian'} 👨‍👩‍👧`}
        subtitle="Monitor your children's school attendance, subject grades, and teacher notes."
        badge="Parent / Guardian Portal"
        actionLabel="View Attendance"
        onAction={() => navigate('/parent/attendance')}
      />

      {/* 2. Top Statistic Cards */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner text="Fetching children records..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            label="Registered Children"
            value={`${totalChildren} ${totalChildren === 1 ? 'Child' : 'Children'}`}
            icon="🎓"
            hint={primaryChild?.student_name || 'Enrolled in SchoolMS'}
            accentColor="amber"
          />
          <StatCard
            label="Average Attendance"
            value={attendanceRate}
            icon="📅"
            hint={primaryChild ? `${primaryChild.summary?.total_days || 0} Total Sessions` : 'Attendance rate'}
            trend="Monitored Daily"
            trendType="positive"
            accentColor="emerald"
          />
          <StatCard
            label="Academic Standing"
            value={primaryGradeRecord?.overall_letter_grade ? `Grade ${primaryGradeRecord.overall_letter_grade}` : 'Pending'}
            icon="📝"
            hint={academicStanding}
            trend="Latest Term"
            trendType="positive"
            accentColor="indigo"
          />
        </div>
      )}

      {/* 3. My Linked Children Section */}
      <SectionCard
        title="Enrolled Children Profiles"
        subtitle="Direct access to inspect attendance logs or download term report cards."
      >
        {childrenAttendance.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No children are currently linked to your guardian profile.
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {childrenAttendance.map((child, index) => {
              const matchingGrade = childrenGrades.find(
                (g) => g.student_admission_number === child.admission_number
              ) || childrenGrades[index];

              const childAttendancePct = child.summary?.attendance_percentage
                ? `${Number(child.summary.attendance_percentage).toFixed(1)}%`
                : 'No sessions';

              const childStanding = matchingGrade?.overall_letter_grade
                ? `Grade ${matchingGrade.overall_letter_grade} (${Number(matchingGrade.overall_percentage).toFixed(1)}%)`
                : 'Pending evaluation';

              return (
                <DataCard
                  key={child.student_id || index}
                  title={child.student_name}
                  subtitle={`Admission # ${child.admission_number}`}
                  roleColor="blue"
                  badge={<StatusBadge status="active" label="Enrolled" />}
                  details={[
                    { label: 'Enrolled Class', value: child.class_name },
                    { label: 'Attendance Rate', value: childAttendancePct },
                    { label: 'Recorded Sessions', value: `${child.summary?.present_days || 0} Present / ${child.summary?.total_days || 0} Days` },
                    { label: 'Term Performance', value: childStanding },
                  ]}
                  actions={
                    <>
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => navigate('/parent/attendance')}
                      >
                        Attendance History
                      </Button>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => navigate('/parent/grades')}
                      >
                        Report Card
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
