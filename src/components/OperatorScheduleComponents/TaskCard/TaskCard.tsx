import { FaPlay } from "react-icons/fa";
import "./TaskCard.css";
import type { Task } from "../../../types/operatorSchedule";

interface TaskCardProps {
  task: Task;
  handleStartTask: (taskId: string) => void;
  getTaskStatusColor: (status: Task["status"]) => string;
  getPriorityColor: (priority: Task["priority"]) => string;
  getEfficiencyColor: (efficiency: number) => string;
  formatTime: (minutes: number) => string;
}

export default function TaskCard({
  task,
  handleStartTask,
  getTaskStatusColor,
  getPriorityColor,
  getEfficiencyColor,
  formatTime,
}: TaskCardProps) {
  return (
    <div className={`task-card ${task.status}`}>
      <div className="task-timeline">
        <div className="time-slot">
          <span className="start-time">{task.startTime}</span>
          <span className="end-time">{task.endTime}</span>
        </div>
        <div
          className="timeline-indicator"
          style={{ backgroundColor: getTaskStatusColor(task.status) }}
        >
          <div className="timeline-dot"></div>
        </div>
      </div>

      <div className="task-details">
        <div className="task-header">
          <h4 className="task-title">{task.activity}</h4>
          <div className="task-badges">
            <span
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority.toUpperCase()}
            </span>
            <span className="status-badge">
              {task.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        <p className="task-product">
          {task.productName} • {task.sector}
        </p>
        <p className="task-description">{task.description}</p>

        <div className="task-metrics">
          <div className="metric">
            <span className="metric-label">Estimado:</span>
            <span className="metric-value">
              {formatTime(task.estimatedTime + task.setupTime)}
            </span>
          </div>
          {task.actualTime && (
            <div className="metric">
              <span className="metric-label">Real:</span>
              <span className="metric-value">
                {formatTime(task.actualTime)}
              </span>
            </div>
          )}
          <div className="metric">
            <span className="metric-label">Eficiência:</span>
            <span
              className="metric-value"
              style={{
                color: task.actualTime
                  ? getEfficiencyColor(
                      (task.estimatedTime / task.actualTime) * 100
                    )
                  : "#4a5568",
              }}
            >
              {task.actualTime
                ? `${Math.round((task.estimatedTime / task.actualTime) * 100)}%`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="task-skills">
          <span className="skills-label">Habilidades:</span>
          {task.requiredSkills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>

        {task.status === "pending" && (
          <div className="task-actions">
            <button
              className="start-btn"
              onClick={() => handleStartTask(task.id)}
            >
              <FaPlay /> Iniciar Tarefa
            </button>
          </div>
        )}

        {task.breaks.length > 0 && (
          <div className="task-breaks">
            <span className="breaks-label">Pausas:</span>
            {task.breaks.map((breakItem, index) => (
              <span key={index} className="break-tag">
                {breakItem.type} ({breakItem.duration}min)
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
