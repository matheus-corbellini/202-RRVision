import type { Sector } from "../../../../types/dashboard";
import "./SectorsPanel.css";

interface SectorsPanelProps {
  sectors: Sector[];
}

export default function SectorsPanel({ sectors }: SectorsPanelProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
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
                Eficiência: {sector.efficiency}% | Pedidos:{" "}
                {sector.activeOrders}
              </p>
            </div>
            <div className="sector-status">
              <div className={`status-indicator status-${sector.status}`}></div>
              <span>{getStatusText(sector.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
