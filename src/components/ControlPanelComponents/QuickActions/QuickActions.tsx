"use client";

import {
  FaFileAlt,
  FaDownload,
  FaCog,
  FaChartBar,
  FaExclamationTriangle,
  FaUsers,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./QuickActions.css";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      id: "generate-report",
      title: "Gerar Relatório",
      description: "Relatório completo de produção",
      icon: <FaFileAlt />,
      color: "blue",
      onClick: () => navigate("/app/reports"),
    },
    {
      id: "export-data",
      title: "Exportar Dados",
      description: "Exportar dados para Excel/PDF",
      icon: <FaDownload />,
      color: "green",
      onClick: () => navigate("/app/reports"),
    },
    {
      id: "system-config",
      title: "Configurações",
      description: "Configurar parâmetros do sistema",
      icon: <FaCog />,
      color: "gray",
      onClick: () => navigate("/app/settings"),
    },
    {
      id: "analytics",
      title: "Analytics",
      description: "Visualizar métricas detalhadas",
      icon: <FaChartBar />,
      color: "purple",
      onClick: () => navigate("/app/analytics"),
    },
    {
      id: "emergency-stop",
      title: "Parada de Emergência",
      description: "Parar todos os processos críticos",
      icon: <FaExclamationTriangle />,
      color: "red",
      onClick: () => console.log("Emergency stop activated..."),
    },
    {
      id: "team-management",
      title: "Gestão de Equipe",
      description: "Gerenciar operadores e turnos",
      icon: <FaUsers />,
      color: "orange",
      onClick: () => navigate("/app/team-management"),
    },
    {
      id: "schedule",
      title: "Programação",
      description: "Visualizar cronograma de produção",
      icon: <FaCalendarAlt />,
      color: "teal",
      onClick: () => navigate("/app/scheduling"),
    },
    {
      id: "sync-data",
      title: "Sincronizar",
      description: "Sincronizar dados com ERP",
      icon: <FaSync />,
      color: "indigo",
      onClick: () => navigate("/app/data-sync"),
    },
  ];

  return (
    <div className="quick-actions">
      <div className="panel-header">
        <h2>Ações Rápidas</h2>
        <p>Ações rápidas para gerenciar a produção</p>
      </div>

      <div className="actions-grid">
        {actions.map((action) => (
          <button
            key={action.id}
            className={`action-card ${action.color}`}
            onClick={action.onClick}
            title={action.description}
          >
            <div className="action-icon">{action.icon}</div>
            <div className="action-content">
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="emergency-section">
        <div className="emergency-header">
          <FaExclamationTriangle />
          <span>Acoes de emergencia</span>
        </div>
        <div className="emergency-actions">
          <button className="emergency-btn stop">Parada Geral</button>
          <button className="emergency-btn alert">Alerta Crítico</button>
        </div>
      </div>
    </div>
  );
}
