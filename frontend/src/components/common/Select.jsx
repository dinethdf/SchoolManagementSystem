/**
 * Common Form Select Component
 *
 * Provides a standard dropdown select field for all forms.
 * Supports React Hook Form via forwardRef.
 *
 * PROPS:
 * - label: Text label shown above the select
 * - name: Unique form field name
 * - options: Array of { value, label } objects
 * - placeholder: Text shown when no option selected
 * - error: Error message string from validation
 * - helperText: Optional guidance text
 * - isRequired: If true, shows red asterisk
 * - disabled: If true, disables the select
 * - className: Additional CSS classes
 */
import React, { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    name,
    options = [],
    placeholder = 'Select an option',
    error = null,
    helperText = '',
    isRequired = false,
    className = '',
    disabled = false,
    ...otherProps
  },
  ref
) {
  // Determine border color based on error state
  let borderClasses = 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';

  if (error) {
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

      {/* 2. Select Box */}
      <select
        ref={ref}
        id={name}
        name={name}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 transition duration-150 ease-in-out ${borderClasses} ${disabledClasses} ${className}`}
        {...otherProps}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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

export default Select;