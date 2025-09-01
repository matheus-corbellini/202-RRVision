import "./FiltersSection.css";

interface OperatorWithUser {
  operator: {
    id: string;
    code: string;
    status: string;
  };
  user: {
    name?: string;
    email: string;
  };
}

interface FiltersSectionProps {
  selectedOperator: string;
  setSelectedOperator: (operator: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  availableOperators: OperatorWithUser[];
}

export default function FiltersSection({
  selectedOperator,
  setSelectedOperator,
  selectedSector,
  setSelectedSector,
  availableOperators,
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
          {availableOperators.map((operatorWithUser) => (
            <option key={operatorWithUser.operator.id} value={operatorWithUser.operator.id}>
              {operatorWithUser.user.name || operatorWithUser.operator.code}
            </option>
          ))}
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
