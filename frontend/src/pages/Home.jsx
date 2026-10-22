/**
 * Home / Landing Page Component
 * 
 * This is the public home page of the School Management System.
 * It introduces the application features and provides direct buttons
 * to either Sign In or go to the user's dashboard if already logged in.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function Home() {
  // Check if a user is currently logged in
  const { currentUser, isAuthenticated } = useAuth();

  // Determine dashboard link based on the user's role
  let dashboardRoute = '/login';
  if (currentUser && currentUser.role) {
    dashboardRoute = `/${currentUser.role.toLowerCase()}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col justify-between">
      {/* 1. Header / Navigation Bar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            SMS
          </div>
          <span className="text-xl font-bold text-gray-900">
            School Management System
          </span>
        </div>

        <div>
          {isAuthenticated ? (
            <Link to={dashboardRoute}>
              <Button variant="primary" size="small">
                Go to Dashboard ({currentUser?.username})
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="small">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">
          Final Year Project (Undergraduate)
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Modern, Transparent & Comprehensive <br />
          <span className="text-indigo-600">School Administration</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
          Manage students, classes, subjects, attendance, grades, and communication
          efficiently across School Admins, Teachers, Students, and Parents.
        </p>

        <div className="mt-8 flex justify-center space-x-4">
          {isAuthenticated ? (
            <Link to={dashboardRoute}>
              <Button variant="primary" size="large">
                Open My Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="large">
                Sign In to System
              </Button>
            </Link>
          )}
        </div>

        {/* 3. Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {/* Card 1: Classes & Academics */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3 font-bold text-sm">
              📚
            </div>
            <h3 className="text-base font-semibold text-gray-900">Academics</h3>
            <p className="mt-1 text-xs text-gray-500">
              Manage classes, sections, academic years, and subjects assigned to teachers.
            </p>
          </div>

          {/* Card 2: Students & People */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 font-bold text-sm">
              🎓
            </div>
            <h3 className="text-base font-semibold text-gray-900">People Profiles</h3>
            <p className="mt-1 text-xs text-gray-500">
              Complete student admissions, teacher credentials, and linked parent profiles.
            </p>
          </div>

          {/* Card 3: Attendance */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3 font-bold text-sm">
              📅
            </div>
            <h3 className="text-base font-semibold text-gray-900">Attendance</h3>
            <p className="mt-1 text-xs text-gray-500">
              Daily student attendance marking by teachers with percentage tracking.
            </p>
          </div>

          {/* Card 4: Role-Based Access */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3 font-bold text-sm">
              🔒
            </div>
            <h3 className="text-base font-semibold text-gray-900">Secure Access</h3>
            <p className="mt-1 text-xs text-gray-500">
              JWT token security with strict role-based dashboards and permissions.
            </p>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        School Management System &copy; {new Date().getFullYear()} — Built with React & Django
      </footer>
    </div>
  );
}
