"use client";

import "./ControlPanelHeader.css";
import { FaSync } from "react-icons/fa";

interface ControlPanelHeaderProps {
  onRefresh: () => void;
}

export default function ControlPanelHeader({
  onRefresh,
}: ControlPanelHeaderProps) {
  const currentTime = new Date().toLocaleString("pt-BR");

  return (
    <div className="control-panel-header">
      <div className="header-content">
        <div className="header-info">
          <div className="header-text">
            <h1>Painel de Controle</h1>
          </div>
        </div>
        <div className="header-actions">
          <div className="last-update">
            <span>Ultima atualização: {currentTime}</span>
          </div>
          <button
            className="refresh-btn"
            onClick={onRefresh}
            title="Atualizar dados"
          >
            <FaSync />
          </button>
        </div>
      </div>
    </div>
  );
}
