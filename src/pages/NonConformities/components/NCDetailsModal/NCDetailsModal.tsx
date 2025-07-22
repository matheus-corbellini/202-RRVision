import "./NCDetailsModal.css";

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "video";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface NonConformityAction {
  id: string;
  type:
    | "comment"
    | "status_change"
    | "assignment"
    | "attachment"
    | "resolution";
  description: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  details?: Record<string, unknown>;
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
  resolvedAt?: string;
  attachments: Attachment[];
  actions: NonConformityAction[];
  alerts: Alert[];
}

interface NCDetailsModalProps {
  selectedNC: NonConformity | null;
  onClose: () => void;
  onAssign: (
    ncId: string,
    assigneeId: string,
    assigneeName: string,
    assigneeRole: string
  ) => void;
  onAddComment: (ncId: string, comment: string) => void;
  onResolve: (ncId: string, resolution: string) => void;
  getSeverityColor: (severity: NonConformity["severity"]) => string;
  getStatusColor: (status: NonConformity["status"]) => string;
}

export default function NCDetailsModal({
  selectedNC,
  onClose,
  onAssign,
  onAddComment,
  onResolve,
  getSeverityColor,
  getStatusColor,
}: NCDetailsModalProps) {
  if (!selectedNC) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="nc-modal-title">
            <h2>
              {selectedNC.id} - {selectedNC.title}
            </h2>
            <div className="nc-modal-badges">
              <span
                className="severity-badge"
                style={{
                  backgroundColor: getSeverityColor(selectedNC.severity),
                }}
              >
                {selectedNC.severity.toUpperCase()}
              </span>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedNC.status) }}
              >
                {selectedNC.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="nc-details-grid">
            <div className="nc-main-info">
              <div className="info-section">
                <h4>Descrição</h4>
                <p>{selectedNC.description}</p>
              </div>

              <div className="info-section">
                <h4>Localização</h4>
                <div className="location-details">
                  <span>
                    <strong>Setor:</strong> {selectedNC.location.sector}
                  </span>
                  <span>
                    <strong>Estação:</strong> {selectedNC.location.station}
                  </span>
                  {selectedNC.location.equipment && (
                    <span>
                      <strong>Equipamento:</strong>{" "}
                      {selectedNC.location.equipment}
                    </span>
                  )}
                </div>
              </div>

              {selectedNC.attachments.length > 0 && (
                <div className="info-section">
                  <h4>Anexos</h4>
                  <div className="attachments-grid">
                    {selectedNC.attachments.map((att) => (
                      <div key={att.id} className="attachment-item">
                        {att.type === "image" && (
                          <img
                            src={att.url || "/placeholder.svg"}
                            alt={att.name}
                            className="attachment-preview"
                          />
                        )}
                        <div className="attachment-info">
                          <span className="attachment-name">{att.name}</span>
                          <span className="attachment-meta">
                            Por {att.uploadedBy} em{" "}
                            {new Date(att.uploadedAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="nc-sidebar">
              <div className="info-section">
                <h4>Informações</h4>
                <div className="info-list">
                  <div className="info-item">
                    <span className="info-label">Reportado por:</span>
                    <span className="info-value">
                      {selectedNC.reporter.name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Função:</span>
                    <span className="info-value">
                      {selectedNC.reporter.role}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Data:</span>
                    <span className="info-value">
                      {new Date(selectedNC.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  {selectedNC.assignedTo && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Responsável:</span>
                        <span className="info-value">
                          {selectedNC.assignedTo.name}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Função:</span>
                        <span className="info-value">
                          {selectedNC.assignedTo.role}
                        </span>
                      </div>
                    </>
                  )}
                  {selectedNC.resolvedAt && (
                    <div className="info-item">
                      <span className="info-label">Resolvido em:</span>
                      <span className="info-value">
                        {new Date(selectedNC.resolvedAt).toLocaleString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-section">
                <h4>Alertas Enviados</h4>
                <div className="alerts-list">
                  {selectedNC.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`alert-item ${
                        alert.acknowledged ? "acknowledged" : "pending"
                      }`}
                    >
                      <div className="alert-recipient">{alert.recipient}</div>
                      <div className="alert-message">{alert.message}</div>
                      <div className="alert-status">
                        {alert.acknowledged ? "✅ Confirmado" : "⏳ Pendente"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNC.status !== "resolved" &&
                selectedNC.status !== "closed" && (
                  <div className="info-section">
                    <h4>Ações Rápidas</h4>
                    <div className="quick-actions">
                      {selectedNC.status === "open" && (
                        <button
                          className="action-btn assign"
                          onClick={() =>
                            onAssign(
                              selectedNC.id,
                              "resp-001",
                              "Maria Santos",
                              "Coordenador"
                            )
                          }
                        >
                          👤 Atribuir Responsável
                        </button>
                      )}
                      <button
                        className="action-btn comment"
                        onClick={() => {
                          const comment = prompt("Adicionar comentário:");
                          if (comment) onAddComment(selectedNC.id, comment);
                        }}
                      >
                        💬 Adicionar Comentário
                      </button>
                      <button
                        className="action-btn resolve"
                        onClick={() => {
                          const resolution = prompt("Descreva a resolução:");
                          if (resolution) onResolve(selectedNC.id, resolution);
                        }}
                      >
                        ✅ Resolver
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="nc-timeline">
            <h4>Histórico de Ações</h4>
            <div className="timeline">
              {selectedNC.actions.map((action) => (
                <div key={action.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-user">
                        {action.performedBy.name}
                      </span>
                      <span className="timeline-time">
                        {new Date(action.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="timeline-description">
                      {action.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
