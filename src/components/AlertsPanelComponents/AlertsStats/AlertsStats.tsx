import "./AlertsStats.css";
import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaFire,
  FaBell,
  FaChartBar,
} from "react-icons/fa";
import type { AlertStats } from "../../../../types";

interface AlertStatsProps {
  stats: AlertStats;
}

export default function AlertsStats({ stats }: AlertStatsProps) {
  return (
    <div className="alerts-stats">
      <div className="stat-card critical">
        <div className="stat-icon">
          <FaExclamationCircle />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Alertas Ativos</div>
        </div>
      </div>

      <div className="stat-card high">
        <div className="stat-icon">
          <FaExclamationTriangle />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.critical}</div>
          <div className="stat-label">Críticos</div>
        </div>
      </div>

      <div className="stat-card urgent">
        <div className="stat-icon">
          <FaFire />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.urgent}</div>
          <div className="stat-label">Urgentes</div>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">
          <FaBell />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.unacknowledged}</div>
          <div className="stat-label">Não Reconhecidos</div>
        </div>
      </div>

      <div className="stat-card info">
        <div className="stat-icon">
          <FaChartBar />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>
    </div>
  );
}
