"use client";

import {
  FaCircle,
  FaExclamationTriangle,
  FaClock,
  FaStop,
} from "react-icons/fa";
import "./StatusSemaphore.css";

interface StatusSemaphoreProps {
  status: "green" | "yellow" | "red";
  activeOrders: number;
  urgentOrders: number;
  blockedOrders: number;
}

export default function StatusSemaphore({
  status,
  activeOrders,
  urgentOrders,
  blockedOrders,
}: StatusSemaphoreProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "green":
        return {
          message: "Sistema Operando Normalmente",
          description:
            "Todos os processos estão funcionando dentro dos parâmetros esperados",
          color: "#48bb78",
        };
      case "yellow":
        return {
          message: "Atenção Necessária",
          description: "Alguns processos requerem monitoramento próximo",
          color: "#ed8936",
        };
      case "red":
        return {
          message: "Intervenção Urgente",
          description:
            "Problemas críticos detectados que requerem ação imediata",
          color: "#f56565",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="status-semaphore">
      <div className="semaphore-header">
        <h2>Status Geral do Sistema</h2>
      </div>

      <div className="semaphore-content">
        <div className="semaphore-lights">
          <div className={`light red ${status === "red" ? "active" : ""}`}>
            <FaCircle />
          </div>
          <div
            className={`light yellow ${status === "yellow" ? "active" : ""}`}
          >
            <FaCircle />
          </div>
          <div className={`light green ${status === "green" ? "active" : ""}`}>
            <FaCircle />
          </div>
        </div>

        <div className="status-info">
          <h3 style={{ color: statusInfo.color }}>{statusInfo.message}</h3>
          <p>{statusInfo.description}</p>
        </div>
      </div>

      <div className="status-metrics">
        <div className="metric-card active">
          <div className="metric-icon">
            <FaClock />
          </div>
          <div className="metric-info">
            <span className="metric-value">{activeOrders}</span>
            <span className="metric-label">Pedidos Ativos</span>
          </div>
        </div>

        <div className="metric-card urgent">
          <div className="metric-icon">
            <FaExclamationTriangle />
          </div>
          <div className="metric-info">
            <span className="metric-value">{urgentOrders}</span>
            <span className="metric-label">Pedidos Urgentes</span>
          </div>
        </div>

        <div className="metric-card blocked">
          <div className="metric-icon">
            <FaStop />
          </div>
          <div className="metric-info">
            <span className="metric-value">{blockedOrders}</span>
            <span className="metric-label">Pedidos Bloqueados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
