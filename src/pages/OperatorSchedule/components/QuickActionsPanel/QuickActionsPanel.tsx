import { useState } from "react";
import "./QuickActionsPanel.css";

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

interface Break {
  id: string;
  type: "coffee" | "lunch" | "bathroom" | "other";
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface QuickActionsPanelProps {
  tasks: Task[];
  onFilterChange: (filteredTasks: Task[]) => void;
  onSortChange: (sortedTasks: Task[]) => void;
  currentTask: Task | null;
  onQuickAction: (action: string) => void;
}

type FilterType = "all" | "priority" | "sector" | "status" | "upcoming";
type SortType = "time" | "priority" | "duration" | "sector";

export default function QuickActionsPanel({
  tasks,
  onFilterChange,
  onSortChange,
  currentTask,
  onQuickAction,
}: QuickActionsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeSortType, setActiveSortType] = useState<SortType>("time");
  const [isExpanded, setIsExpanded] = useState(true);

  // Estatísticas rápidas
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    delayed: tasks.filter((t) => t.status === "delayed").length,
  };

  // Funções de filtro
  const applyFilter = (filterType: FilterType) => {
    setActiveFilter(filterType);
    let filtered = [...tasks];

    switch (filterType) {
      case "priority":
        filtered = tasks.filter(
          (t) => t.priority === "urgent" || t.priority === "high"
        );
        break;
      case "sector": {
        // Agrupa por setor mais comum
        const sectorCounts = tasks.reduce((acc, task) => {
          acc[task.sector] = (acc[task.sector] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topSector = Object.keys(sectorCounts).reduce((a, b) =>
          sectorCounts[a] > sectorCounts[b] ? a : b
        );
        filtered = tasks.filter((t) => t.sector === topSector);
        break;
      }
      case "status":
        filtered = tasks.filter(
          (t) => t.status === "pending" || t.status === "in_progress"
        );
        break;
      case "upcoming": {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        filtered = tasks.filter((t) => {
          const [hour, minute] = t.startTime.split(":").map(Number);
          const taskMinutes = hour * 60 + minute;
          return taskMinutes > nowMinutes && t.status === "pending";
        });
        break;
      }
      default:
        filtered = tasks;
    }

    onFilterChange(filtered);
  };

  // Funções de ordenação
  const applySort = (sortType: SortType) => {
    setActiveSortType(sortType);
    const sorted = [...tasks];

    switch (sortType) {
      case "time":
        sorted.sort((a, b) => {
          const timeA = a.startTime.split(":").map(Number);
          const timeB = b.startTime.split(":").map(Number);
          return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
        });
        break;
      case "priority": {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        sorted.sort(
          (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
        );
        break;
      }
      case "duration":
        sorted.sort(
          (a, b) =>
            b.estimatedTime + b.setupTime - (a.estimatedTime + a.setupTime)
        );
        break;
      case "sector":
        sorted.sort((a, b) => a.sector.localeCompare(b.sector));
        break;
    }

    onSortChange(sorted);
  };

  // Ações rápidas
  const quickActions = [
    {
      id: "start-next",
      icon: "▶️",
      label: "Iniciar Próxima",
      action: () => onQuickAction("start-next"),
      disabled: !tasks.find((t) => t.status === "pending") || !!currentTask,
    },
    {
      id: "pause-current",
      icon: "⏸️",
      label: "Pausar Atual",
      action: () => onQuickAction("pause-current"),
      disabled: !currentTask || currentTask.status !== "in_progress",
    },
    {
      id: "complete-current",
      icon: "✅",
      label: "Finalizar Atual",
      action: () => onQuickAction("complete-current"),
      disabled: !currentTask,
    },
    {
      id: "emergency-break",
      icon: "🚨",
      label: "Pausa Emergência",
      action: () => onQuickAction("emergency-break"),
      disabled: false,
    },
  ];

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div
      className={`quick-actions-panel ${isExpanded ? "expanded" : "collapsed"}`}
    >
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-icon">⚡</span>
          <span>Ações Rápidas</span>
        </div>
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div className="panel-content">
          {/* Estatísticas Rápidas */}
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-value pending">{stats.pending}</span>
              <span className="stat-label">Pendentes</span>
            </div>
            <div className="stat-item">
              <span className="stat-value completed">{stats.completed}</span>
              <span className="stat-label">Concluídas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value urgent">{stats.urgent}</span>
              <span className="stat-label">Urgentes</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="filter-section">
            <h4>Filtros</h4>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${
                  activeFilter === "all" ? "active" : ""
                }`}
                onClick={() => applyFilter("all")}
              >
                🔍 Todas
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "priority" ? "active" : ""
                }`}
                onClick={() => applyFilter("priority")}
              >
                🔥 Prioridade
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "status" ? "active" : ""
                }`}
                onClick={() => applyFilter("status")}
              >
                ⏳ Ativas
              </button>
              <button
                className={`filter-btn ${
                  activeFilter === "upcoming" ? "active" : ""
                }`}
                onClick={() => applyFilter("upcoming")}
              >
                🔜 Próximas
              </button>
            </div>
          </div>

          {/* Ordenação */}
          <div className="sort-section">
            <h4>Ordenar por</h4>
            <div className="sort-buttons">
              <button
                className={`sort-btn ${
                  activeSortType === "time" ? "active" : ""
                }`}
                onClick={() => applySort("time")}
              >
                🕐 Horário
              </button>
              <button
                className={`sort-btn ${
                  activeSortType === "priority" ? "active" : ""
                }`}
                onClick={() => applySort("priority")}
              >
                ⭐ Prioridade
              </button>
              <button
                className={`sort-btn ${
                  activeSortType === "duration" ? "active" : ""
                }`}
                onClick={() => applySort("duration")}
              >
                ⏱️ Duração
              </button>
              <button
                className={`sort-btn ${
                  activeSortType === "sector" ? "active" : ""
                }`}
                onClick={() => applySort("sector")}
              >
                🏭 Setor
              </button>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="actions-section">
            <h4>Ações</h4>
            <div className="action-buttons">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`action-btn ${action.disabled ? "disabled" : ""}`}
                  onClick={action.action}
                  disabled={action.disabled}
                  title={action.label}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Informações da Tarefa Atual */}
          {currentTask && (
            <div className="current-task-info">
              <h4>Tarefa Atual</h4>
              <div className="task-summary">
                <div className="task-header">
                  <span className="task-name">{currentTask.activity}</span>
                  <span
                    className={`task-priority priority-${currentTask.priority}`}
                  >
                    {currentTask.priority.toUpperCase()}
                  </span>
                </div>
                <div className="task-details">
                  <span className="task-sector">{currentTask.sector}</span>
                  <span className="task-duration">
                    {formatTime(
                      currentTask.estimatedTime + currentTask.setupTime
                    )}
                  </span>
                </div>
                <div className="task-timeline">
                  <span>{currentTask.startTime}</span>
                  <span>→</span>
                  <span>{currentTask.endTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
