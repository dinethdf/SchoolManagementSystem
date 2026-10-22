/**
 * Common Form Input Component
 * 
 * This component provides a standard text input field for all forms.
 * It includes:
 * - A visible label above the input
 * - Clear red error message display below the input when validation fails
 * - Optional helper text for user guidance
 * - Full support for React Hook Form using React.forwardRef
 * 
 * PROPS:
 * - label: The text label shown above the input (e.g. "Username", "Password")
 * - name: The unique form field name (e.g. "username")
 * - type: HTML input type (e.g. "text", "password", "email", "date", "number")
 * - placeholder: Helpful placeholder text inside the input
 * - error: Error message string from validation (or null if no error)
 * - helperText: Optional guidance text shown below input
 * - isRequired: If true, shows a red asterisk next to the label
 */
import React, { forwardRef } from 'react';

// forwardRef allows React Hook Form's register() to directly access this input element
const Input = forwardRef(function Input(
  {
    label,
    name,
    type = 'text',
    placeholder = '',
    error = null,
    helperText = '',
    isRequired = false,
    className = '',
    disabled = false,
    ...otherProps
  },
  ref
) {
  // Determine border color based on whether there is an error
  let borderClasses = 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';

  if (error) {
    // If validation failed, highlight border in red
    borderClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500 text-red-900';
  }

  // Disabled styling
  const disabledClasses = disabled
    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
    : 'bg-white text-gray-900';

  return (
    <div className="w-full mb-4">
      {/* 1. Label Section */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* 2. Input Box */}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${borderClasses} ${disabledClasses} ${className}`}
        {...otherProps}
      />

      {/* 3. Validation Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">
          {error}
        </p>
      )}

      {/* 4. Optional Helper Guidance Text */}
      {!error && helperText && (
        <p className="mt-1 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
