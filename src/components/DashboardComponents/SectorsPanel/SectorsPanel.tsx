import type { Sector } from "../../../types/sectors";
import "./SectorsPanel.css";

interface SectorsPanelProps {
  sectors: Sector[];
}

export default function SectorsPanel({ sectors }: SectorsPanelProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "idle":
        return "Ocioso";
      case "blocked":
        return "Bloqueado";
      default:
        return status;
    }
  };

  return (
    <div className="sectors-panel">
      <div className="panel-header">
        <h4 className="panel-title">Status dos Setores</h4>
      </div>
      <div className="panel-content">
        {sectors.map((sector, index) => (
          <div key={index} className="sector-item">
            <div className="sector-info">
              <h4>{sector.name}</h4>
              <p>
                Código: {sector.code} | Descrição: {sector.description}
              </p>
            </div>
            <div className="sector-status">
              <div className={`status-indicator status-${sector.isActive ? "active" : "inactive"}`}></div>
              <span>{getStatusText(sector.isActive ? "active" : "inactive")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
