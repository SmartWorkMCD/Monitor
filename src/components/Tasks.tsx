import { CheckCircle, Clock } from "lucide-react";
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
			icon: <Clock size={18} className="text-blue-500 mr-2 mt-0.5" />,
			badgeClass: "bg-blue-100 text-blue-800",
			textClass: "text-gray-800",
			label: "In Progress",
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
		(task) => task.status === "in-progress",
	).length;
	const pending = tasks.filter((task) => task.status === "pending").length;

	return { total, completed, inProgress, pending };
};

const Tasks = ({ tasks }: TasksProps) => {
	const stats = calculateTaskStats(tasks);

	return (
		<div
			className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full"
			data-testid="tasks-container"
		>
			{/* Header */}
			<div className="flex justify-between items-center mb-4" data-testid="tasks-header">
				<h2 className="text-lg font-bold text-gray-700" data-testid="tasks-title">
					Task List
				</h2>
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
						No tasks available
					</div>
				) : (
					tasks.map((task) => {
						const statusConfig = getTaskStatusConfig(task.status);

						return (
							<div
								key={task.id}
								className="mb-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
								data-testid="task-item"
								data-task-id={task.id}
								data-task-status={task.status}
							>
								<div className="flex justify-between">
									<div className="flex items-start" data-testid="task-content">
										<div data-testid="task-icon">
											{statusConfig.icon}
										</div>
										<div>
											<div
												className={`font-medium ${statusConfig.textClass}`}
												data-testid="task-title"
											>
												{task.title}
											</div>
											<div
												className="text-xs text-gray-500 mt-1 text-left"
												data-testid="task-deadline"
											>
												Due: {dayjs(task.deadline).calendar()}
											</div>
										</div>
									</div>

									<div className="ml-4" data-testid="task-status-container">
										<span
											className={`text-xs px-2 py-1 rounded-full ${statusConfig.badgeClass}`}
											data-testid="task-status-badge"
											data-status={task.status}
										>
											{statusConfig.label}
										</span>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Footer with statistics */}
			<div
				className="mt-auto pt-4 border-t border-gray-100"
				data-testid="tasks-footer"
			>
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
						{stats.completed} completed • {stats.inProgress} in progress •{" "}
						{stats.pending} pending
					</span>
				</div>
			</div>
		</div>
	);
};

export default Tasks;
