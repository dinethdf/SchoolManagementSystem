import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function useModalForm({
  mutationFn,
  queryKey,
  defaultValues = {},
  onSuccess,
  onError,
  formOptions = {},
}) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({ defaultValues, ...formOptions });

  const mutation = useMutation({
    mutationFn,
    onSuccess: async (data, variables, context) => {
      if (queryKey) await queryClient.invalidateQueries({ queryKey });
      toast.success(data?.message || 'Saved successfully.');
      form.reset(defaultValues);
      setIsOpen(false);
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const data = error.response?.data;
      const firstFieldError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      toast.error(firstFieldError || data?.message || error.message || 'Unable to save changes.');
      onError?.(error, variables, context);
    },
  });

  function openModal(initialValues = defaultValues) {
    form.reset(initialValues);
    setIsOpen(true);
  }

  function closeModal() {
    if (mutation.isPending) return;
    setIsOpen(false);
    form.reset(defaultValues);
  }

  return {
    form,
    mutation,
    isOpen,
    openModal,
    closeModal,
    submit: form.handleSubmit((values) => mutation.mutate(values)),
  };
}
