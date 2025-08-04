import "./AlertsHeader.css";
import { FaBell, FaExclamationTriangle } from "react-icons/fa";

export default function AlertsHeader() {
  return (
    <div className="alerts-header">
      <div className="header-info">
        <div className="header-icon">
          <FaBell />
        </div>
        <div className="header-text">
          <h1>Central de Alertas</h1>
          <p>
            Monitoramento em tempo real de alertas, não conformidades e eventos
            críticos
          </p>
        </div>
      </div>
      <div className="header-status">
        <div className="status-indicator active">
          <FaExclamationTriangle />
        </div>
      </div>
    </div>
  );
}
