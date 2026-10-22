/**
 * Registration Form Component
 * 
 * Allows new users or administrators to register a user account.
 * Communicates with Django endpoint: POST /api/auth/register/
 * 
 * USES:
 * - 'react-hook-form' for client-side form validation
 * - 'registerUser' from src/api/auth.js
 * - 'react-hot-toast' for user notifications
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { registerUser } from '../../api/auth';
import Input from '../common/Input';
import Button from '../common/Button';
import { USER_ROLES } from '../../utils/constants';

export default function RegisterForm({ onRegistrationSuccess }) {
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: USER_ROLES.STUDENT,
      password: '',
      confirm_password: '',
    },
  });

  // Watch the password field value so we can validate confirm_password matches
  const watchedPassword = watch('password');

  // ============================================================
  // FORM SUBMISSION HANDLER
  // ============================================================
  async function onSubmitRegisterForm(formData) {
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const responseData = await registerUser(formData);
      toast.success(`Account for ${responseData.username || 'user'} created successfully!`);

      // Reset form fields
      reset();

      // Trigger optional parent callback if provided
      if (onRegistrationSuccess) {
        onRegistrationSuccess(responseData);
      }
    } catch (apiError) {
      let userFriendlyMessage = 'Failed to create account. Please check the entered data.';

      if (apiError.response && apiError.response.data) {
        const errorData = apiError.response.data;
        // Check if there are specific field error messages from Django
        const errorKeys = Object.keys(errorData);
        if (errorKeys.length > 0) {
          const firstKey = errorKeys[0];
          const firstErrorMessage = errorData[firstKey];
          if (Array.isArray(firstErrorMessage)) {
            userFriendlyMessage = `${firstKey}: ${firstErrorMessage[0]}`;
          } else {
            userFriendlyMessage = `${firstKey}: ${firstErrorMessage}`;
          }
        }
      }

      setErrorMessage(userFriendlyMessage);
      toast.error(userFriendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitRegisterForm)} className="space-y-4">
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <p className="font-semibold">Registration Error</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Username Field */}
      <Input
        label="Username"
        name="username"
        type="text"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.username ? errors.username.message : null}
        {...register('username', {
          required: 'Username is required',
          minLength: { value: 3, message: 'Minimum 3 characters required' },
        })}
      />

      {/* Email Field */}
      <Input
        label="Email Address"
        name="email"
        type="email"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.email ? errors.email.message : null}
        {...register('email', {
          required: 'Email address is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address format',
          },
        })}
      />

      {/* First Name & Last Name (Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="First Name"
          name="first_name"
          type="text"
          disabled={isSubmitting}
          {...register('first_name')}
        />
        <Input
          label="Last Name"
          name="last_name"
          type="text"
          disabled={isSubmitting}
          {...register('last_name')}
        />
      </div>

      {/* Role Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
          User Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          {...register('role', { required: 'Please select a role' })}
        >
          <option value={USER_ROLES.STUDENT}>Student</option>
          <option value={USER_ROLES.TEACHER}>Teacher</option>
          <option value={USER_ROLES.PARENT}>Parent</option>
          <option value={USER_ROLES.ADMIN}>School Administrator</option>
        </select>
      </div>

      {/* Password Field */}
      <Input
        label="Password"
        name="password"
        type="password"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.password ? errors.password.message : null}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Password must be at least 6 characters' },
        })}
      />

      {/* Confirm Password Field */}
      <Input
        label="Confirm Password"
        name="confirm_password"
        type="password"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.confirm_password ? errors.confirm_password.message : null}
        {...register('confirm_password', {
          required: 'Please confirm your password',
          validate: function (value) {
            if (value !== watchedPassword) {
              return 'Passwords do not match';
            }
            return true;
          },
        })}
      />

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isSubmitting}
        >
          Create Account
        </Button>
      </div>
    </form>
  );
}
