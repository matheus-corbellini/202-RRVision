import {
  FaCheckCircle,
  FaBolt,
  FaBullseye,
  FaClock,
  FaChartBar,
} from "react-icons/fa";
import "./PeriodOverview.css";

interface PeriodStats {
  period: string;
  tasksCompleted: number;
  averageEfficiency: number;
  totalTime: number;
  productivityScore: number;
  onTimeRate: number;
}

interface PeriodOverviewProps {
  currentPeriodStats: PeriodStats;
  getEfficiencyColor: (efficiency: number) => string;
  formatTime: (minutes: number) => string;
}

export default function PeriodOverview({
  currentPeriodStats,
  getEfficiencyColor,
  formatTime,
}: PeriodOverviewProps) {
  return (
    <div className="period-overview">
      <div className="overview-card">
        <div className="overview-icon">
          <FaCheckCircle />
        </div>
        <div className="overview-content">
          <div className="overview-value">
            {currentPeriodStats.tasksCompleted}
          </div>
          <div className="overview-label">Tarefas Concluídas</div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-icon">
          <FaBolt />
        </div>
        <div className="overview-content">
          <div
            className="overview-value"
            style={{
              color: getEfficiencyColor(currentPeriodStats.averageEfficiency),
            }}
          >
            {currentPeriodStats.averageEfficiency.toFixed(1)}%
          </div>
          <div className="overview-label">Eficiência Média</div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-icon">
          <FaBullseye />
        </div>
        <div className="overview-content">
          <div className="overview-value">
            {currentPeriodStats.productivityScore.toFixed(1)}%
          </div>
          <div className="overview-label">Score Produtividade</div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-icon">
          <FaClock />
        </div>
        <div className="overview-content">
          <div className="overview-value">
            {formatTime(currentPeriodStats.totalTime)}
          </div>
          <div className="overview-label">Tempo Total</div>
        </div>
      </div>
      <div className="overview-card">
        <div className="overview-icon">
          <FaChartBar />
        </div>
        <div className="overview-content">
          <div className="overview-value">
            {currentPeriodStats.onTimeRate.toFixed(1)}%
          </div>
          <div className="overview-label">Taxa No Prazo</div>
        </div>
      </div>
    </div>
  );
}
