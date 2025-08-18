"use client";

import {
	FaTimes,
	FaCheck,
	FaComment,
	FaUser,
	FaClock,
	FaExclamationTriangle,
} from "react-icons/fa";
import type { ProductionAlert } from "../../../types";
import "./AlertDetailsModal.css";

interface AlertDetailsModalProps {
	alert: ProductionAlert | null;
	onClose: () => void;
	onAcknowledge: (alertId: string) => void;
	onResolve: (alertId: string, resolution: string) => void;
	onAddComment: (alertId: string, comment: string) => void;
	currentUserId?: string;
}

export default function AlertDetailsModal({
	alert,
	onClose,
	onAcknowledge,
	onResolve,
	onAddComment,
	currentUserId,
}: AlertDetailsModalProps) {
	if (!alert) return null;

	const handleResolve = () => {
		const resolution = prompt("Descreva a resolução do alerta:");
		if (resolution) {
			onResolve(alert.id, resolution);
		}
	};

	const handleAddComment = () => {
		const comment = prompt("Adicione um comentário:");
		if (comment) {
			onAddComment(alert.id, comment);
		}
	};

	const isUserRecipient = () => {
		return (
			currentUserId && alert.recipients.some((r) => r.id === currentUserId)
		);
	};

	const isAcknowledgedByUser = () => {
		return (
			currentUserId &&
			alert.recipients.some((r) => r.id === currentUserId && r.acknowledged)
		);
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content large" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<div className="alert-modal-title">
						<h2>{alert.title}</h2>
						<div className="alert-modal-badges">
							<span className={`severity-badge ${alert.severity}`}>
								{alert.severity.toUpperCase()}
							</span>
							<span className={`priority-badge ${alert.priority}`}>
								{alert.priority.toUpperCase()}
							</span>
							<span className={`status-badge ${alert.status}`}>
								{alert.status.replace("_", " ").toUpperCase()}
							</span>
						</div>
					</div>
					<button className="modal-close" onClick={onClose}>
						<FaTimes />
					</button>
				</div>

				<div className="modal-body">
					<div className="alert-details-grid">
						<div className="alert-main-info">
							<div className="info-section">
								<h4>Descrição</h4>
								<p>{alert.description}</p>
							</div>

							<div className="info-section">
								<h4>Localização e Contexto</h4>
								<div className="location-details">
									<div className="detail-row">
										<span className="detail-label">Setor:</span>
										<span className="detail-value">
											{alert.location.sector}
										</span>
									</div>
									{alert.location.station && (
										<div className="detail-row">
											<span className="detail-label">Estação:</span>
											<span className="detail-value">
												{alert.location.station}
											</span>
										</div>
									)}
									{alert.location.equipment && (
										<div className="detail-row">
											<span className="detail-label">Equipamento:</span>
											<span className="detail-value">
												{alert.location.equipment}
											</span>
										</div>
									)}
									<div className="detail-row">
										<span className="detail-label">Relacionado a:</span>
										<span className="detail-value">
											{alert.relatedEntity.name} ({alert.relatedEntity.id})
										</span>
									</div>
								</div>
							</div>

							{alert.attachments.length > 0 && (
								<div className="info-section">
									<h4>Anexos</h4>
									<div className="attachments-list">
										{alert.attachments.map((attachment, index) => (
											<div key={index} className="attachment-item">
												<span className="attachment-name">{attachment}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="alert-sidebar">
							<div className="info-section">
								<h4>Informações Gerais</h4>
								<div className="info-list">
									<div className="info-item">
										<span className="info-label">Origem:</span>
										<span className="info-value">{alert.source.name}</span>
									</div>
									<div className="info-item">
										<span className="info-label">Criado em:</span>
										<span className="info-value">
											{new Date(alert.createdAt).toLocaleString("pt-BR")}
										</span>
									</div>
									{alert.acknowledgedAt && (
										<>
											<div className="info-item">
												<span className="info-label">Reconhecido em:</span>
												<span className="info-value">
													{new Date(alert.acknowledgedAt).toLocaleString(
														"pt-BR"
													)}
												</span>
											</div>
											<div className="info-item">
												<span className="info-label">Reconhecido por:</span>
												<span className="info-value">
													{alert.acknowledgedBy}
												</span>
											</div>
										</>
									)}
									{alert.resolvedAt && (
										<>
											<div className="info-item">
												<span className="info-label">Resolvido em:</span>
												<span className="info-value">
													{new Date(alert.resolvedAt).toLocaleString("pt-BR")}
												</span>
											</div>
											<div className="info-item">
												<span className="info-label">Resolvido por:</span>
												<span className="info-value">{alert.resolvedBy}</span>
											</div>
										</>
									)}
								</div>
							</div>

							<div className="info-section">
								<h4>Destinatários</h4>
								<div className="recipients-list">
									{alert.recipients.map((recipient) => (
										<div key={recipient.id} className="recipient-item">
											<div className="recipient-info">
												<span className="recipient-name">{recipient.name}</span>
												<span className="recipient-role">{recipient.role}</span>
											</div>
											<div className="recipient-status">
												{recipient.acknowledged ? (
													<span className="status-acknowledged">
														<FaCheck /> Reconhecido
													</span>
												) : (
													<span className="status-pending">
														<FaClock /> Pendente
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="info-section">
								<h4>Tags</h4>
								<div className="tags-list">
									{alert.tags && alert.tags.length > 0 ? (
										alert.tags.map((tag, index) => (
											<span key={index} className="tag">
												{tag}
											</span>
										))
									) : (
										<span style={{ color: "#999", fontStyle: "italic" }}>
											Nenhuma tag disponível
										</span>
									)}
								</div>
							</div>

							{alert.status !== "resolved" && alert.status !== "dismissed" && (
								<div className="info-section">
									<h4>Ações</h4>
									<div className="quick-actions">
										{isUserRecipient() &&
											!isAcknowledgedByUser() &&
											alert.status === "active" && (
												<button
													className="action-btn acknowledge"
													onClick={() => onAcknowledge(alert.id)}
												>
													<FaCheck /> Reconhecer
												</button>
											)}
										<button
											className="action-btn comment"
											onClick={handleAddComment}
										>
											<FaComment /> Comentar
										</button>
										<button
											className="action-btn resolve"
											onClick={handleResolve}
										>
											<FaExclamationTriangle /> Resolver
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="alert-timeline">
						<h4>Histórico de Comentários</h4>
						<div className="timeline">
							{alert.comments && alert.comments.length > 0 ? (
								alert.comments.map((comment) => (
									<div key={comment.id} className="timeline-item">
										<div className="timeline-marker"></div>
										<div className="timeline-content">
											<div className="timeline-header">
												<span className="timeline-user">
													<FaUser /> {comment.userName}
												</span>
												<span className="timeline-time">
													{new Date(comment.timestamp).toLocaleString("pt-BR")}
												</span>
											</div>
											<div className="timeline-description">
												{comment.message}
											</div>
											{comment.type !== "comment" && (
												<div className="timeline-type">
													{comment.type === "status_change"
														? "Mudança de Status"
														: "Escalação"}
												</div>
											)}
										</div>
									</div>
								))
							) : (
								<div className="timeline-item">
									<div className="timeline-marker"></div>
									<div className="timeline-content">
										<div
											className="timeline-description"
											style={{ color: "#999", fontStyle: "italic" }}
										>
											Nenhum comentário disponível
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
