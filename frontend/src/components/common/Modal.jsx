import React from 'react';

/**
 * Common Reusable Modal Component
 * Accessible dialog popup for forms, confirmations, and details viewing.
 */
export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return <div className="modal">{children}</div>;
}
