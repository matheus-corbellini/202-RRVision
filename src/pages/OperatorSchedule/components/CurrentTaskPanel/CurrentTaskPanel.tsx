import "./CurrentTaskPanel.css";

interface Break {
  id: string;
  type: "coffee" | "lunch" | "bathroom" | "other";
  startTime: string;
  endTime?: string;
  duration?: number;
}

interface Task {
  id: string;
  orderId: string;
  productName: string;
  activity: string;
  sector: string;
  description: string;
  estimatedTime: number;
  setupTime: number;
  startTime: string;
  endTime: string;
  status: "pending" | "in_progress" | "paused" | "completed" | "delayed";
  actualStartTime?: string;
  actualEndTime?: string;
  actualTime?: number;
  priority: "low" | "medium" | "high" | "urgent";
  requiredSkills: string[];
  breaks: Break[];
  nonConformities: string[];
}

interface CurrentTaskPanelProps {
  currentTask: Task | null;
  activeBreak: Break | null;
  currentTime: Date;
  handlePauseTask: (taskId: string) => void;
  handleCompleteTask: (taskId: string) => void;
  handleStartBreak: (type: Break["type"]) => void;
  handleEndBreak: () => void;
  calculateProgress: (task: Task) => number;
  calculateActualTime: (startTime: string, endTime: string) => number;
}

export default function CurrentTaskPanel({
  currentTask,
  activeBreak,
  currentTime,
  handlePauseTask,
  handleCompleteTask,
  handleStartBreak,
  handleEndBreak,
  calculateProgress,
  calculateActualTime,
}: CurrentTaskPanelProps) {
  if (!currentTask) return null;

  return (
    <div className="current-task-panel">
      <div className="panel-header">
        <h3>Tarefa Atual</h3>
        <div className="task-timer">
          {currentTask.actualStartTime && (
            <span>
              Iniciada às {currentTask.actualStartTime} •{" "}
              {Math.floor(
                calculateActualTime(
                  currentTask.actualStartTime,
                  currentTime.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                ) / 60
              )}
              h{" "}
              {calculateActualTime(
                currentTask.actualStartTime,
                currentTime.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              ) % 60}
              m
            </span>
          )}
        </div>
      </div>

      <div className="current-task-content">
        <div className="task-info">
          <h4>{currentTask.activity}</h4>
          <p className="task-product">
            {currentTask.productName} • {currentTask.sector}
          </p>
          <p className="task-description">{currentTask.description}</p>

          <div className="task-progress">
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${calculateProgress(currentTask)}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {Math.round(calculateProgress(currentTask))}%
            </span>
          </div>
        </div>

        <div className="task-controls">
          <div className="break-controls">
            <h5>Pausas</h5>
            <div className="break-buttons">
              {!activeBreak ? (
                <>
                  <button
                    className="break-btn coffee"
                    onClick={() => handleStartBreak("coffee")}
                  >
                    ☕ Café
                  </button>
                  <button
                    className="break-btn lunch"
                    onClick={() => handleStartBreak("lunch")}
                  >
                    🍽️ Almoço
                  </button>
                  <button
                    className="break-btn bathroom"
                    onClick={() => handleStartBreak("bathroom")}
                  >
                    🚻 Banheiro
                  </button>
                  <button
                    className="break-btn other"
                    onClick={() => handleStartBreak("other")}
                  >
                    ⏸️ Outra
                  </button>
                </>
              ) : (
                <div className="active-break">
                  <span>
                    Pausa: {activeBreak.type} desde {activeBreak.startTime}
                  </span>
                  <button className="end-break-btn" onClick={handleEndBreak}>
                    Finalizar Pausa
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="task-actions">
            <button
              className="action-btn pause"
              onClick={() => handlePauseTask(currentTask.id)}
            >
              ⏸️ Pausar
            </button>
            <button className="action-btn nonconformity">
              ⚠️ Não Conformidade
            </button>
            <button
              className="action-btn complete"
              onClick={() => handleCompleteTask(currentTask.id)}
            >
              ✅ Finalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
