import TaskCard from "../TaskCard/TaskCard";
import "./TasksSection.css";
import type { Task } from "../../../types/operatorSchedule";

interface TasksSectionProps {
	tasks: Task[];
	currentDate: Date;
	setCurrentDate: (date: Date) => void;
	handleStartTask: (taskId: string) => void;
	getTaskStatusColor: (status: Task["status"]) => string;
	getPriorityColor: (priority: Task["priority"]) => string;
	getEfficiencyColor: (efficiency: number) => string;
	formatTime: (minutes: number) => string;
	onDateChange?: (date: Date) => void;
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
	onDateChange,
}: TasksSectionProps) {
	return (
		<div className="tasks-section">
			<div className="section-header">
				<h3>Tarefas do Dia</h3>
				<div className="date-selector">
					<button
						className="date-nav"
						onClick={() => {
							const newDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
							setCurrentDate(newDate);
							onDateChange?.(newDate);
						}}
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
						onClick={() => {
							const newDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
							setCurrentDate(newDate);
							onDateChange?.(newDate);
						}}
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
