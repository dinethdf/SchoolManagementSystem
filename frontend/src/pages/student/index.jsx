/**
 * Student Dashboard Page Component
 * 
 * Portal for enrolled students to:
 * 1. View their personal academic progress
 * 2. Check their attendance percentage and history
 * 3. Review exam results and report cards
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function StudentDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, <span className="font-semibold text-blue-600">{currentUser?.username || 'Student'}</span>! Keep up the good work this academic term.
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Enrolled Student
        </div>
      </div>

      {/* 2. Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Attendance</span>
              <span className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold">
                ✓
              </span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">94.0%</p>
            <p className="mt-1 text-xs text-green-600 font-medium">
              Good Standing &bull; Above 85% requirement
            </p>
          </div>
          <div className="mt-5">
            <Link to="/student/attendance">
              <Button variant="outline" size="small" className="w-full">
                View Attendance Record
              </Button>
            </Link>
          </div>
        </div>

        {/* Grades Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">Report Card</span>
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                A
              </span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">3.85 GPA</p>
            <p className="mt-1 text-xs text-gray-500">
              Current Academic Standing
            </p>
          </div>
          <div className="mt-5">
            <Link to="/student/grades">
              <Button variant="primary" size="small" className="w-full">
                View My Grades
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">My Profile</span>
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                👤
              </span>
            </div>
            <p className="text-base font-bold text-gray-900">{currentUser?.username}</p>
            <p className="mt-1 text-xs text-gray-500">
              Admission and emergency contact details
            </p>
          </div>
          <div className="mt-5">
            <Link to="/student/profile">
              <Button variant="outline" size="small" className="w-full">
                View Full Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
