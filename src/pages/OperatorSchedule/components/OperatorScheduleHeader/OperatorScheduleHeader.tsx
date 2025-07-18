import type { User } from "../../../../types/user";
import "./OperatorScheduleHeader.css";

interface OperatorScheduleHeaderProps {
  user: User | null;
  viewMode: "day" | "week";
  setViewMode: (mode: "day" | "week") => void;
  currentTime: Date;
}

export default function OperatorScheduleHeader({
  user,
  viewMode,
  setViewMode,
  currentTime,
}: OperatorScheduleHeaderProps) {
  return (
    <div className="schedule-header">
      <div className="header-info">
        <h1>Agenda do Operador</h1>
        <p>
          Olá, {user?.name || user?.displayName || "Operador"}! Aqui está sua
          agenda para hoje.
        </p>
      </div>
      <div className="header-controls">
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
          <span className="time-label">Agora:</span>
          <span className="time-value">
            {currentTime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
