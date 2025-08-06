"use client";

import { useEffect } from "react";
import { usePriorityOptimization } from "../../hooks/usePriorityOptimization";
import {
  FaExclamationTriangle,
  FaClock,
  FaUsers,
  FaChartLine,
  FaCog,
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowDown,
  FaSync,
} from "react-icons/fa";
import "./PriorityOptimization.css";

interface OptimizationConfig {
  autoRecalculation: boolean;
  recalculateInterval: number; // em minutos
  notifyOperators: boolean;
  notifyCoordinators: boolean;
  maxDelayAllowed: number; // em minutos
  priorityThreshold: "high" | "urgent" | "critical";
}

export default function PriorityOptimization() {
  const {
    urgentOrders,
    scheduleChanges,
    config,
    isProcessing,
    lastRecalculation,
    nextRecalculation,
    stats,
    manualRecalculation,
    updateConfig,
    notifyChange,
  } = usePriorityOptimization();

  // Inicializar dados mock se necessário
  useEffect(() => {
    if (urgentOrders.length === 0) {
      // Os dados serão carregados pelo hook
    }
  }, [urgentOrders.length]);

  const handleManualRecalculation = async () => {
    await manualRecalculation();
  };

  const handleToggleAutoRecalculation = () => {
    updateConfig({ autoRecalculation: !config.autoRecalculation });
  };

  const handleConfigChange = (
    key: keyof OptimizationConfig,
    value: string | number | boolean
  ) => {
    updateConfig({ [key]: value });
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="priority-optimization-page">
      <div className="priority-optimization-container">
        <div className="priority-optimization-content">
          {/* Header */}
          <div className="optimization-header">
            <div className="header-content">
              <h1>Otimização de Prioridades</h1>
              <p>
                Sistema de recálculo automático de agendas para pedidos urgentes
              </p>
            </div>
            <div className="header-actions">
              <button
                className={`action-btn ${isProcessing ? "processing" : ""}`}
                onClick={handleManualRecalculation}
                disabled={isProcessing}
              >
                {isProcessing ? <FaSync className="spinning" /> : <FaSync />}
                {isProcessing ? "Processando..." : "Recalcular Agora"}
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="status-cards">
            <div className="status-card">
              <div className="card-icon urgent">
                <FaExclamationTriangle />
              </div>
              <div className="card-content">
                <h3>Pedidos Urgentes</h3>
                <span className="card-value">{stats.totalUrgentOrders}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="card-icon processing">
                <FaClock />
              </div>
              <div className="card-content">
                <h3>Em Processamento</h3>
                <span className="card-value">{stats.processingOrders}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="card-icon changes">
                <FaUsers />
              </div>
              <div className="card-content">
                <h3>Mudanças de Agenda</h3>
                <span className="card-value">{stats.totalScheduleChanges}</span>
              </div>
            </div>

            <div className="status-card">
              <div className="card-icon efficiency">
                <FaChartLine />
              </div>
              <div className="card-content">
                <h3>Eficiência Otimização</h3>
                <span className="card-value">
                  {Math.round(stats.efficiency)}%
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="config-panel">
            <div className="panel-header">
              <h2>Configurações de Otimização</h2>
              <FaCog />
            </div>

            <div className="config-grid">
              <div className="config-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.autoRecalculation}
                    onChange={handleToggleAutoRecalculation}
                  />
                  Recálculo Automático
                </label>
              </div>

              <div className="config-item">
                <label>Intervalo de Recálculo (minutos)</label>
                <input
                  type="number"
                  value={config.recalculateInterval}
                  onChange={(e) =>
                    handleConfigChange(
                      "recalculateInterval",
                      parseInt(e.target.value)
                    )
                  }
                  min="5"
                  max="1440"
                />
              </div>

              <div className="config-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.notifyOperators}
                    onChange={(e) =>
                      handleConfigChange("notifyOperators", e.target.checked)
                    }
                  />
                  Notificar Operadores
                </label>
              </div>

              <div className="config-item">
                <label>
                  <input
                    type="checkbox"
                    checked={config.notifyCoordinators}
                    onChange={(e) =>
                      handleConfigChange("notifyCoordinators", e.target.checked)
                    }
                  />
                  Notificar Coordenadores
                </label>
              </div>

              <div className="config-item">
                <label>Delay Máximo Permitido (minutos)</label>
                <input
                  type="number"
                  value={config.maxDelayAllowed}
                  onChange={(e) =>
                    handleConfigChange(
                      "maxDelayAllowed",
                      parseInt(e.target.value)
                    )
                  }
                  min="0"
                  max="480"
                />
              </div>

              <div className="config-item">
                <label>Limiar de Prioridade</label>
                <select
                  value={config.priorityThreshold}
                  onChange={(e) =>
                    handleConfigChange("priorityThreshold", e.target.value)
                  }
                >
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                  <option value="critical">Crítico</option>
                </select>
              </div>
            </div>

            <div className="recalculation-info">
              <div className="info-item">
                <span className="info-label">Última Recálculo:</span>
                <span className="info-value">
                  {lastRecalculation
                    ? lastRecalculation.toLocaleString("pt-BR")
                    : "Nunca"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Próximo Recálculo:</span>
                <span className="info-value">
                  {nextRecalculation
                    ? nextRecalculation.toLocaleString("pt-BR")
                    : "Não agendado"}
                </span>
              </div>
            </div>
          </div>

          {/* Urgent Orders List */}
          <div className="orders-section">
            <div className="section-header">
              <h2>Pedidos Urgentes Processados</h2>
              <div className="section-actions">
                <button className="filter-btn active">Todos</button>
                <button className="filter-btn">Processando</button>
                <button className="filter-btn">Concluídos</button>
              </div>
            </div>

            <div className="orders-list">
              {urgentOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">{order.id}</div>
                    <div className={`priority-badge ${order.priority}`}>
                      {order.priority === "urgent" ? "Urgente" : "Crítico"}
                    </div>
                    <div className={`status-badge ${order.status}`}>
                      {order.status === "pending" && "Pendente"}
                      {order.status === "processing" && "Processando"}
                      {order.status === "completed" && "Concluído"}
                      {order.status === "failed" && "Falhou"}
                    </div>
                  </div>

                  <div className="order-content">
                    <div className="order-info">
                      <h3>{order.productName}</h3>
                      <p>Quantidade: {order.quantity} unidades</p>
                      <p>
                        Prazo Original:{" "}
                        {new Date(order.originalDeadline).toLocaleString(
                          "pt-BR"
                        )}
                      </p>
                      <p>
                        Novo Prazo:{" "}
                        {new Date(order.newDeadline).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="order-impact">
                      <div className="impact-item">
                        <span className="impact-label">Tarefas Afetadas:</span>
                        <span className="impact-value">
                          {order.affectedTasks}
                        </span>
                      </div>
                      <div className="impact-item">
                        <span className="impact-label">
                          Operadores Afetados:
                        </span>
                        <span className="impact-value">
                          {order.affectedOperators}
                        </span>
                      </div>
                      <div className="impact-item">
                        <span className="impact-label">Delay Estimado:</span>
                        <span className="impact-value">
                          {formatTime(order.estimatedDelay)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button className="action-btn view">Ver Detalhes</button>
                    <button className="action-btn notify">
                      <FaBell />
                      Notificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Changes */}
          <div className="changes-section">
            <div className="section-header">
              <h2>Mudanças de Agenda</h2>
              <div className="section-actions">
                <button className="filter-btn active">Todas</button>
                <button className="filter-btn">Não Notificadas</button>
                <button className="filter-btn">Alto Impacto</button>
              </div>
            </div>

            <div className="changes-list">
              {scheduleChanges.map((change) => (
                <div key={change.id} className="change-card">
                  <div className="change-header">
                    <div className="change-id">{change.id}</div>
                    <div className={`impact-badge ${change.impact}`}>
                      {change.impact === "low"
                        ? "Baixo"
                        : change.impact === "medium"
                        ? "Médio"
                        : "Alto"}
                    </div>
                    <div
                      className={`notification-status ${
                        change.notified ? "notified" : "pending"
                      }`}
                    >
                      {change.notified ? <FaCheckCircle /> : <FaTimesCircle />}
                      {change.notified ? "Notificado" : "Pendente"}
                    </div>
                  </div>

                  <div className="change-content">
                    <div className="change-info">
                      <h3>Operador: {change.operatorName}</h3>
                      <p>Motivo: {change.reason}</p>
                      <p>Pedido: {change.orderId}</p>
                    </div>

                    <div className="schedule-comparison">
                      <div className="time-comparison">
                        <div className="original-time">
                          <span className="time-label">Horário Original</span>
                          <span className="time-value">
                            {change.originalStartTime} -{" "}
                            {change.originalEndTime}
                          </span>
                        </div>
                        <div className="arrow">
                          <FaArrowDown />
                        </div>
                        <div className="new-time">
                          <span className="time-label">Novo Horário</span>
                          <span className="time-value">
                            {change.newStartTime} - {change.newEndTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="change-actions">
                    <button className="action-btn view">Ver Detalhes</button>
                    {!change.notified && (
                      <button
                        className="action-btn notify"
                        onClick={() => notifyChange(change.id)}
                      >
                        <FaBell />
                        Notificar
                      </button>
                    )}
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
