"use client";

import "./AlertsOverview.css";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
  FaStop,
  FaExclamationCircle,
  FaClock,
  FaTools,
  FaBox,
} from "react-icons/fa";
import type { ProductionAlert } from "../../../../types/alerts";

interface AlertsOverviewProps {
  alerts: ProductionAlert[];
  onAcknowledge: (alertId: string) => void;
}

export default function AlertsOverview({
  alerts,
  onAcknowledge,
}: AlertsOverviewProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "production_stop":
        return <FaStop />;
      case "non_conformity":
        return <FaExclamationTriangle />;
      case "priority_change":
        return <FaExclamationCircle />;
      case "delay":
        return <FaClock />;
      case "quality":
        return <FaExclamationTriangle />;
      case "maintenance":
        return <FaTools />;
      case "material":
        return <FaBox />;
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

  const unacknowledgedAlerts = alerts.filter(
    (alert) => alert.status === "active"
  );
  const acknowledgedAlerts = alerts.filter(
    (alert) => alert.status === "acknowledged"
  );

  return (
    <div className="alerts-overview">
      <div className="panel-header">
        <h2>Alertas em Tempo Real</h2>
        <div className="alerts-badges">
          <span className="badge critical">
            {
              alerts.filter(
                (alert) =>
                  alert.severity === "critical" && alert.status === "active"
              ).length
            }
          </span>
          <span className="badge warning">
            {
              alerts.filter(
                (alert) =>
                  alert.severity === "high" && alert.status === "active"
              ).length
            }
          </span>
          <span className="badge info">
            {
              alerts.filter(
                (alert) =>
                  (alert.severity === "medium" || alert.severity === "low") &&
                  alert.status === "active"
              ).length
            }
          </span>
        </div>
      </div>

      <div className="alerts-container">
        {unacknowledgedAlerts.length === 0 &&
        acknowledgedAlerts.length === 0 ? (
          <div className="no-alerts">
            <FaCheck className="success-icon" />
            <p>Nenhum alerta ativo</p>
          </div>
        ) : (
          <>
            {unacknowledgedAlerts.length > 0 && (
              <div className="alerts-section">
                <h3 className="section-title">
                  {" "}
                  Não reconhecidos ({unacknowledgedAlerts.length})
                </h3>
                <div className="alerts-list">
                  {unacknowledgedAlerts.map((alert) => (
                    <div
                      className={`alert-item ${alert.severity} unacknowledged`}
                      key={alert.id}
                    >
                      <div className="alert-icon">{getIcon(alert.type)}</div>
                      <div className="alert-content">
                        <div className="alert-header">
                          <h4>{alert.title}</h4>
                          <span className="alert-time">
                            {getTimeAgo(alert.createdAt)}
                          </span>
                        </div>

                        <p className="alert-message">{alert.message}</p>

                        <div className="alert-details">
                          <span className="alert-location">
                            {alert.location.sector}
                            {alert.location.station &&
                              ` - ${alert.location.station}`}
                          </span>
                          <span className="alert-source">
                            {alert.source.name}
                          </span>
                        </div>

                        <button
                          className="acknowledge-btn"
                          onClick={() => onAcknowledge(alert.id)}
                          title="Reconhecer alerta"
                        >
                          <FaCheck />
                          Reconhecer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {acknowledgedAlerts.length > 0 && (
              <div className="alerts-section">
                <h3 className="section-title">
                  Reconhecidos ({acknowledgedAlerts.length})
                </h3>
                <div className="alerts-list acknowledged">
                  {acknowledgedAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-item ${alert.severity} acknowledged`}
                    >
                      <div className="alert-icon">{getIcon(alert.type)}</div>

                      <div className="alert-content">
                        <div className="alert-header">
                          <h4>{alert.title}</h4>
                          <span className="alert-time">
                            {getTimeAgo(alert.createdAt)}
                          </span>
                        </div>

                        <p className="alert-message">{alert.message}</p>

                        <div className="alert-details">
                          <span className="alert-location">
                            {alert.location.sector}
                            {alert.location.station &&
                              ` - ${alert.location.station}`}
                          </span>
                          <span className="alert-source">
                            {alert.source.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
