import "./FiltersSection.css";

interface FiltersSectionProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterSeverity: string;
  setFilterSeverity: (severity: string) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
}

export default function FiltersSection({
  filterStatus,
  setFilterStatus,
  filterSeverity,
  setFilterSeverity,
  filterCategory,
  setFilterCategory,
}: FiltersSectionProps) {
  return (
    <div className="nc-filters">
      <div className="filter-group">
        <label>Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
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
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
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
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="quality">Qualidade</option>
          <option value="safety">Segurança</option>
          <option value="process">Processo</option>
          <option value="equipment">Equipamento</option>
          <option value="material">Material</option>
        </select>
      </div>
    </div>
  );
}
