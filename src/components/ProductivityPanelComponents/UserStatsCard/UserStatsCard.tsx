import type { ReactNode } from "react";
import "./UserStatsCard.css";

interface OperatorRanking {
  operatorId: string;
  operatorName: string;
  totalTasks: number;
  averageEfficiency: number;
  totalProductivity: number;
  onTimeCompletion: number;
  rank: number;
  trend: "up" | "down" | "stable";
}

interface UserStatsCardProps {
  currentUserStats: OperatorRanking;
  getEfficiencyColor: (efficiency: number) => string;
  getTrendIcon: (trend: string) => ReactNode;
}

export default function UserStatsCard({
  currentUserStats,
  getEfficiencyColor,
  getTrendIcon,
}: UserStatsCardProps) {
  return (
    <div className="user-stats-card">
      <div className="user-stats-header">
        <div className="user-info">
          <h3>Performance do Operador</h3>
        </div>
        <div className="user-rank">
          <div className="rank-badge">#{currentUserStats.rank}</div>
          <div className="trend-indicator">
            {getTrendIcon(currentUserStats.trend)}
          </div>
        </div>
      </div>
      <div className="user-metrics">
        <div className="metric">
          <span
            className="metric-value"
            style={{
              color: getEfficiencyColor(currentUserStats.averageEfficiency),
            }}
          >
            {currentUserStats.averageEfficiency.toFixed(1)}%
          </span>
          <span className="metric-label">Eficiência Média</span>
        </div>
        <div className="metric">
          <span className="metric-value">
            {currentUserStats.totalProductivity.toFixed(1)}%
          </span>
          <span className="metric-label">Produtividade</span>
        </div>
        <div className="metric">
          <span className="metric-value">
            {currentUserStats.onTimeCompletion.toFixed(1)}%
          </span>
          <span className="metric-label">No Prazo</span>
        </div>
        <div className="metric">
          <span className="metric-value">{currentUserStats.totalTasks}</span>
          <span className="metric-label">Tarefas</span>
        </div>
      </div>
    </div>
  );
}
