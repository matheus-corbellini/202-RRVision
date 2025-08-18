import "./FiltersSection.css";

interface FiltersSectionProps {
  selectedOperator: string;
  setSelectedOperator: (operator: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
}

export default function FiltersSection({
  selectedOperator,
  setSelectedOperator,
  selectedSector,
  setSelectedSector,
}: FiltersSectionProps) {
  return (
    <div className="filters-section">
      <div className="filter-group">
        <label>Operador:</label>
        <select
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="op-001">João Silva</option>
          <option value="op-002">Maria Santos</option>
          <option value="op-003">Pedro Costa</option>
          <option value="op-004">Ana Oliveira</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Setor:</label>
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="Corte">Corte</option>
          <option value="Montagem">Montagem</option>
          <option value="Acabamento">Acabamento</option>
          <option value="Qualidade">Qualidade</option>
        </select>
      </div>
    </div>
  );
}
