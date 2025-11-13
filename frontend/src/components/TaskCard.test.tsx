import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TaskCard } from './TaskCard.js';
import type { Task } from '../types.js';

describe('TaskCard', () => {
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
    render(<TaskCard task={task} onDelete={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Design layout' })).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });
});
