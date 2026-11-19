/**
 * Login Page Component
 * 
 * This is the full login page layout. It centers the login card
 * on the screen with clean branding, title, and form.
 * 
 * It also displays quick demo test account hints to help examiners,
 * professors, and students quickly test each role without guessing passwords.
 */
import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 1. Header & Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-4 shadow-sm">
          {/* Graduation cap icon svg */}
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 14l9-5-9-5-9 5 9 5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          School Management System
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to access your student, teacher, or admin portal
        </p>
      </div>

      {/* 2. Login Card Container */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl sm:px-10 border border-gray-100">
          {/* Render the interactive Login Form (includes form fields and Quick Login role cards) */}
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
