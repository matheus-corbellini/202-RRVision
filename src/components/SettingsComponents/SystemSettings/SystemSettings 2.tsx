"use client";

import { FaDownload, FaUpload } from "react-icons/fa";
import "./SystemSettings.css";

interface SystemSettingsProps {
  config: {
    autoSave: boolean;
    backupFrequency: string;
    dataRetention: number;
    debugMode: boolean;
  };
  onConfigChange: (key: string, value: any) => void;
}

export default function SystemSettings({
  config,
  onConfigChange,
}: SystemSettingsProps) {
  return (
    <div className="system-settings">
      <h2>Configurações do Sistema</h2>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.autoSave}
            onChange={(e) => onConfigChange("autoSave", e.target.checked)}
          />
          Salvamento automático
        </label>
      </div>

      <div className="form-group">
        <label>Frequência de backup</label>
        <select
          value={config.backupFrequency}
          onChange={(e) => onConfigChange("backupFrequency", e.target.value)}
        >
          <option value="hourly">A cada hora</option>
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
        </select>
      </div>

      <div className="form-group">
        <label>Retenção de dados (dias)</label>
        <input
          type="number"
          value={config.dataRetention}
          onChange={(e) =>
            onConfigChange("dataRetention", parseInt(e.target.value))
          }
          min="30"
          max="1095"
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.debugMode}
            onChange={(e) => onConfigChange("debugMode", e.target.checked)}
          />
          Modo debug
        </label>
      </div>

      <div className="system-actions">
        <button className="action-btn export">
          <FaDownload />
          Exportar Configurações
        </button>
        <button className="action-btn import">
          <FaUpload />
          Importar Configurações
        </button>
      </div>
    </div>
  );
}
