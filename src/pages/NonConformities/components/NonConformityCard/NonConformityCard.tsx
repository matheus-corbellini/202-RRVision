import {
  FaEye,
  FaUser,
  FaPaperclip,
  FaCheck,
  FaClock,
  FaStop,
} from "react-icons/fa";
import "./NonConformityCard.css";

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface Alert {
  id: string;
  type: "coordinator" | "quality" | "warehouse" | "engineering" | "admin";
  recipient: string;
  message: string;
  sentAt: string;
  acknowledged: boolean;
}

interface NonConformity {
  id: string;
  title: string;
  description: string;
  category: "quality" | "safety" | "process" | "equipment" | "material";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  stopProduction: boolean;
  location: {
    sector: string;
    station: string;
    equipment?: string;
  };
  reporter: {
    id: string;
    name: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  attachments: Attachment[];
  alerts: Alert[];
}

interface NonConformityCardProps {
  nc: NonConformity;
  onViewDetails: (nc: NonConformity) => void;
  onAssign: (
    ncId: string,
    assigneeId: string,
    assigneeName: string,
    assigneeRole: string
  ) => void;
  getSeverityColor: (severity: NonConformity["severity"]) => string;
  getStatusColor: (status: NonConformity["status"]) => string;
  getCategoryIcon: (category: NonConformity["category"]) => string;
}

export default function NonConformityCard({
  nc,
  onViewDetails,
  onAssign,
  getSeverityColor,
  getStatusColor,
  getCategoryIcon,
}: NonConformityCardProps) {
  return (
    <div className={`nc-card ${nc.stopProduction ? "production-stopped" : ""}`}>
      <div className="nc-card-header">
        <div className="nc-info">
          <div className="nc-id-title">
            <span className="nc-id">{nc.id}</span>
            <h3 className="nc-title">{nc.title}</h3>
          </div>
          <div className="nc-badges">
            <span className="category-badge">
              {getCategoryIcon(nc.category)} {nc.category}
            </span>
            <span
              className="severity-badge"
              style={{ backgroundColor: getSeverityColor(nc.severity) }}
            >
              {nc.severity.toUpperCase()}
            </span>
            <span
              className="status-badge"
              style={{ backgroundColor: getStatusColor(nc.status) }}
            >
              {nc.status.replace("_", " ").toUpperCase()}
            </span>
            {nc.stopProduction && (
              <span className="stop-badge">
                <FaStop /> PRODUÇÃO PARADA
              </span>
            )}
          </div>
        </div>
        <div className="nc-actions">
          <button className="action-btn view" onClick={() => onViewDetails(nc)}>
            <FaEye /> Ver Detalhes
          </button>
          {nc.status === "open" && (
            <button
              className="action-btn assign"
              onClick={() =>
                onAssign(nc.id, "resp-001", "Maria Santos", "Coordenador")
              }
            >
              <FaUser /> Atribuir
            </button>
          )}
        </div>
      </div>

      <div className="nc-card-content">
        <p className="nc-description">{nc.description}</p>

        <div className="nc-details">
          <div className="detail-item">
            <span className="detail-label">Local:</span>
            <span className="detail-value">
              {nc.location.sector} - {nc.location.station}
              {nc.location.equipment && ` (${nc.location.equipment})`}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reportado por:</span>
            <span className="detail-value">
              {nc.reporter.name} ({nc.reporter.role})
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Data:</span>
            <span className="detail-value">
              {new Date(nc.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>
          {nc.assignedTo && (
            <div className="detail-item">
              <span className="detail-label">Responsável:</span>
              <span className="detail-value">
                {nc.assignedTo.name} ({nc.assignedTo.role})
              </span>
            </div>
          )}
        </div>

        {nc.attachments.length > 0 && (
          <div className="nc-attachments">
            <span className="attachments-label">Anexos:</span>
            {nc.attachments.map((att) => (
              <span key={att.id} className="attachment-tag">
                <FaPaperclip /> {att.name}
              </span>
            ))}
          </div>
        )}

        <div className="nc-alerts">
          <span className="alerts-label">Alertas enviados:</span>
          {nc.alerts.map((alert) => (
            <span
              key={alert.id}
              className={`alert-tag ${
                alert.acknowledged ? "acknowledged" : "pending"
              }`}
            >
              {alert.recipient} {alert.acknowledged ? <FaCheck /> : <FaClock />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
