import type { AuthUser } from "../../../types";
import "./OperatorScheduleHeader.css";

interface OperatorScheduleHeaderProps {
  user: AuthUser | null;
  viewMode: "day" | "week";
  setViewMode: (mode: "day" | "week") => void;
  currentTime: Date;
  onStartShift?: () => void;
  onStopShift?: () => void;
  isShiftStarted?: boolean;
  shiftStartTime?: string | null;
  elapsedTime?: string | null;
}

export default function OperatorScheduleHeader({
  viewMode,
  setViewMode,
  currentTime,
  onStartShift,
  onStopShift,
  isShiftStarted = false,
  elapsedTime = null,
}: OperatorScheduleHeaderProps) {
  return (
    <div className="schedule-header">
      <div className="header-info">
        <h1>Agenda do Operador</h1>
      </div>
      <div className="header-controls">
        {/* Botão de Início de Jornada */}
        <div className="shift-control">
          {!isShiftStarted ? (
            <button
              className="start-shift-btn"
              onClick={onStartShift}
              title="Iniciar Jornada de Trabalho"
            >
              <span className="btn-icon">▶</span>
              <span className="btn-text">Iniciar Jornada</span>
            </button>
          ) : (
            <div className="shift-status">
              {elapsedTime && (
                <span className="elapsed-time">
                  {elapsedTime}
                </span>
              )}
              <button
                className="stop-shift-btn"
                onClick={onStopShift}
                title="Parar Jornada de Trabalho"
              >
                <span className="btn-icon">⏹</span>
                <span className="btn-text">Parar</span>
              </button>
            </div>
          )}
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "day" ? "active" : ""}`}
            onClick={() => setViewMode("day")}
          >
            Dia
          </button>
          <button
            className={`toggle-btn ${viewMode === "week" ? "active" : ""}`}
            onClick={() => setViewMode("week")}
          >
            Semana
          </button>
        </div>
        
        <div className="current-time">
          <span className="time-label">Hora Atual</span>
          <span className="time-value">
            {currentTime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
