import type { Alert } from "../../../../types/dashboard";
import "./AlertsPanel.css";

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="alerts-panel">
      <div className="panel-header">
        <h4 className="panel-title">Alertas e Notificações</h4>
      </div>
      <div className="panel-content">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item ${alert.type}`}>
            <div className="alert-content">
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
            </div>
            <span className="alert-timestamp">{alert.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
