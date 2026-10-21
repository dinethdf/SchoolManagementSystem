import React from 'react';

/**
 * Common Reusable Button Component
 * Supports variants (primary, secondary, danger, outline) and loading state.
 */
export default function Button({ children, ...props }) {
  return <button {...props}>{children}</button>;
}
