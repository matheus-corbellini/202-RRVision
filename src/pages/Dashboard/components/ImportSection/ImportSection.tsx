import Button from "../../../../components/Button/Button";
import type { ImportData } from "../../../../types/dashboard";
import "./ImportSection.css";

interface ImportSectionProps {
  importData: ImportData;
  importLogs: string[];
  onImportBling: () => void;
}

export default function ImportSection({
  importData,
  importLogs,
  onImportBling,
}: ImportSectionProps) {
  return (
    <div className="import-section">
      <div className="import-header">
        <h3>Importação e Preparação - Bling ERP</h3>
        <Button variant="outline" onClick={onImportBling}>
          Sincronizar Agora
        </Button>
      </div>

      <div className="import-stats">
        <div className="import-stat">
          <div className="import-stat-value">{importData.ordersImported}</div>
          <div className="import-stat-label">Pedidos Importados</div>
        </div>
        <div className="import-stat">
          <div className="import-stat-value">{importData.routesLoaded}</div>
          <div className="import-stat-label">Roteiros Carregados</div>
        </div>
        <div className="import-stat">
          <div className="import-stat-value">{importData.pendingRoutes}</div>
          <div className="import-stat-label">Pendentes Roteiro</div>
        </div>
        <div className="import-stat">
          <div className="import-stat-value">{importData.timesCalculated}</div>
          <div className="import-stat-label">Tempos Calculados</div>
        </div>
      </div>

      <div className="import-log">
        {importLogs.map((log, index) => (
          <div key={index} className="log-entry">
            <span className="log-timestamp">{log.split(" ")[0]}</span>
            <span
              className={`log-message ${
                log.includes("[SUCCESS]")
                  ? "log-success"
                  : log.includes("[ERROR]")
                  ? "log-error"
                  : log.includes("[WARNING]")
                  ? "log-warning"
                  : ""
              }`}
            >
              {log.substring(log.indexOf(" ") + 1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
