import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AddTaskDialog, type AddTaskDialogProps } from './AddTaskDialog.js';
import { setupUser } from '../test/setupUser.js';

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

  const user = setupUser();
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

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const assigneeInput = screen.getByLabelText('Assignee');
    const statusSelect = screen.getByLabelText('Status');
    const prioritySelect = screen.getByLabelText('Priority');
    const dueDateInput = screen.getByLabelText('Due date');
    const tagsInput = screen.getByLabelText('Tags');
    const submitButton = screen.getByRole('button', { name: 'Add task' });

    await user.clear(titleInput);
    await user.type(titleInput, '  Prototype ideas  ');
    await user.type(descriptionInput, 'Build wireframes');
    await user.type(assigneeInput, 'Jordan');
    await user.selectOptions(statusSelect, ['IN_PROGRESS']);
    await user.selectOptions(prioritySelect, ['HIGH']);
    await user.type(dueDateInput, '2024-04-12');
    await user.clear(tagsInput);
    await user.type(tagsInput, ' ui , design ');
    await user.click(submitButton);

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
