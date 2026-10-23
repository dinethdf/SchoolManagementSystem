/**
 * Reusable Confirmation Dialog Component
 * 
 * Displays a clear modal confirmation prompt before performing
 * destructive actions (such as Deleting a class, removing a student, etc.).
 * 
 * PROPS:
 * - isOpen: Boolean - controls visibility
 * - title: Heading (default: "Are you sure?")
 * - message: Detailed explanation of the consequences
 * - confirmLabel: Text for the confirmation button (default: "Confirm")
 * - cancelLabel: Text for the cancel button (default: "Cancel")
 * - isDestructive: If true, formats the button in danger red (default: true)
 * - isLoading: If true, shows a spinner on the confirm button
 * - onConfirm: Callback function when confirmed
 * - onCancel: Callback function when cancelled
 */
import React from 'react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
  isOpen = false,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Do you wish to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Warning Icon Badge & Message */}
        <div className="flex items-start space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${
              isDestructive
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-600'
            }`}
          >
            ⚠️
          </div>
          <p className="text-sm text-gray-600 leading-relaxed pt-1">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="small"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="small"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
