"use client";

import {
  FaCheck,
  FaEye,
  FaClock,
  FaExclamationTriangle,
  FaStop,
  FaExclamationCircle,
  FaSync,
  FaClock as FaDelay,
  FaSearch,
  FaWrench,
  FaBox,
  FaBell,
} from "react-icons/fa";
import type { ProductionAlert } from "../../../types/alerts";
import "./AlertsList.css";

type Alert = ProductionAlert;

interface AlertListProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  currentUserId?: string;
}

export default function AlertsList({
  alerts,
  onSelectAlert,
  onAcknowledgeAlert,
  currentUserId,
}: AlertListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#f56565";
      case "high":
        return "#fbb040";
      case "medium":
        return "#4299e1";
      case "low":
        return "#48bb78";
      default:
        return "#4a5568";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#e53e3e";
      case "high":
        return "#f56565";
      case "medium":
        return "#fbb040";
      case "low":
        return "#48bb78";
      default:
        return "#4a5568";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "production_stop":
        return <FaStop />;
      case "non_conformity":
        return <FaExclamationCircle />;
      case "priority_change":
        return <FaSync />;
      case "delay":
        return <FaDelay />;
      case "quality":
        return <FaSearch />;
      case "maintenance":
        return <FaWrench />;
      case "material":
        return <FaBox />;
      default:
        return <FaBell />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "production_stop":
        return "Parada de Produção";
      case "non_conformity":
        return "Não Conformidade";
      case "priority_change":
        return "Mudança de Prioridade";
      case "delay":
        return "Atraso";
      case "quality":
        return "Qualidade";
      case "maintenance":
        return "Manutenção";
      case "material":
        return "Material";
      default:
        return type;
    }
  };

  const isUserRecipient = (alert: Alert) => {
    return alert.recipients.some((r: { id: string }) => r.id === currentUserId);
  };

  const isAcknowledgedByUser = (alert: Alert) => {
    return (
      currentUserId &&
      alert.recipients.some((r: { id: string; acknowledged: boolean }) => r.id === currentUserId && r.acknowledged)
    );
  };

  return (
    <div className="alerts-list">
      <div className="list-header">
        <h3>Alertas ({alerts.length})</h3>
      </div>

      <div className="alerts-grid">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert-card ${alert.severity} ${alert.status} ${
              alert.priority === "urgent" ? "urgent" : ""
            }`}
          >
            <div className="alert-header">
              <div className="alert-type">
                <span className="type-icon">{getTypeIcon(alert.severity)}</span>
                <span className="type-label">{getTypeLabel(alert.severity)}</span>
              </div>
              <div className="alert-badges">
                <span
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(alert.priority) }}
                >
                  {alert.priority.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="alert-content">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-message">{alert.description}</p>

              <div className="alert-details">
                <div className="detail-item">
                  <span className="detail-label">Local:</span>
                  <span className="detail-value">
                    {alert.location.sector}
                    {alert.location.station && ` - ${alert.location.station}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Origem:</span>
                  <span className="detail-value">{alert.source.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Criado:</span>
                  <span className="detail-value">
                    {new Date(alert.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>

              {alert.tags && alert.tags.length > 0 && (
                <div className="alert-tags">
                  {alert.tags.map((tag: string, index: number) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="alert-actions">
              <button
                className="action-btn view"
                onClick={() => onSelectAlert(alert)}
              >
                <FaEye /> Detalhes
              </button>

              {isUserRecipient(alert) &&
                !isAcknowledgedByUser(alert) &&
                alert.status === "active" && (
                  <button
                    className="action-btn acknowledge"
                    onClick={() => onAcknowledgeAlert(alert.id)}
                  >
                    <FaCheck /> Reconhecer
                  </button>
                )}

              {alert.status === "active" && (
                <div className="status-indicator active">
                  <FaExclamationTriangle />
                </div>
              )}

              {alert.status === "acknowledged" && (
                <div className="status-indicator acknowledged">
                  <FaClock />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <FaBell />
          </div>
          <h3>Nenhum alerta encontrado</h3>
          <p>Não há alertas que correspondam aos filtros selecionados.</p>
        </div>
      )}
    </div>
  );
}
