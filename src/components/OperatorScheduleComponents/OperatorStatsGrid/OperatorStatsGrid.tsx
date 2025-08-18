import { FaCheckCircle, FaBolt, FaClock, FaTrophy } from "react-icons/fa";
import "./OperatorStatsGrid.css";

interface OperatorStats {
  tasksCompleted: number;
  averageEfficiency: number;
  totalWorkTime: number;
  onTimeCompletion: number;
  ranking: number;
  dailyTarget: number;
}

interface OperatorStatsGridProps {
  stats: OperatorStats;
  getEfficiencyColor: (efficiency: number) => string;
  formatTime: (minutes: number) => string;
}

export default function OperatorStatsGrid({
  stats,
  getEfficiencyColor,
  formatTime,
}: OperatorStatsGridProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <FaCheckCircle />
        </div>
        <div className="stat-content">
          <div className="stat-value">
            {stats.tasksCompleted}/{stats.dailyTarget}
          </div>
          <div className="stat-label">Tarefas Concluídas</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <FaBolt />
        </div>
        <div className="stat-content">
          <div
            className="stat-value"
            style={{ color: getEfficiencyColor(stats.averageEfficiency) }}
          >
            {stats.averageEfficiency}%
          </div>
          <div className="stat-label">Eficiência Média</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <FaClock />
        </div>
        <div className="stat-content">
          <div className="stat-value">{formatTime(stats.totalWorkTime)}</div>
          <div className="stat-label">Tempo Trabalhado</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <FaTrophy />
        </div>
        <div className="stat-content">
          <div className="stat-value">#{stats.ranking}</div>
          <div className="stat-label">Ranking Equipe</div>
        </div>
      </div>
    </div>
  );
}
