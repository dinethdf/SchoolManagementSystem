/**
 * Quick Login Section Component
 * 
 * This component provides an interactive quick-access panel for examiners,
 * professors, and developers during testing and viva presentations.
 * 
 * WHY THIS EXISTS:
 * During development and grading, switching between user roles (Admin, Teacher,
 * Student, Parent) typically requires logging out and repeatedly retyping usernames
 * and passwords. This component gives two handy options:
 * 1. "Quick Login" button: Instantly signs in as the role and redirects to its dashboard.
 * 2. "Fill Form" button: Populates the username and password fields in the form above
 *    so the standard form submission can still be tested.
 * 
 * PROPS:
 * - onFillCredentials: Optional callback function (username, password) => void
 *   used to populate the main login form fields when "Fill Form" is clicked.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { DEMO_ACCOUNTS } from '../../utils/constants';

export default function QuickLoginSection({ onFillCredentials }) {
  // Navigation hook to redirect the user after a quick login
  const navigate = useNavigate();

  // Authentication context hook providing the quickLoginUser method
  const { quickLoginUser } = useAuth();

  // Track which role is currently being logged in to show loading feedback
  const [activeLoggingInRole, setActiveLoggingInRole] = useState(null);

  // List of all pre-configured demo accounts to display
  const demoAccountList = [
    DEMO_ACCOUNTS.admin,
    DEMO_ACCOUNTS.teacher,
    DEMO_ACCOUNTS.student,
    DEMO_ACCOUNTS.parent,
  ];

  // ============================================================
  // HANDLER: Instant One-Click Login
  // Immediately creates an active session and redirects to dashboard.
  // ============================================================
  async function handleQuickSignIn(account) {
    try {
      // Indicate that this specific role is processing
      setActiveLoggingInRole(account.role);

      // Perform the quick login in AuthContext
      quickLoginUser(account.role);

      // Display a friendly confirmation toast
      toast.success(`Logged in as ${account.title} (Demo Mode)!`);

      // Redirect immediately to the role's designated dashboard page
      navigate(account.dashboardRoute, { replace: true });
    } catch (loginError) {
      // Show user-friendly error message if something went wrong
      toast.error('Could not complete quick login. Please try again.');
      console.error('Quick login error:', loginError);
      setActiveLoggingInRole(null);
    }
  }

  // ============================================================
  // HANDLER: Fill Form Inputs
  // Populates the username and password fields in the LoginForm above.
  // ============================================================
  function handleFillFormInputs(account) {
    if (typeof onFillCredentials === 'function') {
      // Pass the demo credentials to the parent form
      onFillCredentials(account.username, account.password);
      toast.success(`Filled ${account.title} credentials into form!`);
    }
  }

  // ============================================================
  // Helper function to return color classes for each role
  // Avoids complex nested inline ternaries per Rule 4.
  // ============================================================
  function getRoleCardTheme(role) {
    if (role === 'admin') {
      return {
        badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        borderHover: 'hover:border-indigo-400',
        quickButtonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        accentText: 'text-indigo-600',
      };
    } else if (role === 'teacher') {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        borderHover: 'hover:border-emerald-400',
        quickButtonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        accentText: 'text-emerald-600',
      };
    } else if (role === 'student') {
      return {
        badgeBg: 'bg-blue-100 text-blue-700 border-blue-200',
        borderHover: 'hover:border-blue-400',
        quickButtonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
        accentText: 'text-blue-600',
      };
    } else {
      // Parent role theme
      return {
        badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
        borderHover: 'hover:border-purple-400',
        quickButtonBg: 'bg-purple-600 hover:bg-purple-700 text-white',
        accentText: 'text-purple-600',
      };
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      {/* Header section with lighting bolt icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
            ⚡
          </span>
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Quick Demo Login
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          Testing & Viva Access
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Click <span className="font-semibold text-gray-700">Quick Login</span> to jump straight into any role, or <span className="font-semibold text-gray-700">Fill</span> to test the form.
      </p>

      {/* Grid of role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {demoAccountList.map(function (account) {
          // Get the theme styling for this role
          const theme = getRoleCardTheme(account.role);
          const isThisRoleProcessing = activeLoggingInRole === account.role;

          return (
            <div
              key={account.role}
              className={`p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-150 ${theme.borderHover}`}
            >
              {/* Role Title and Badge */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-gray-900">
                  {account.title}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${theme.badgeBg}`}
                >
                  {account.role}
                </span>
              </div>

              {/* Short Description */}
              <p className="text-xs text-gray-500 mb-2 leading-tight">
                {account.description}
              </p>

              {/* Username preview */}
              <div className="text-[11px] text-gray-400 mb-2 font-mono truncate">
                User: <span className="text-gray-600">{account.username}</span>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center space-x-1.5 pt-1">
                {/* 1. Quick Sign In button */}
                <button
                  type="button"
                  disabled={activeLoggingInRole !== null}
                  onClick={function () {
                    handleQuickSignIn(account);
                  }}
                  className={`flex-1 py-1 px-2 text-xs font-medium rounded shadow-sm transition-colors text-center disabled:opacity-50 ${theme.quickButtonBg}`}
                >
                  {isThisRoleProcessing ? 'Entering...' : '⚡ Quick Login'}
                </button>

                {/* 2. Auto-fill form inputs button */}
                {onFillCredentials && (
                  <button
                    type="button"
                    disabled={activeLoggingInRole !== null}
                    onClick={function () {
                      handleFillFormInputs(account);
                    }}
                    title="Fill this account credentials into the form"
                    className="py-1 px-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors disabled:opacity-50"
                  >
                    Fill
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
