import { FaEye, FaUser, FaPaperclip, FaClock, FaStop } from "react-icons/fa";
import "./NonConformityCard.css";
import type { NonConformity } from "../../../types/nonConformities";

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
  getSeverityColor,
  getStatusColor,
  getCategoryIcon,
}: NonConformityCardProps) {
  return (
    <div className="nc-card">
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
          </div>
        </div>

        <div className="nc-actions">
          <button
            className="action-btn view-btn"
            onClick={() => onViewDetails(nc)}
            title="Ver detalhes"
          >
            <FaEye />
          </button>
        </div>
      </div>

      <div className="nc-card-content">
        <p className="nc-description">{nc.description}</p>

        <div className="nc-details">
          <div className="nc-location">
            <strong>Localização:</strong> {nc.location.sector} -{" "}
            {nc.location.station}
            {nc.location.equipment && ` (${nc.location.equipment})`}
          </div>

          <div className="nc-reporter">
            <FaUser />
            <span>
              <strong>Reportado por:</strong> {nc.reportedBy.name} (
              {nc.reportedBy.role})
            </span>
          </div>

          {nc.assignedTo && (
            <div className="nc-assigned">
              <FaUser />
              <span>
                <strong>Atribuído a:</strong> {nc.assignedTo.name} (
                {nc.assignedTo.role})
              </span>
            </div>
          )}
        </div>

        <div className="nc-meta">
          <div className="nc-attachments">
            <FaPaperclip />
            <span>{nc.attachments.length} anexos</span>
          </div>

          <div className="nc-alerts">
            <FaStop />
            <span>{nc.attachments.length} anexos</span>
          </div>

          <div className="nc-date">
            <FaClock />
            <span>{new Date(nc.createdAt).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>


      </div>
    </div>
  );
}
