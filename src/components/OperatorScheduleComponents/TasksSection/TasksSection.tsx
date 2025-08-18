import TaskCard from "../TaskCard/TaskCard";
import "./TasksSection.css";

interface Break {
	id: string;
	type: "coffee" | "lunch" | "bathroom" | "other";
	startTime: string;
	endTime?: string;
	duration?: number;
}

interface Task {
	id: string;
	orderId: string;
	productName: string;
	activity: string;
	sector: string;
	description: string;
	estimatedTime: number;
	setupTime: number;
	startTime: string;
	endTime: string;
	status: "pending" | "in_progress" | "paused" | "completed" | "delayed";
	actualStartTime?: string;
	actualEndTime?: string;
	actualTime?: number;
	priority: "low" | "medium" | "high" | "urgent";
	requiredSkills: string[];
	breaks: Break[];
	nonConformities: string[];
}

interface TasksSectionProps {
	tasks: Task[];
	currentDate: Date;
	setCurrentDate: (date: Date) => void;
	handleStartTask: (taskId: string) => void;
	getTaskStatusColor: (status: Task["status"]) => string;
	getPriorityColor: (priority: Task["priority"]) => string;
	getEfficiencyColor: (efficiency: number) => string;
	formatTime: (minutes: number) => string;
}

export default function TasksSection({
	tasks,
	currentDate,
	setCurrentDate,
	handleStartTask,
	getTaskStatusColor,
	getPriorityColor,
	getEfficiencyColor,
	formatTime,
}: TasksSectionProps) {
	return (
		<div className="tasks-section">
			<div className="section-header">
				<h3>Tarefas do Dia</h3>
				<div className="date-selector">
					<button
						className="date-nav"
						onClick={() =>
							setCurrentDate(
								new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
							)
						}
					>
						←
					</button>
					<span className="current-date">
						{currentDate.toLocaleDateString("pt-BR", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
					<button
						className="date-nav"
						onClick={() =>
							setCurrentDate(
								new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
							)
						}
					>
						→
					</button>
				</div>
			</div>

			<div className="tasks-list">
				{tasks.map((task) => (
					<TaskCard
						key={task.id}
						task={task}
						handleStartTask={handleStartTask}
						getTaskStatusColor={getTaskStatusColor}
						getPriorityColor={getPriorityColor}
						getEfficiencyColor={getEfficiencyColor}
						formatTime={formatTime}
					/>
				))}
			</div>
		</div>
	);
}
