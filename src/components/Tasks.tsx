import { CheckCircle, Clock } from "lucide-react";
import dayjs from "dayjs";

const TasksComponent = ({ tasks }: {
    tasks: { id: number; title: string; status: string; deadline: number }[];
}) => {
	return (
		<div className=" bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-lg font-bold text-gray-700">Task List</h2>
				{/* <div className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
					+ Add Task
				</div> */}
			</div>

			<div className="overflow-y-auto">
				{tasks.map((task) => (
					<div
						key={task.id}
						className="mb-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
					>
						<div className="flex justify-between">
							<div className="flex items-start">
								{task.status === "completed" ? (
									<CheckCircle
										size={18}
										className="text-green-500 mr-2 mt-0.5"
									/>
								) : task.status === "in-progress" ? (
									<Clock size={18} className="text-blue-500 mr-2 mt-0.5" />
								) : (
									<div className="w-4 h-4 rounded-full border-2 border-gray-300 mr-2 mt-1"></div>
								)}
								<div>
									<div
										className={`font-medium ${task.status === "completed" ? "line-through text-gray-500" : "text-gray-800"}`}
									>
										{task.title}
									</div>
									<div className="text-xs text-gray-500 mt-1 text-left">
										Due: {dayjs(task.deadline).calendar(null)}
									</div>
								</div>
							</div>

							<div>
								<span
									className={`text-xs px-2 py-1 rounded-full ${
										task.status === "completed"
											? "bg-green-100 text-green-800"
											: task.status === "in-progress"
												? "bg-blue-100 text-blue-800"
												: "bg-gray-100 text-gray-800"
									}`}
								>
									{task.status === "completed"
										? "Completed"
										: task.status === "in-progress"
											? "In Progress"
											: "Pending"}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-auto pt-4 border-t border-gray-100">
				<div className="flex justify-between text-sm">
					<span className="text-gray-500">7 tasks total</span>
					<span className="text-gray-500">
						2 completed • 1 in progress • 4 pending
					</span>
				</div>
			</div>
		</div>
	);
};

export default TasksComponent;
