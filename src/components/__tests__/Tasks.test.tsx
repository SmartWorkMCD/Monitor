// src/components/__tests__/Tasks.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/utils'
import Tasks from '../Tasks'
import { createMockTasks, createMockTask } from '../../test/utils'
import type { Task } from '../../types'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs: any = vi.fn(() => ({
    calendar: vi.fn(() => 'Tomorrow at 10:00 AM'),
    to: vi.fn(() => 'in 2 hours'),
  }))

  mockDayjs.extend = vi.fn()

  return { default: mockDayjs }
})

describe('Tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tasks container with correct structure', () => {
    const mockTasks = createMockTasks(3)
    render(<Tasks tasks={mockTasks} />)

    const container = screen.getByTestId('tasks-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col', 'h-full')
  })

  it('renders task list header correctly', () => {
    const mockTasks = createMockTasks(3)
    render(<Tasks tasks={mockTasks} />)

    expect(screen.getByTestId('tasks-header')).toBeInTheDocument()
    expect(screen.getByTestId('tasks-title')).toHaveTextContent('Task List')
  })

  it('displays empty state when no tasks provided', () => {
    render(<Tasks tasks={[]} />)

    expect(screen.getByTestId('tasks-empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('tasks-empty-state')).toHaveTextContent('No tasks available')

    // Should not show task items when empty
    expect(screen.queryByTestId('task-item')).not.toBeInTheDocument()
  })

  it('renders all provided tasks in the task list', () => {
    const mockTasks = createMockTasks(3)
    render(<Tasks tasks={mockTasks} />)

    const tasksList = screen.getByTestId('tasks-list')
    expect(tasksList).toBeInTheDocument()

    const taskItems = screen.getAllByTestId('task-item')
    expect(taskItems).toHaveLength(3)

    // Verify each task is rendered with correct data attributes
    mockTasks.forEach((task, index) => {
      expect(taskItems[index]).toHaveAttribute('data-task-id', task.id.toString())
      expect(taskItems[index]).toHaveAttribute('data-task-status', task.status)
    })
  })

  it('displays task content correctly for each task', () => {
    const task = createMockTask({
      id: 123,
      title: 'Test Task Title',
      status: 'pending'
    })
    render(<Tasks tasks={[task]} />)

    const taskItem = screen.getByTestId('task-item')
    expect(taskItem).toHaveAttribute('data-task-id', '123')
    expect(taskItem).toHaveAttribute('data-task-status', 'pending')

    expect(screen.getByTestId('task-content')).toBeInTheDocument()
    expect(screen.getByTestId('task-icon')).toBeInTheDocument()
    expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task Title')
    expect(screen.getByTestId('task-deadline')).toHaveTextContent('Due: Tomorrow at 10:00 AM')
  })

  it('displays correct status for completed tasks', () => {
    const completedTask = createMockTask({
      status: 'completed',
      title: 'Completed Task'
    })
    render(<Tasks tasks={[completedTask]} />)

    const taskTitle = screen.getByTestId('task-title')
    expect(taskTitle).toHaveClass('line-through', 'text-gray-500')

    const statusBadge = screen.getByTestId('task-status-badge')
    expect(statusBadge).toHaveTextContent('Completed')
    expect(statusBadge).toHaveAttribute('data-status', 'completed')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('displays correct status for in-progress tasks', () => {
    const inProgressTask = createMockTask({
      status: 'in-progress',
      title: 'In Progress Task'
    })
    render(<Tasks tasks={[inProgressTask]} />)

    const taskTitle = screen.getByTestId('task-title')
    expect(taskTitle).toHaveClass('text-gray-800')
    expect(taskTitle).not.toHaveClass('line-through')

    const statusBadge = screen.getByTestId('task-status-badge')
    expect(statusBadge).toHaveTextContent('In Progress')
    expect(statusBadge).toHaveAttribute('data-status', 'in-progress')
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('displays correct status for pending tasks', () => {
    const pendingTask = createMockTask({
      status: 'pending',
      title: 'Pending Task'
    })
    render(<Tasks tasks={[pendingTask]} />)

    const taskTitle = screen.getByTestId('task-title')
    expect(taskTitle).toHaveClass('text-gray-800')
    expect(taskTitle).not.toHaveClass('line-through')

    const statusBadge = screen.getByTestId('task-status-badge')
    expect(statusBadge).toHaveTextContent('Pending')
    expect(statusBadge).toHaveAttribute('data-status', 'pending')
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800')
  })

  it('calculates and displays correct task statistics', () => {
    const tasks: Task[] = [
      createMockTask({ status: 'completed' }),
      createMockTask({ status: 'completed' }),
      createMockTask({ status: 'in-progress' }),
      createMockTask({ status: 'pending' }),
      createMockTask({ status: 'pending' }),
    ]

    render(<Tasks tasks={tasks} />)

    const footer = screen.getByTestId('tasks-footer')
    expect(footer).toBeInTheDocument()

    const statistics = screen.getByTestId('tasks-statistics')
    expect(statistics).toBeInTheDocument()

    expect(screen.getByTestId('tasks-total-count')).toHaveTextContent('5 tasks total')
    expect(screen.getByTestId('tasks-status-breakdown')).toHaveTextContent('2 completed • 1 in progress • 2 pending')
  })

  it('handles edge case with zero tasks statistics', () => {
    render(<Tasks tasks={[]} />)

    expect(screen.getByTestId('tasks-total-count')).toHaveTextContent('0 tasks total')
    expect(screen.getByTestId('tasks-status-breakdown')).toHaveTextContent('0 completed • 0 in progress • 0 pending')
  })

  it('applies hover effects to task items', () => {
    const task = createMockTask()
    render(<Tasks tasks={[task]} />)

    const taskItem = screen.getByTestId('task-item')
    expect(taskItem).toHaveClass('hover:bg-gray-50', 'transition-colors')
  })

  it('has proper scrollable content area', () => {
    const manyTasks = createMockTasks(10)
    render(<Tasks tasks={manyTasks} />)

    const tasksList = screen.getByTestId('tasks-list')
    expect(tasksList).toHaveClass('overflow-y-auto', 'flex-1')
  })

  it('displays task icons correctly for different statuses', () => {
    const tasks: Task[] = [
      createMockTask({ status: 'completed', title: 'Completed Task' }),
      createMockTask({ status: 'in-progress', title: 'In Progress Task' }),
      createMockTask({ status: 'pending', title: 'Pending Task' }),
    ]

    render(<Tasks tasks={tasks} />)

    const taskIcons = screen.getAllByTestId('task-icon')
    expect(taskIcons).toHaveLength(3)

    // Each task should have an icon
    taskIcons.forEach(icon => {
      expect(icon).toBeInTheDocument()
    })
  })

  it('can select tasks by specific status using data attributes', () => {
    const tasks: Task[] = [
      createMockTask({ id: 1, status: 'completed' }),
      createMockTask({ id: 2, status: 'in-progress' }),
      createMockTask({ id: 3, status: 'pending' }),
    ]

    const { container } = render(<Tasks tasks={tasks} />)

    const completedTask = container.querySelector('[data-task-status="completed"]')
    const inProgressTask = container.querySelector('[data-task-status="in-progress"]')
    const pendingTask = container.querySelector('[data-task-status="pending"]')

    expect(completedTask).toBeInTheDocument()
    expect(inProgressTask).toBeInTheDocument()
    expect(pendingTask).toBeInTheDocument()

    expect(completedTask).toHaveAttribute('data-task-id', '1')
    expect(inProgressTask).toHaveAttribute('data-task-id', '2')
    expect(pendingTask).toHaveAttribute('data-task-id', '3')
  })

  it('can select specific tasks by ID using data attributes', () => {
    const tasks = createMockTasks(3)
    const { container } = render(<Tasks tasks={tasks} />)

    tasks.forEach(task => {
      const taskElement = container.querySelector(`[data-task-id="${task.id}"]`)
      expect(taskElement).toBeInTheDocument()
      expect(taskElement).toHaveAttribute('data-task-status', task.status)
    })
  })

  it('maintains proper component hierarchy', () => {
    const tasks = createMockTasks(2)
    render(<Tasks tasks={tasks} />)

    const container = screen.getByTestId('tasks-container')
    const header = screen.getByTestId('tasks-header')
    const tasksList = screen.getByTestId('tasks-list')
    const footer = screen.getByTestId('tasks-footer')

    // Check hierarchy
    expect(container).toContainElement(header)
    expect(container).toContainElement(tasksList)
    expect(container).toContainElement(footer)

    // Check that task items are in the list
    const taskItems = screen.getAllByTestId('task-item')
    taskItems.forEach(item => {
      expect(tasksList).toContainElement(item)
    })
  })

  it('displays due dates with proper formatting', () => {
    const task = createMockTask({ title: 'Task with Date' })
    render(<Tasks tasks={[task]} />)

    const deadline = screen.getByTestId('task-deadline')
    expect(deadline).toHaveTextContent('Due: Tomorrow at 10:00 AM')
    expect(deadline).toHaveClass('text-xs', 'text-gray-500', 'mt-1', 'text-left')
  })

  it('maintains accessibility with proper structure', () => {
    const tasks = createMockTasks(2)
    render(<Tasks tasks={tasks} />)

    // All main elements should be visible
    expect(screen.getByTestId('tasks-container')).toBeVisible()
    expect(screen.getByTestId('tasks-header')).toBeVisible()
    expect(screen.getByTestId('tasks-list')).toBeVisible()
    expect(screen.getByTestId('tasks-footer')).toBeVisible()

    // Task items should be accessible
    const taskItems = screen.getAllByTestId('task-item')
    taskItems.forEach(item => {
      expect(item).toBeVisible()
    })
  })

  it('handles mixed task statuses correctly', () => {
    const tasks: Task[] = [
      createMockTask({ status: 'completed' }),
      createMockTask({ status: 'in-progress' }),
      createMockTask({ status: 'pending' }),
    ]

    render(<Tasks tasks={tasks} />)

    // Should have different status badges
    const statusBadges = screen.getAllByTestId('task-status-badge')
    expect(statusBadges).toHaveLength(3)

    const statuses = statusBadges.map(badge => badge.getAttribute('data-status'))
    expect(statuses).toContain('completed')
    expect(statuses).toContain('in-progress')
    expect(statuses).toContain('pending')
  })

  it('renders task status containers correctly', () => {
    const task = createMockTask()
    render(<Tasks tasks={[task]} />)

    const statusContainer = screen.getByTestId('task-status-container')
    expect(statusContainer).toBeInTheDocument()
    expect(statusContainer).toHaveClass('ml-4')

    const statusBadge = screen.getByTestId('task-status-badge')
    expect(statusContainer).toContainElement(statusBadge)
  })
})
