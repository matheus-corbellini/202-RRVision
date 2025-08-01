"use client";

import { FaExclamationCircle } from "react-icons/fa";
import "./AlertsPanel.css";

export default function AlertsPanel() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Alertas e Notificações</h1>
        <p>Central de alertas e notificações do sistema</p>
      </div>

      <div className="page-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">
            <FaExclamationCircle />
          </div>
          <h2>Alertas e Notificações</h2>
          <p>Esta funcionalidade está em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}
