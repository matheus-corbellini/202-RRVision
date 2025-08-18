"use client";

import "./NonConformity.css";
import {
  FaExclamationCircle,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { NonConformityStats } from "../../../../types/nonConformities";

interface NonConformityProps {
  data: NonConformityStats;
}

export default function NonConformity({ data }: NonConformityProps) {
  const total = data.open + data.inProgress + data.resolved;
  const criticalPercentage = total > 0 ? (data.critical / total) * 100 : 0;

  const getStatusColor = () => {
    if (data.critical > 5) return "#e53e3e";
    if (data.critical > 2) return "#ed8936";
    return "#48bb78";
  };

  return (
    <div className="nonconformity-status">
      <div className="panel-header">
        <p>Status de Não Conformidade</p>
        <div
          className="critical-indicator"
          style={{ backgroundColor: getStatusColor() }}
        >
          <FaExclamationCircle />
          <span>{data.critical} criticas</span>
        </div>
      </div>

      <div className="status-overview">
        <div className="status-card">
          <span className="card-number">{total}</span>
          <span className="count-label">Total de NCs</span>
        </div>

        {criticalPercentage > 0 && (
          <div className="critical-percentage">
            <div className="percentage-bar">
              <div
                className="percentage-fill"
                style={{ width: `${Math.min(criticalPercentage, 100)}%` }}
              ></div>
            </div>
            <span className="percentage-text">
              {criticalPercentage.toFixed(1)}% de criticas
            </span>
          </div>
        )}
      </div>

      <div className="status-cards">
        <div className="status-card open">
          <div className="card-icon">
            <FaExclamationTriangle />
          </div>
          <div className="card-content">
            <span className="card-number">{data.open}</span>
            <span className="card-label">Abertas</span>
          </div>
        </div>

        <div className="status-card progress">
          <div className="card-icon">
            <FaClock />
          </div>
          <div className="card-content">
            <span className="card-number">{data.inProgress}</span>
            <span className="card-label">Em Andamento</span>
          </div>
        </div>

        <div className="status-card resolved">
          <div className="card-icon">
            <FaCheckCircle />
          </div>
          <div className="card-content">
            <span className="card-number">{data.resolved}</span>
            <span className="card-label">Resolvidas</span>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="action-btn primary">Ver todas as NCs</button>
        <button className="action-btn secondary">Relatorio mensal</button>
      </div>
    </div>
  );
}
