import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddTaskDialog, type AddTaskDialogProps } from './AddTaskDialog.js';

const renderAddTaskDialog = (overrideProps: Partial<AddTaskDialogProps> = {}) => {
  const defaultOnClose = vi.fn();
  const defaultOnSubmit = vi.fn();

  const props: AddTaskDialogProps = {
    open: true,
    onClose: defaultOnClose,
    onSubmit: defaultOnSubmit,
    submitLabel: 'Add task',
    ...overrideProps,
  };

  const user = userEvent.setup();
  const renderResult = render(<AddTaskDialog {...props} />);

  return {
    user,
    onClose: props.onClose,
    onSubmit: props.onSubmit,
    ...renderResult,
    rerender: (newProps: Partial<AddTaskDialogProps> = {}) =>
      renderResult.rerender(<AddTaskDialog {...props} {...newProps} />),
  };
};

describe('AddTaskDialog', () => {
  it('renders the dialog content when open', () => {
    renderAddTaskDialog();

    expect(screen.getByRole('heading', { name: 'Add Task' })).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', async () => {
    const { user, onClose } = renderAddTaskDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('submits trimmed form values and closes the dialog', async () => {
    const onSubmit = vi.fn();
    const { user, onClose } = renderAddTaskDialog({ onSubmit });

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), '  Prototype ideas  ');
    await user.type(screen.getByLabelText('Description'), 'Build wireframes');
    await user.type(screen.getByLabelText('Assignee'), 'Jordan');
    await user.selectOptions(screen.getByLabelText('Status'), ['IN_PROGRESS']);
    await user.selectOptions(screen.getByLabelText('Priority'), ['HIGH']);
    await user.type(screen.getByLabelText('Due date'), '2024-04-12');
    await user.clear(screen.getByLabelText('Tags'));
    await user.type(screen.getByLabelText('Tags'), ' ui , design ');

    await user.click(screen.getByRole('button', { name: 'Add task' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Prototype ideas',
      description: 'Build wireframes',
      assignee: 'Jordan',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: '2024-04-12',
      tags: ['ui', 'design'],
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
