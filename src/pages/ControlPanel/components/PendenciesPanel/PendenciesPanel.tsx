"use client";

import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
  FaCheck,
  FaTools,
  FaExclamationCircle,
  FaBox,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";
import "./PendenciesPanel.css";
import type { Pendency } from "../../../../types/pendencies";

interface PendenciesPanelProps {
  pendencies: Pendency[];
  onResolve: (id: string) => void;
}

export default function PendenciesPanel({
  pendencies,
  onResolve,
}: PendenciesPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "urgent":
        return <FaExclamationTriangle />;
      case "warning":
        return <FaClock />;
      case "info":
        return <FaInfoCircle />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "maintenance":
        return <FaTools />;
      case "quality":
        return <FaExclamationCircle />;
      case "safety":
        return <FaShieldAlt />;
      case "process":
        return <FaCog />;
      case "material":
        return <FaBox />;
      case "equipment":
        return <FaTools />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Agora";
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  const isOverdue = (pendency: Pendency) => {
    if (!pendency.dueDate) return false;
    const dueDate = new Date(pendency.dueDate);
    const now = new Date();
    return dueDate < now && pendency.status !== "resolved";
  };

  return (
    <div className="pendencies-panel">
      <div className="panel-header">
        <h2>Principais Pendências</h2>
        <span className="pendencies-count">{pendencies.length}</span>
      </div>

      <div className="pendencies-list">
        {pendencies.length === 0 ? (
          <div className="no-pendencies">
            <FaCheck className="success-icon" />
            <p>Nenhuma pendência no momento</p>
          </div>
        ) : (
          pendencies.map((pendency) => (
            <div
              key={pendency.id}
              className={`pendency-item ${pendency.type} ${
                isOverdue(pendency) ? "overdue" : ""
              }`}
            >
              <div className="pendency-icon">{getIcon(pendency.type)}</div>

              <div className="pendency-content">
                <div className="pendency-header">
                  <h3>{pendency.title}</h3>
                  <span className="pendency-time">
                    {getTimeAgo(pendency.timestamp)}
                  </span>
                </div>

                <p className="pendency-description">{pendency.description}</p>

                <div className="pendency-details">
                  <span className="pendency-category">
                    {getCategoryIcon(pendency.category)} {pendency.category}
                  </span>
                  <span className="pendency-location">
                    {pendency.location.sector}
                    {pendency.location.station &&
                      ` - ${pendency.location.station}`}
                  </span>
                  {pendency.assignedTo && (
                    <span className="pendency-assigned">
                      {pendency.assignedTo.name}
                    </span>
                  )}
                </div>

                {isOverdue(pendency) && (
                  <div className="overdue-warning">
                    <FaExclamationTriangle />
                    <span>Pendência vencida</span>
                  </div>
                )}

                <div className="pendency-footer">
                  <span className="pendency-sector">
                    Setor: {pendency.sector}
                  </span>
                  <button
                    className="resolve-btn"
                    onClick={() => onResolve(pendency.id)}
                    title="Marcar como resolvido"
                  >
                    <FaCheck />
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
