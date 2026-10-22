/**
 * Teacher Dashboard Page Component
 * 
 * Central hub for teachers to:
 * 1. View assigned classes and subjects
 * 2. Mark and submit daily attendance
 * 3. Enter student assessment marks and exam grades
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export default function TeacherDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome, <span className="font-semibold text-emerald-600">{currentUser?.username || 'Teacher'}</span>! Ready to manage your classes and students today.
          </p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Faculty Active
        </div>
      </div>

      {/* 2. Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Attendance Marking */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-3">
              📅
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Daily Attendance
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Mark student presence, absence, or tardiness for today's classes.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/teacher/attendance">
              <Button variant="primary" size="small" className="w-full bg-emerald-600 hover:bg-emerald-700">
                Mark Today's Attendance
              </Button>
            </Link>
          </div>
        </div>

        {/* Card 2: Grades & Results */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl mb-3">
              📝
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Grade Management
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Input test marks, term grades, and student subject remarks.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/teacher/grades">
              <Button variant="primary" size="small" className="w-full">
                Enter Student Grades
              </Button>
            </Link>
          </div>
        </div>

        {/* Card 3: Class Schedule */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-3">
              🏫
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              My Classes
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              View students enrolled in your assigned sections and subjects.
            </p>
          </div>
          <div className="mt-5">
            <Link to="/teacher/classes">
              <Button variant="outline" size="small" className="w-full">
                View Class Rosters
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Helpful Guidance Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <p className="font-semibold mb-1">Teacher Instructions:</p>
        <p>
          Please remember to submit your period attendance before 11:00 AM daily.
          If a student is missing without an excuse note from their parent, mark them as 'Absent'.
        </p>
      </div>
    </div>
  );
}
