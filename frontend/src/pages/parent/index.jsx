/**
 * Parent Dashboard Page Component
 * 
 * Portal for parents and guardians to:
 * 1. Monitor their linked children's school attendance
 * 2. Track term grades, exam results, and teacher remarks
 * 3. Stay updated on school activities
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function ParentDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Parent & Guardian Portal
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, <span className="font-semibold text-purple-600">{currentUser?.username || 'Parent'}</span>! Monitor your child's academic journey and school attendance.
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Guardian Portal
        </div>
      </div>

      {/* 2. Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Children Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-3">
              👨‍👩‍👧
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Linked Children
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              View your registered students and their enrolled classes.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/parent/children">
              <Button variant="outline" size="small" className="w-full">
                View My Children
              </Button>
            </Link>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xl mb-3">
              📅
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Attendance Records
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Verify if your child attended classes today and check monthly rates.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/parent/attendance">
              <Button variant="outline" size="small" className="w-full">
                Check Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* Academic Grades Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Academic Reports
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Review published subject marks, teacher notes, and term report cards.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/parent/grades">
              <Button variant="primary" size="small" className="w-full">
                View Report Cards
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
