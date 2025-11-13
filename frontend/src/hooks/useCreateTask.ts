import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, type CreateTaskPayload } from '../api/tasks.js';

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
