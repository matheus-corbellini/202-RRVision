import {
  FaTimes,
  FaUser,
  FaComment,
  FaCheckCircle,
} from "react-icons/fa";
import type { NonConformity } from "../../../types/nonConformities";
import "./NCDetailsModal.css";

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
            <FaTimes />
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

              {selectedNC.attachments && selectedNC.attachments.length > 0 && (
                <div className="info-section">
                  <h4>Anexos</h4>
                  <div className="attachments-grid">
                    {selectedNC.attachments.map((attName, index) => (
                      <div key={index} className="attachment-item">
                        <div className="attachment-info">
                          <span className="attachment-name">{attName}</span>
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
                      {selectedNC.reportedBy.name}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Função:</span>
                    <span className="info-value">
                      {selectedNC.reportedBy.role}
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
                <h4>Comentários</h4>
                <div className="comments-list">
                  {selectedNC.comments && selectedNC.comments.length > 0 ? (
                    selectedNC.comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <span className="comment-user">{comment.userName}</span>
                          <span className="comment-time">
                            {new Date(comment.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <div className="comment-message">{comment.message}</div>
                      </div>
                    ))
                  ) : (
                    <p>Nenhum comentário disponível</p>
                  )}
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
                          <FaUser /> Atribuir Responsável
                        </button>
                      )}
                      <button
                        className="action-btn comment"
                        onClick={() => {
                          const comment = prompt("Adicionar comentário:");
                          if (comment) onAddComment(selectedNC.id, comment);
                        }}
                      >
                        <FaComment /> Adicionar Comentário
                      </button>
                      <button
                        className="action-btn resolve"
                        onClick={() => {
                          const resolution = prompt("Descreva a resolução:");
                          if (resolution) onResolve(selectedNC.id, resolution);
                        }}
                      >
                        <FaCheckCircle /> Resolver
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="nc-timeline">
            <h4>Histórico</h4>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-user">
                      {selectedNC.reportedBy.name}
                    </span>
                    <span className="timeline-time">
                      {new Date(selectedNC.createdAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <div className="timeline-description">
                    Não conformidade criada
                  </div>
                </div>
              </div>
              {selectedNC.resolvedAt && (
                <div className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-user">
                        {selectedNC.resolvedBy || "Sistema"}
                      </span>
                      <span className="timeline-time">
                        {new Date(selectedNC.resolvedAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="timeline-description">
                      Não conformidade resolvida
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
