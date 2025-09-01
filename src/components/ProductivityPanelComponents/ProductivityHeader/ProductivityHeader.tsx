import "./ProductivityHeader.css";

interface ProductivityHeaderProps {
  selectedPeriod: "today" | "week" | "month";
  setSelectedPeriod: (period: "today" | "week" | "month") => void;
}

export default function ProductivityHeader({
  selectedPeriod,
  setSelectedPeriod,
}: ProductivityHeaderProps) {
  return (
    <div className="productivity-header">
      <div className="header-info">
        <h1>Painel de Produtividade</h1>
      </div>
      <div className="header-controls">
        <div className="period-selector">
          <button
            className={`period-btn ${
              selectedPeriod === "today" ? "active" : ""
            }`}
            onClick={() => setSelectedPeriod("today")}
          >
            Hoje
          </button>
          <button
            className={`period-btn ${
              selectedPeriod === "week" ? "active" : ""
            }`}
            onClick={() => setSelectedPeriod("week")}
          >
            Semana
          </button>
          <button
            className={`period-btn ${
              selectedPeriod === "month" ? "active" : ""
            }`}
            onClick={() => setSelectedPeriod("month")}
          >
            Mês
          </button>
        </div>
      </div>
    </div>
  );
}
