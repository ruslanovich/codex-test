import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TaskCard } from './TaskCard.js';
import type { Task } from '../types.js';
import { setupUser } from '../test/setupUser.js';

describe('TaskCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const task: Task = {
    id: '1',
    title: 'Design layout',
    status: 'TODO',
    priority: 'HIGH',
    assignee: 'Alex Morgan',
    tags: ['design'],
    order: 0,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders task title and priority', () => {
    render(<TaskCard task={task} onDelete={() => {}} onEdit={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Design layout' })).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('shows a delete button and confirms before deleting', async () => {
    const user = setupUser();
    const handleDelete = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<TaskCard task={task} onDelete={handleDelete} onEdit={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete task "Design layout"' });
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete "Design layout"?');
    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = setupUser();
    const handleDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<TaskCard task={task} onDelete={handleDelete} onEdit={vi.fn()} />);

    const deleteButton = screen.getByRole('button', { name: 'Delete task "Design layout"' });
    await user.click(deleteButton);

    expect(handleDelete).not.toHaveBeenCalled();
  });
});
