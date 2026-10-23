/**
 * Reusable Form Section Wrapper Component
 * 
 * Visually groups related form inputs under a clear title and description.
 * Examples:
 * - "Student Personal Information" (Name, DOB, Blood Group)
 * - "Academic Enrollment" (Class, Roll Number, Admission Date)
 * - "Guardian & Emergency Contacts" (Parent Name, Phone)
 * 
 * PROPS:
 * - title: Heading for this form section
 * - description: Optional short guidance text for the user
 * - columns: 1 or 2 (controls the responsive grid layout of the children inputs)
 * - children: The form input fields
 */
import React from 'react';

export default function FormSection({
  title,
  description = null,
  columns = 2,
  children,
}) {
  // Determine grid columns classes
  let gridClasses = 'grid grid-cols-1 md:grid-cols-2 gap-4';
  if (columns === 1) {
    gridClasses = 'grid grid-cols-1 gap-4';
  }

  return (
    <div className="py-5 border-b border-gray-100 last:border-b-0 space-y-4">
      {/* Section Header */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>

      {/* Inputs Container */}
      <div className={gridClasses}>
        {children}
      </div>
    </div>
  );
}
