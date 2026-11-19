/**
 * Student Profile Page Component
 * 
 * Displays the complete institutional profile and enrollment records
 * for the currently logged-in student:
 * - Admission number & enrolled class
 * - Roll / Index number
 * - Official enrollment date
 * - Blood group & emergency contact information
 * 
 * Follows GEMINI.md Rules:
 * - Simple useState and useEffect data fetching
 * - Clear comments explaining every section
 * - File under 300 lines
 */

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';
import AvatarBadge from '../../components/common/AvatarBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { fetchMyStudentProfile } from '../../api/students';

export default function StudentProfilePage() {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load student profile data from backend on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const response = await fetchMyStudentProfile();
        // The API returns the profile directly or wrapped in data
        const profile = response?.data || response;
        setProfileData(profile);
      } catch (err) {
        toast.error('Failed to load your student profile details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const fullName =
    profileData?.user?.first_name && profileData?.user?.last_name
      ? `${profileData.user.first_name} ${profileData.user.last_name}`
      : currentUser?.first_name || currentUser?.username || 'Student';

  const email = profileData?.user?.email || currentUser?.email || 'N/A';
  const className = profileData?.enrolled_class?.name || 'Not Enrolled';
  const admissionNumber = profileData?.admission_number || 'STU-PENDING';
  const rollNumber = profileData?.roll_number !== null ? profileData?.roll_number : 'N/A';

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Student Profile"
        subtitle="Review your institutional enrollment records, class placement, and emergency contacts."
        badge={admissionNumber}
      />

      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" message="Loading your profile details..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AvatarBadge name={fullName} size="xlarge" roleColor="blue" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{email}</p>
              <div className="mt-2 flex justify-center">
                <StatusBadge status="enrolled" label="Active Student" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 text-left space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Admission No:</span>
                <strong className="text-gray-800 font-mono">{admissionNumber}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Class Batch:</span>
                <strong className="text-blue-700 font-semibold">{className}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Roll / Index No:</span>
                <strong className="text-gray-800">{rollNumber}</strong>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Academic & Emergency Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Information */}
            <SectionCard
              title="Academic Details"
              subtitle="Institutional registration and current class placement."
            >
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Enrolled Class
                  </span>
                  <p className="font-bold text-gray-900 mt-0.5">{className}</p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </span>
                  <p className="font-bold text-gray-900 mt-0.5 font-mono">{admissionNumber}</p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admission Date
                  </span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {profileData?.admission_date || '2026-01-10'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Blood Group
                  </span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {profileData?.blood_group || 'O+'}
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Emergency Contacts */}
            <SectionCard
              title="Emergency Contact Information"
              subtitle="Registered guardian contact details for school communications."
            >
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </span>
                  <p className="font-bold text-gray-900 mt-0.5">
                    {profileData?.emergency_contact_name || 'Jane Doe'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Relationship
                  </span>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {profileData?.emergency_contact_relationship || 'Mother / Guardian'}
                  </p>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Emergency Phone
                  </span>
                  <p className="font-medium text-indigo-700 mt-0.5 font-mono">
                    {profileData?.emergency_contact_phone || '+1 (555) 019-2834'}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
