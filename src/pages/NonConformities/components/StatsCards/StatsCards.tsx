import "./StatsCards.css";

interface StatsCardsProps {
  openCount: number;
  criticalCount: number;
  productionStoppedCount: number;
  totalCount: number;
}

export default function StatsCards({
  openCount,
  criticalCount,
  productionStoppedCount,
  totalCount,
}: StatsCardsProps) {
  return (
    <div className="nc-stats">
      <div className="stat-card urgent">
        <div className="stat-icon">🚨</div>
        <div className="stat-content">
          <div className="stat-value">{openCount}</div>
          <div className="stat-label">Em Aberto</div>
        </div>
      </div>
      <div className="stat-card critical">
        <div className="stat-icon">⚠️</div>
        <div className="stat-content">
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-label">Críticas/Altas</div>
        </div>
      </div>
      <div className="stat-card stopped">
        <div className="stat-icon">⏸️</div>
        <div className="stat-content">
          <div className="stat-value">{productionStoppedCount}</div>
          <div className="stat-label">Produção Parada</div>
        </div>
      </div>
      <div className="stat-card total">
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>
    </div>
  );
}
