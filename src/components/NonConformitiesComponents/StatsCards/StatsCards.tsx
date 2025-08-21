import {
  FaExclamationCircle,
  FaExclamationTriangle,
  FaPause,
  FaChartBar,
} from "react-icons/fa";
import "./StatsCards.css";
import type { NonConformityStats } from "../../../types/nonConformities";

interface StatsCardsProps {
  stats: NonConformityStats;
  productionStoppedCount: number;
}

export default function StatsCards({
  stats,
  productionStoppedCount,
}: StatsCardsProps) {
  return (
    <div className="nc-stats">
      <div className="stat-card urgent">
        <div className="stat-icon">
          <FaExclamationCircle />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.open}</div>
          <div className="stat-label">Em Aberto</div>
        </div>
      </div>
      <div className="stat-card critical">
        <div className="stat-icon">
          <FaExclamationTriangle />
        </div>
        <div className="stat-content">
          <div className="stat-value">{stats.bySeverity.critical}</div>
          <div className="stat-label">Críticas/Altas</div>
        </div>
      </div>
      <div className="stat-card stopped">
        <div className="stat-icon">
          <FaPause />
        </div>
        <div className="stat-content">
          <div className="stat-value">{productionStoppedCount}</div>
          <div className="stat-label">Produção Parada</div>
        </div>
      </div>
      <div className="stat-card total">
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
