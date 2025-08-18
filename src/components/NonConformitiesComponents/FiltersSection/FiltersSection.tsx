import "./FiltersSection.css";
import type { NonConformityFilters } from "../../../../types/nonConformities";

interface FiltersSectionProps {
  filters: NonConformityFilters;
  setFilters: (filters: NonConformityFilters) => void;
}

export default function FiltersSection({
  filters,
  setFilters,
}: FiltersSectionProps) {
  const updateFilter = (
    key: keyof NonConformityFilters,
    value: string | boolean
  ) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="nc-filters">
      <div className="filter-group">
        <label>Status:</label>
        <select
          value={filters.filterStatus}
          onChange={(e) => updateFilter("filterStatus", e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="open">Aberto</option>
          <option value="in_progress">Em Andamento</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Severidade:</label>
        <select
          value={filters.filterSeverity}
          onChange={(e) => updateFilter("filterSeverity", e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Categoria:</label>
        <select
          value={filters.filterCategory}
          onChange={(e) => updateFilter("filterCategory", e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="quality">Qualidade</option>
          <option value="safety">Segurança</option>
          <option value="process">Processo</option>
          <option value="equipment">Equipamento</option>
          <option value="material">Material</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Localização:</label>
        <select
          value={filters.filterLocation}
          onChange={(e) => updateFilter("filterLocation", e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="sector1">Setor 1</option>
          <option value="sector2">Setor 2</option>
          <option value="sector3">Setor 3</option>
        </select>
      </div>
      <div className="filter-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={filters.showOnlyMyNCs}
            onChange={(e) => updateFilter("showOnlyMyNCs", e.target.checked)}
          />
          Apenas minhas NCs
        </label>
      </div>
      <div className="filter-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={filters.showOnlyCritical}
            onChange={(e) => updateFilter("showOnlyCritical", e.target.checked)}
          />
          Apenas críticas
        </label>
      </div>
    </div>
  );
}
