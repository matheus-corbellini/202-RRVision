import "./FiltersSection.css";
import type { NonConformityFilters } from "../../../types/nonConformities";

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
    value: string | boolean | string[] | undefined
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
          value={filters.status?.[0] || "all"}
          onChange={(e) => updateFilter("status", e.target.value === "all" ? undefined : [e.target.value])}
        >
          <option value="all">Todos</option>
          <option value="open">Aberto</option>
          <option value="investigating">Em Andamento</option>
          <option value="resolved">Resolvido</option>
          <option value="closed">Fechado</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Severidade:</label>
        <select
          value={filters.severity?.[0] || "all"}
          onChange={(e) => updateFilter("severity", e.target.value === "all" ? undefined : [e.target.value])}
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
          value={filters.category?.[0] || "all"}
          onChange={(e) => updateFilter("category", e.target.value === "all" ? undefined : [e.target.value])}
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
        <label>Setor:</label>
        <select
          value={filters.sector?.[0] || "all"}
          onChange={(e) => updateFilter("sector", e.target.value === "all" ? undefined : [e.target.value])}
        >
          <option value="all">Todos</option>
          <option value="Corte">Corte</option>
          <option value="Montagem">Montagem</option>
          <option value="Acabamento">Acabamento</option>
        </select>
      </div>
      <div className="filter-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={!!filters.assignedTo}
            onChange={(e) => updateFilter("assignedTo", e.target.checked ? "current-user" : undefined)}
          />
          Apenas minhas NCs
        </label>
      </div>
      <div className="filter-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={filters.severity?.includes("critical") || false}
            onChange={(e) => updateFilter("severity", e.target.checked ? ["critical"] : undefined)}
          />
          Apenas críticas
        </label>
      </div>
    </div>
  );
}
