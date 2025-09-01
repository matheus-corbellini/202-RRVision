import type { WorkShift } from "../../../services/agendaService";
import "./WorkShiftsHistory.css";

interface WorkShiftsHistoryProps {
	workShifts: WorkShift[];
}

export default function WorkShiftsHistory({ workShifts }: WorkShiftsHistoryProps) {
	const formatTime = (time: string) => {
		return time;
	};

	const formatDuration = (duration: string) => {
		return duration;
	};

	const getStatusColor = (status: string) => {
		return status === "completed" ? "var(--success-color)" : "var(--warning-color)";
	};

	if (workShifts.length === 0) {
		return (
			<div className="work-shifts-history empty">
				<p>Nenhuma jornada registrada hoje</p>
			</div>
		);
	}

	return (
		<div className="work-shifts-history">
			<h3>Histórico de Jornadas de Hoje</h3>
			<div className="shifts-list">
				{workShifts.map((shift) => (
					<div key={shift.id} className="shift-card">
						<div className="shift-header">
							<div className="shift-time">
								<span className="start-time">
									<strong>Início:</strong> {formatTime(shift.startTime)}
								</span>
								<span className="end-time">
									<strong>Fim:</strong> {formatTime(shift.endTime)}
								</span>
							</div>
							<div 
								className="shift-status"
								style={{ color: getStatusColor(shift.status) }}
							>
								{shift.status === "completed" ? "✓ Concluída" : "⚠ Interrompida"}
							</div>
						</div>
						<div className="shift-details">
							<div className="duration">
								<strong>Tempo Total:</strong> {formatDuration(shift.duration)}
							</div>
							{shift.notes && (
								<div className="notes">
									<strong>Observações:</strong> {shift.notes}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
