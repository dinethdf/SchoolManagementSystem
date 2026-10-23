/**
 * Parent Dashboard Page Component (Redesigned)
 * 
 * Education-first portal for parents and guardians:
 * - PageHeader with guardian greeting
 * - StatCards for linked children count and attendance average
 * - DataCards for individual children with direct attendance & grade actions
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import SectionCard from '../../components/common/SectionCard';
import DataCard from '../../components/common/DataCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={`Welcome, ${currentUser?.first_name || currentUser?.username || 'Guardian'} 👨‍👩‍👧`}
        subtitle="Monitor your children's school attendance, subject grades, and teacher notes."
        badge="Parent / Guardian Portal"
        actionLabel="View All Children"
        onAction={() => navigate('/parent/children')}
        actionVariant="outline"
      />

      {/* 2. Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Registered Children"
          value="1 Student"
          icon="🎓"
          hint="Enrolled in SchoolMS"
          accentColor="amber"
        />
        <StatCard
          label="Average Attendance"
          value="94.0%"
          icon="📅"
          hint="Across all subjects"
          trend="Regular Attendance"
          trendType="positive"
          accentColor="emerald"
        />
        <StatCard
          label="Fee Payment Status"
          value="Up to date"
          icon="💳"
          hint="Term 1 (2026-2027)"
          trend="No dues pending"
          trendType="positive"
          accentColor="blue"
        />
      </div>

      {/* 3. My Linked Children Section */}
      <SectionCard
        title="My Children Profiles"
        subtitle="Select a student to inspect attendance records or term report cards."
      >
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DataCard
            title="John Doe"
            subtitle="Admission # STU-2026-001"
            roleColor="blue"
            badge={<StatusBadge status="present" label="Attending Today" />}
            details={[
              { label: 'Current Class', value: 'Grade 10-A (Room 101)' },
              { label: 'Class Teacher', value: 'Sarah Connor' },
              { label: 'Overall Attendance', value: '94.0% (Good Standing)' },
              { label: 'Academic Standing', value: '3.85 GPA (Term 1)' },
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
        </div>
      </SectionCard>
    </div>
  );
}
