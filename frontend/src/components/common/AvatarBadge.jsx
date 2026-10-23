/**
 * Reusable Avatar Badge Component
 * 
 * Displays a circular user avatar with:
 * 1. The user's profile photo (if an image URL is supplied), OR
 * 2. The user's two-letter initials (e.g., "Sarah Connor" -> "SC")
 * 
 * STANDARDS FOLLOWED:
 * - Rule 1 & 4: Simple loop to extract name initials instead of complex regex.
 * - Rule 2: Detailed comments on size classes and initial extraction.
 * - Rule 3: Descriptive props and variable names.
 * 
 * PROPS:
 * - name: Full name or username of the person (e.g. "Super Admin")
 * - imageUrl: Optional URL for profile picture
 * - size: 'small', 'medium', 'large', 'xlarge' (default: 'medium')
 * - roleColor: 'purple' (admin), 'emerald' (teacher), 'blue' (student), 'amber' (parent)
 */
import React from 'react';

export default function AvatarBadge({
  name = '',
  imageUrl = null,
  size = 'medium',
  roleColor = 'indigo',
}) {
  // -------------------------------------------------------------
  // 1. Calculate Initials from Name
  // -------------------------------------------------------------
  let initials = 'U';

  if (name && typeof name === 'string') {
    // Split the name by spaces (e.g., "John Doe" -> ["John", "Doe"])
    const nameParts = name.trim().split(/\s+/);

    if (nameParts.length >= 2) {
      // First letter of first name + First letter of second name
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const secondInitial = nameParts[1].charAt(0).toUpperCase();
      initials = firstInitial + secondInitial;
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      // Single word: use first 2 letters if available
      initials = nameParts[0].slice(0, 2).toUpperCase();
    }
  }

  // -------------------------------------------------------------
  // 2. Determine Dimensions Based on Size Prop
  // -------------------------------------------------------------
  let sizeClasses = 'w-10 h-10 text-sm'; // default medium

  if (size === 'small') {
    sizeClasses = 'w-8 h-8 text-xs';
  } else if (size === 'large') {
    sizeClasses = 'w-14 h-14 text-lg';
  } else if (size === 'xlarge') {
    sizeClasses = 'w-20 h-20 text-2xl';
  }

  // -------------------------------------------------------------
  // 3. Determine Color Palette Based on Role
  // -------------------------------------------------------------
  let colorClasses = 'bg-indigo-100 text-indigo-700 border-indigo-200';

  if (roleColor === 'purple' || roleColor === 'admin') {
    colorClasses = 'bg-purple-100 text-purple-700 border-purple-200';
  } else if (roleColor === 'emerald' || roleColor === 'teacher') {
    colorClasses = 'bg-emerald-100 text-emerald-700 border-emerald-200';
  } else if (roleColor === 'blue' || roleColor === 'student') {
    colorClasses = 'bg-blue-100 text-blue-700 border-blue-200';
  } else if (roleColor === 'amber' || roleColor === 'parent') {
    colorClasses = 'bg-amber-100 text-amber-700 border-amber-200';
  }

  // If a valid image URL is provided, display the image
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'User Avatar'}
        className={`${sizeClasses} rounded-full object-cover border shadow-xs`}
      />
    );
  }

  // Fallback: Display circle with calculated 2-letter initials
  return (
    <div
      className={`inline-flex items-center justify-center font-bold rounded-full border shadow-xs select-none ${sizeClasses} ${colorClasses}`}
      title={name}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
