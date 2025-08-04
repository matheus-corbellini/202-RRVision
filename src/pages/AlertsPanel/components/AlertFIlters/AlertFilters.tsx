"use client";

import "./AlertFilters.css";
import type { AlertFilters } from "../../../../types";

interface AlertFiltersProps {
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterSeverity: string;
  setFilterSeverity: (severity: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  showOnlyMyAlerts: boolean;
  setShowOnlyMyAlerts: (show: boolean) => void;
}

export default function AlertsFilters({
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterSeverity,
  setFilterSeverity,
  filterPriority,
  setFilterPriority,
  showOnlyMyAlerts,
  setShowOnlyMyAlerts,
}: AlertFiltersProps) {
  return (
    <div className="alert-filters">
      <div className="filter-group">
        <label>Tipo: </label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="production_stop">Parada de Produção</option>
          <option value="non_conformity">Não Conformidade</option>
          <option value="priority_change">Mudança de Prioridade</option>
          <option value="delay">Atraso</option>
          <option value="quality">Qualidade</option>
          <option value="maintenance">Manutenção</option>
          <option value="material">Material</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status: </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="active">Ativo</option>
          <option value="acknowledged">Reconhecido</option>
          <option value="in_progress">Em Andamento</option>
          <option value="resolved">Resolvido</option>
          <option value="dismissed">Dispensado</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Severidade: </label>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="critical">Crítica</option>
          <option value="low">Alta</option>
          <option value="medium">Média</option>
          <option value="high">Baixa</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Prioridade: </label>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>

      <div className="filter-group checkbox-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showOnlyMyAlerts}
            onChange={(e) => setShowOnlyMyAlerts(e.target.checked)}
          />
          <span className="checkbox-text">Mostrar apenas meus alertas</span>
        </label>
      </div>
    </div>
  );
}
