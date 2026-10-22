/**
 * Login Form Component
 * 
 * This component provides the interactive form where users enter their
 * username and password to log into the School Management System.
 * 
 * HOW IT WORKS:
 * 1. Uses 'react-hook-form' to manage input state and perform form validation.
 * 2. On submit, calls 'loginUser' from our AuthContext.
 * 3. Shows an inline error alert banner if authentication fails.
 * 4. On success, displays a toast notification and redirects the user
 *    to their specific dashboard based on their role (Admin, Teacher, Student, Parent).
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { USER_ROLES } from '../../utils/constants';

export default function LoginForm() {
  // Navigation hook to redirect user after login
  const navigate = useNavigate();
  const location = useLocation();

  // Authentication hook providing loginUser function
  const { loginUser } = useAuth();

  // Local state for storing API error messages to show in the UI
  const [errorMessage, setErrorMessage] = useState('');
  
  // Local state to indicate when login request is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // ============================================================
  // FORM SUBMISSION HANDLER
  // Called when user clicks "Sign In" and form inputs pass validation.
  // ============================================================
  async function onSubmitLoginForm(formData) {
    // Clear any previous error message
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Send credentials to backend via AuthContext
      const loggedInUserData = await loginUser({
        username: formData.username,
        password: formData.password,
      });

      // Show success toast notification
      toast.success(`Welcome back, ${loggedInUserData.username || 'User'}!`);

      // Determine where to redirect the user
      // If the user was trying to access a specific page before being redirected to login,
      // send them back to that page. Otherwise, send to their role dashboard.
      const previousPage = location.state && location.state.from ? location.state.from.pathname : null;

      if (previousPage) {
        navigate(previousPage, { replace: true });
      } else {
        // Redirect based on user's role
        const role = loggedInUserData.role ? loggedInUserData.role.toLowerCase() : '';

        if (role === USER_ROLES.ADMIN) {
          navigate('/admin', { replace: true });
        } else if (role === USER_ROLES.TEACHER) {
          navigate('/teacher', { replace: true });
        } else if (role === USER_ROLES.STUDENT) {
          navigate('/student', { replace: true });
        } else if (role === USER_ROLES.PARENT) {
          navigate('/parent', { replace: true });
        } else {
          // Fallback to home page if role is unrecognized
          navigate('/', { replace: true });
        }
      }
    } catch (apiError) {
      // Determine user-friendly error message from response
      let userFriendlyMessage = 'Login failed. Please check your username and password.';

      if (apiError.response && apiError.response.data) {
        const errorData = apiError.response.data;
        if (errorData.message) {
          userFriendlyMessage = errorData.message;
        } else if (errorData.detail) {
          userFriendlyMessage = errorData.detail;
        } else if (errorData.error) {
          userFriendlyMessage = errorData.error;
        } else if (errorData.non_field_errors) {
          userFriendlyMessage = errorData.non_field_errors[0];
        }
      } else if (apiError.request) {
        userFriendlyMessage = 'Cannot connect to the backend server. Is Django running?';
      }

      setErrorMessage(userFriendlyMessage);
      toast.error(userFriendlyMessage);
    } finally {
      // Done submitting
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitLoginForm)} className="space-y-4">
      {/* Error alert banner shown when login fails */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <p className="font-medium">Authentication Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Username Input Field */}
      <Input
        label="Username"
        name="username"
        type="text"
        placeholder="Enter your username"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.username ? errors.username.message : null}
        {...register('username', {
          required: 'Username is required',
          minLength: {
            value: 3,
            message: 'Username must be at least 3 characters',
          },
        })}
      />

      {/* Password Input Field */}
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.password ? errors.password.message : null}
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 4,
            message: 'Password must be at least 4 characters',
          },
        })}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="medium"
          className="w-full"
          isLoading={isSubmitting}
        >
          Sign In
        </Button>
      </div>
    </form>
  );
}
