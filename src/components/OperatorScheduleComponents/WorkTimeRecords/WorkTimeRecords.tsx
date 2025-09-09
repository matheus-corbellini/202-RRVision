import type { WorkTimeRecord } from "../../../services/agendaService";
import "./WorkTimeRecords.css";

interface WorkTimeRecordsProps {
	workTimeRecords: WorkTimeRecord[];
}

export default function WorkTimeRecords({ workTimeRecords }: WorkTimeRecordsProps) {
	const formatTime = (time: string) => {
		return time;
	};

	const formatDuration = (duration: string) => {
		return duration;
	};

	const formatDate = (date: string) => {
		const dateObj = new Date(date);
		return dateObj.toLocaleDateString("pt-BR", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "var(--success-color)";
			case "active":
				return "var(--primary-color)";
			case "interrupted":
				return "var(--warning-color)";
			default:
				return "var(--text-secondary)";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "completed":
				return "✓ Concluído";
			case "active":
				return "🔄 Ativo";
			case "interrupted":
				return "⚠ Interrompido";
			default:
				return "❓ Desconhecido";
		}
	};

	if (workTimeRecords.length === 0) {
		return (
			<div className="work-time-records empty">
				<p>Nenhum registro de tempo trabalhado encontrado</p>
			</div>
		);
	}

	return (
		<div className="work-time-records">
			<h3>Registros de Tempo Trabalhado</h3>
			<div className="records-list">
				{workTimeRecords.map((record) => (
					<div key={record.id} className="record-card">
						<div className="record-header">
							<div className="record-date">
								<strong>Data:</strong> {formatDate(record.date)}
							</div>
							<div 
								className="record-status"
								style={{ color: getStatusColor(record.status) }}
							>
								{getStatusText(record.status)}
							</div>
						</div>
						<div className="record-details">
							<div className="time-info">
								<div className="time-range">
									<span className="start-time">
										<strong>Início:</strong> {formatTime(record.startTime)}
									</span>
									<span className="end-time">
										<strong>Fim:</strong> {formatTime(record.endTime)}
									</span>
								</div>
								<div className="duration">
									<strong>Tempo Total:</strong> {formatDuration(record.duration)}
								</div>
							</div>
							<div className="time-metrics">
								<div className="metric">
									<span className="metric-label">Minutos:</span>
									<span className="metric-value">{record.totalMinutes} min</span>
								</div>
								<div className="metric">
									<span className="metric-label">Segundos:</span>
									<span className="metric-value">{record.totalSeconds} seg</span>
								</div>
							</div>
							{record.notes && (
								<div className="notes">
									<strong>Observações:</strong> {record.notes}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
