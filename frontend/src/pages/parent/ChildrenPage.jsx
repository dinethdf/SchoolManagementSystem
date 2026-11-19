/**
 * Parent Children Directory Page Component
 * 
 * Displays all children linked to the currently logged-in parent or guardian:
 * - Child name, admission number, and enrolled class
 * - Roll / Index number and blood group
 * - Direct shortcuts to inspect the child's attendance and academic report card
 * 
 * Follows GEMINI.md Rules:
 * - Simple useState and useEffect data fetching
 * - Clear loops and conditionals
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import AvatarBadge from '../../components/common/AvatarBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { fetchMyChildren } from '../../api/students';

export default function ParentChildrenPage() {
  const navigate = useNavigate();
  const [childrenList, setChildrenList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch linked children from backend on mount
  useEffect(() => {
    async function loadChildren() {
      try {
        setIsLoading(true);
        const response = await fetchMyChildren();
        const list = response?.data || response?.children || (Array.isArray(response) ? response : []);
        setChildrenList(list);
      } catch (err) {
        toast.error('Failed to load registered children.');
      } finally {
        setIsLoading(false);
      }
    }

    loadChildren();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Children Directory"
        subtitle="Manage and monitor all student profiles linked to your guardian account."
        badge={`${childrenList.length} Registered`}
      />

      {/* 2. Main Content */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading your children's profiles..." />
        </div>
      ) : childrenList.length === 0 ? (
        <EmptyState
          title="No children linked yet"
          description="Your guardian profile has not been linked to any enrolled students. Please contact school administration."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {childrenList.map((child) => {
            const childName =
              child.user?.first_name && child.user?.last_name
                ? `${child.user.first_name} ${child.user.last_name}`
                : child.user?.username || 'Enrolled Student';

            const className = child.enrolled_class?.name || child.class_name || 'Grade 10-A';
            const admissionNo = child.admission_number || 'STU-2026-001';

            return (
              <div
                key={child.id || admissionNo}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Header: Avatar + Name + Class */}
                  <div className="flex items-center space-x-4">
                    <AvatarBadge name={childName} size="large" roleColor="amber" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {childName}
                      </h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {admissionNo}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status="enrolled" label="Active Enrollment" size="small" />
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 block">Class Section:</span>
                      <strong className="text-gray-900 font-semibold">{className}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Roll / Index:</span>
                      <strong className="text-gray-900 font-semibold">
                        {child.roll_number !== null ? child.roll_number : 'N/A'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Admission Date:</span>
                      <span className="text-gray-700">{child.admission_date || '2026-01-10'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Blood Group:</span>
                      <span className="text-gray-700">{child.blood_group || 'O+'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Navigation Buttons */}
                <div className="pt-3 border-t border-gray-100 grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="small"
                    className="w-full text-xs"
                    onClick={() => navigate('/parent/attendance')}
                  >
                    Attendance
                  </Button>
                  <Button
                    variant="outline"
                    size="small"
                    className="w-full text-xs"
                    onClick={() => navigate('/parent/grades')}
                  >
                    Report Card
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    className="w-full text-xs"
                    onClick={() => navigate('/parent/assignments')}
                  >
                    Homework
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
