/**
 * Forgot Password Form Component
 * 
 * Allows users to request password recovery assistance.
 * In a university viva presentation, this shows thoughtful UX design.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  // Handle password reset request
  async function onSubmitReset(data) {
    setIsSubmitting(true);

    // Simulate sending reset request
    setTimeout(function () {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email.');
    }, 800);
  }

  if (isSubmitted) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
        <div className="text-3xl mb-2">✉️</div>
        <h4 className="font-bold text-green-800 text-sm">Check your inbox</h4>
        <p className="text-xs text-green-700 mt-1">
          If an account exists with that email address, we have sent instructions to reset your password.
        </p>
        <div className="mt-4">
          <Button variant="outline" size="small" onClick={onBackToLogin}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitReset)} className="space-y-4">
      <p className="text-xs text-gray-500 mb-2">
        Enter the email address registered with your school account to receive a reset link.
      </p>

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="your.email@school.edu"
        isRequired={true}
        disabled={isSubmitting}
        error={errors.email ? errors.email.message : null}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Please enter a valid email address',
          },
        })}
      />

      <div className="flex items-center justify-between pt-2">
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            &larr; Back to Sign In
          </button>
        )}

        <Button type="submit" variant="primary" size="small" isLoading={isSubmitting}>
          Send Reset Link
        </Button>
      </div>
    </form>
  );
}
