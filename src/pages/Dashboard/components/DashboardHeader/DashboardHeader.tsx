import Button from "../../../../components/Button/Button";
import "./DashboardHeader.css";

interface DashboardHeaderProps {
  userName: string;
  lastSync: Date;
  onImportBling: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  userName,
  lastSync,
  onImportBling,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="header-info">
          <h1>Dashboard de Produção</h1>
          <p>Bem-vindo, {userName}</p>
        </div>
        <div className="header-actions">
          <div className="sync-status">
            <div className="sync-indicator"></div>
            <span>Última sync: {lastSync.toLocaleTimeString()}</span>
          </div>
          <Button variant="primary" onClick={onImportBling}>
            Importar Bling
          </Button>
          <Button variant="secondary" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
