/**
 * Form Validator Utilities
 * 
 * Reusable validation functions for checking user inputs before
 * sending requests to the backend server.
 */

// ============================================================
// EMAIL VALIDATOR
// Checks whether an email string follows standard user@domain.tld format
// ============================================================
export function isValidEmail(emailString) {
  if (!emailString || typeof emailString !== 'string') {
    return false;
  }

  // Standard email regular expression
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailPattern.test(emailString.trim());
}

// ============================================================
// PHONE NUMBER VALIDATOR
// Checks if string contains at least 7 digits
// ============================================================
export function isValidPhoneNumber(phoneNumberString) {
  if (!phoneNumberString) {
    return false;
  }

  // Count how many numeric digits are present
  let digitCount = 0;
  for (let i = 0; i < phoneNumberString.length; i++) {
    const char = phoneNumberString[i];
    if (char >= '0' && char <= '9') {
      digitCount = digitCount + 1;
    }
  }

  return digitCount >= 7;
}

// ============================================================
// PASSWORD STRENGTH VALIDATOR
// Checks minimum length (6 characters) for student/school users
// ============================================================
export function isStrongPassword(passwordString) {
  if (!passwordString || typeof passwordString !== 'string') {
    return false;
  }

  return passwordString.length >= 6;
}
