import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AddTaskDialog } from './AddTaskDialog.js';

describe('AddTaskDialog', () => {
  it('validates required fields and submits the create task mutation', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      function Harness() {
        const [open, setOpen] = useState(true);
        return (
          <AddTaskDialog
            isOpen={open}
            onClose={() => {
              onClose();
              setOpen(false);
            }}
            onCreate={onCreate}
            isSubmitting={false}
            mutationError={null}
            onSuccess={() => {
              onSuccess();
              setOpen(false);
            }}
          />
        );
      }

      render(<Harness />);

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /create task/i }));
      });
      await act(async () => {});
      expect(await screen.findByRole('alert')).toHaveTextContent('Title is required');

      await user.type(screen.getByLabelText(/title/i), '  Launch feature  ');
      await user.type(screen.getByLabelText(/description/i), 'Publish release notes');
      await user.selectOptions(screen.getByLabelText(/status/i), 'IN_PROGRESS');
      await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /create task/i }));
      });
      await act(async () => {});

      await waitFor(() =>
        expect(onCreate).toHaveBeenCalledWith({
          title: 'Launch feature',
          description: 'Publish release notes',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
        }),
      );

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
      expect(onClose).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
