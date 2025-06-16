import { CheckCircle, AlertCircle, Play, Pause, RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import type { Task, TaskStatus } from "../types";

interface TasksProps {
	tasks: Task[];
}

// Helper function to get task status display properties
const getTaskStatusConfig = (status: TaskStatus) => {
	const configs = {
		completed: {
			icon: <CheckCircle size={18} className="text-green-500 mr-2 mt-0.5" />,
			badgeClass: "bg-green-100 text-green-800",
			textClass: "line-through text-gray-500",
			label: "Completed",
		},
		"in-progress": {
			icon: <Play size={18} className="text-blue-500 mr-2 mt-0.5" />,
			badgeClass: "bg-blue-100 text-blue-800",
			textClass: "text-gray-800",
			label: "In Progress",
		},
		started: {
			icon: <Play size={18} className="text-blue-500 mr-2 mt-0.5" />,
			badgeClass: "bg-blue-100 text-blue-800",
			textClass: "text-gray-800",
			label: "Started",
		},
		waiting_confirmation: {
			icon: <Pause size={18} className="text-yellow-500 mr-2 mt-0.5" />,
			badgeClass: "bg-yellow-100 text-yellow-800",
			textClass: "text-gray-800",
			label: "Awaiting Confirmation",
		},
		failed: {
			icon: <AlertCircle size={18} className="text-red-500 mr-2 mt-0.5" />,
			badgeClass: "bg-red-100 text-red-800",
			textClass: "text-gray-800",
			label: "Failed",
		},
		pending: {
			icon: (
				<div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2 mt-1" />
			),
			badgeClass: "bg-gray-100 text-gray-800",
			textClass: "text-gray-800",
			label: "Pending",
		},
	} as const;

	return configs[status];
};

// Helper function to calculate task statistics
const calculateTaskStats = (tasks: Task[]) => {
	const total = tasks.length;
	const completed = tasks.filter((task) => task.status === "completed").length;
	const inProgress = tasks.filter(
		(task) => task.status === "in-progress" || task.status === "started",
	).length;
	const pending = tasks.filter((task) => task.status === "pending").length;
	const waiting = tasks.filter((task) => task.status === "waiting_confirmation").length;
	const failed = tasks.filter((task) => task.status === "failed").length;

	return { total, completed, inProgress, pending, waiting, failed };
};

// Helper function to get priority based on task type and deadline
const getTaskPriority = (task: Task): 'high' | 'medium' | 'low' => {
	const now = Date.now();
	const timeUntilDeadline = task.deadline - now;
	const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

	// High priority for T2A (assembly) and T3x (packaging) tasks
	if (task.task_id?.startsWith('T2') || task.task_id?.startsWith('T3')) {
		return 'high';
	}

	// High priority if deadline is within 2 hours
	if (hoursUntilDeadline < 2) {
		return 'high';
	}

	// Medium priority if deadline is within 6 hours
	if (hoursUntilDeadline < 6) {
		return 'medium';
	}

	return 'low';
};

// Helper function to format duration
const formatDuration = (duration?: number): string => {
	if (!duration) return '';

	if (duration < 60) {
		return `${duration.toFixed(1)}s`;
	}

	if (duration < 3600) {
		return `${(duration / 60).toFixed(1)}m`;
	}

	return `${(duration / 3600).toFixed(1)}h`;
};

const Tasks = ({ tasks }: TasksProps) => {
	const stats = calculateTaskStats(tasks);

	// Sort tasks by priority and status
	const sortedTasks = [...tasks].sort((a, b) => {
		// First sort by status (active tasks first)
		const statusPriority = {
			'in-progress': 0,
			'started': 1,
			'waiting_confirmation': 2,
			'pending': 3,
			'failed': 4,
			'completed': 5
		};

		const aStatusPriority = statusPriority[a.status] ?? 6;
		const bStatusPriority = statusPriority[b.status] ?? 6;

		if (aStatusPriority !== bStatusPriority) {
			return aStatusPriority - bStatusPriority;
		}

		// Then sort by task priority
		const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
		const aPriority = getTaskPriority(a);
		const bPriority = getTaskPriority(b);

		if (aPriority !== bPriority) {
			return priorityOrder[aPriority] - priorityOrder[bPriority];
		}

		// Finally sort by deadline
		return a.deadline - b.deadline;
	});

	return (
		<div
			className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full"
			data-testid="tasks-container"
		>
			{/* Header */}
			<div className="flex justify-between items-center mb-4" data-testid="tasks-header">
				<h2 className="text-lg font-bold text-gray-700" data-testid="tasks-title">
					Task Management
				</h2>
				<div className="text-sm text-gray-500">
					{stats.inProgress > 0 && (
						<span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
							<div className="w-2 h-2 bg-blue-400 rounded-full mr-1 animate-pulse" />
							{stats.inProgress} active
						</span>
					)}
				</div>
			</div>

			{/* Task list with scroll */}
			<div
				className="overflow-y-auto flex-1"
				data-testid="tasks-list"
			>
				{tasks.length === 0 ? (
					<div
						className="text-center text-gray-500 py-8"
						data-testid="tasks-empty-state"
					>
						<RotateCcw size={48} className="mx-auto text-gray-300 mb-4" />
						<p>No tasks assigned</p>
						<p className="text-sm mt-2">Waiting for task assignments from Workstation Brain...</p>
					</div>
				) : (
					sortedTasks.map((task) => {
						const statusConfig = getTaskStatusConfig(task.status);
						const priority = getTaskPriority(task);

						return (
							<div
								key={task.id}
								className={`mb-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
									priority === 'high' ? 'border-red-200 bg-red-50' :
									priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
									'border-gray-100'
								}`}
								data-testid="task-item"
								data-task-id={task.id}
								data-task-status={task.status}
								data-task-priority={priority}
							>
								<div className="flex justify-between">
									<div className="flex items-start flex-1" data-testid="task-content">
										<div data-testid="task-icon">
											{statusConfig.icon}
										</div>
										<div className="flex-1">
											<div className="flex items-center space-x-2">
												<div
													className={`font-medium ${statusConfig.textClass}`}
													data-testid="task-title"
												>
													{task.title}
												</div>
												{task.task_id && (
													<span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
														{task.task_id}
													</span>
												)}
												{task.product_id && (
													<span className="text-xs bg-blue-200 text-blue-600 px-2 py-1 rounded">
														{task.product_id}
													</span>
												)}
											</div>

											{/* Progress bar for active tasks */}
											{task.progress !== undefined && task.progress > 0 && (
												<div className="mt-2">
													<div className="flex justify-between text-xs text-gray-600 mb-1">
														<span>Progress</span>
														<span>{Math.round(task.progress * 100)}%</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-2">
														<div
															className="bg-blue-500 h-2 rounded-full transition-all duration-300"
															style={{ width: `${task.progress * 100}%` }}
														/>
													</div>
												</div>
											)}

											<div className="flex items-center justify-between mt-1">
												<div
													className="text-xs text-gray-500 text-left"
													data-testid="task-deadline"
												>
													Due: {dayjs(task.deadline).calendar()}
												</div>
												{task.duration && (
													<div className="text-xs text-green-600 font-medium">
														⏱️ {formatDuration(task.duration)}
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="ml-4 flex flex-col items-end space-y-1" data-testid="task-status-container">
										<span
											className={`text-xs px-2 py-1 rounded-full ${statusConfig.badgeClass}`}
											data-testid="task-status-badge"
											data-status={task.status}
										>
											{statusConfig.label}
										</span>
										{priority === 'high' && (
											<span className="text-xs text-red-600 font-medium">
												🔥 High Priority
											</span>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Footer with enhanced statistics */}
			<div
				className="mt-auto pt-4 border-t border-gray-100"
				data-testid="tasks-footer"
			>
				<div className="grid grid-cols-2 gap-4 mb-3">
					<div className="text-center">
						<div className="text-lg font-bold text-blue-600">{stats.inProgress}</div>
						<div className="text-xs text-gray-600">Active</div>
					</div>
					<div className="text-center">
						<div className="text-lg font-bold text-green-600">{stats.completed}</div>
						<div className="text-xs text-gray-600">Completed</div>
					</div>
				</div>

				<div className="flex justify-between text-sm" data-testid="tasks-statistics">
					<span
						className="text-gray-500"
						data-testid="tasks-total-count"
					>
						{stats.total} tasks total
					</span>
					<span
						className="text-gray-500"
						data-testid="tasks-status-breakdown"
					>
						{stats.pending} pending{stats.waiting > 0 && ` • ${stats.waiting} waiting`}{stats.failed > 0 && ` • ${stats.failed} failed`}
					</span>
				</div>

				{/* Task completion rate */}
				{stats.total > 0 && (
					<div className="mt-2">
						<div className="flex justify-between text-xs text-gray-600 mb-1">
							<span>Completion Rate</span>
							<span>{Math.round((stats.completed / stats.total) * 100)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-1">
							<div
								className="bg-green-500 h-1 rounded-full transition-all duration-300"
								style={{ width: `${(stats.completed / stats.total) * 100}%` }}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Tasks;
