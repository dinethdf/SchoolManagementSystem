/**
 * Formatter Utilities
 * 
 * Helper functions to transform raw database values into clean,
 * human-readable text for display in tables, headers, and reports.
 */

// ============================================================
// FORMAT DATE
// Converts an ISO date string (e.g. '2026-10-22') into 'Oct 22, 2026'
// ============================================================
export function formatDate(isoDateString) {
  if (!isoDateString) {
    return 'N/A';
  }

  const parsedDate = new Date(isoDateString);

  // If date parsing was invalid, return original string
  if (isNaN(parsedDate.getTime())) {
    return isoDateString;
  }

  // Format into standard month, day, year
  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================
// FORMAT PERCENTAGE
// Converts a decimal or number into a readable percentage string '92.5%'
// ============================================================
export function formatPercentage(numericValue) {
  if (numericValue === null || numericValue === undefined || isNaN(numericValue)) {
    return '0.0%';
  }

  const percentageNumber = Number(numericValue);
  return percentageNumber.toFixed(1) + '%';
}

// ============================================================
// FORMAT ROLE TITLE
// Converts internal role code ('admin', 'teacher') into human title
// ============================================================
export function formatRole(roleString) {
  if (!roleString) {
    return 'Guest';
  }

  const normalizedRole = roleString.toLowerCase();

  if (normalizedRole === 'admin') {
    return 'School Administrator';
  } else if (normalizedRole === 'teacher') {
    return 'Teacher';
  } else if (normalizedRole === 'student') {
    return 'Student';
  } else if (normalizedRole === 'parent') {
    return 'Parent / Guardian';
  }

  // Fallback: capitalize first letter
  return roleString.charAt(0).toUpperCase() + roleString.slice(1);
}

// ============================================================
// FORMAT FULL NAME
// Combines first name and last name, or falls back to username
// ============================================================
export function formatFullName(firstName, lastName, fallbackUsername) {
  const cleanFirstName = firstName ? firstName.trim() : '';
  const cleanLastName = lastName ? lastName.trim() : '';

  if (cleanFirstName || cleanLastName) {
    return `${cleanFirstName} ${cleanLastName}`.trim();
  }

  return fallbackUsername || 'Anonymous User';
}
