import React from 'react';
import Button from './Button';

export default function ModalFooter({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Save changes',
  submitFormId,
  isLoading = false,
  disabled = false,
  destructive = false,
  extraAction,
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>{extraAction}</div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          form={submitFormId}
          variant={destructive ? 'danger' : 'primary'}
          isLoading={isLoading}
          disabled={disabled}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
