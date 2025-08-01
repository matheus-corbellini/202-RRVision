import { FaTrophy, FaMedal, FaAward } from "react-icons/fa";
import "./RankingsSection.css";

interface OperatorRanking {
  operatorId: string;
  operatorName: string;
  totalTasks: number;
  averageEfficiency: number;
  totalProductivity: number;
  onTimeCompletion: number;
  rank: number;
  trend: "up" | "down" | "stable";
}

interface RankingsSectionProps {
  operatorRankings: OperatorRanking[];
  getEfficiencyColor: (efficiency: number) => string;
  getTrendIcon: (trend: string) => string;
}

export default function RankingsSection({
  operatorRankings,
  getEfficiencyColor,
  getTrendIcon,
}: RankingsSectionProps) {
  return (
    <div className="rankings-section">
      <div className="section-header">
        <h3>Ranking de Operadores</h3>
      </div>

      <div className="rankings-grid">
        {operatorRankings.map((operator, index) => (
          <div
            key={operator.operatorId}
            className={`ranking-card ${index < 3 ? "podium" : ""}`}
          >
            <div className="ranking-header">
              <div className="rank-position">
                <span className="rank-number">#{operator.rank}</span>
                {index === 0 && (
                  <span className="medal">
                    <FaTrophy />
                  </span>
                )}
                {index === 1 && (
                  <span className="medal">
                    <FaMedal />
                  </span>
                )}
                {index === 2 && (
                  <span className="medal">
                    <FaAward />
                  </span>
                )}
              </div>
              <div className="trend">{getTrendIcon(operator.trend)}</div>
            </div>

            <div className="operator-info">
              <div className="operator-avatar large">
                {operator.operatorName.split(" ")[0].charAt(0)}
                {operator.operatorName.split(" ")[1]?.charAt(0)}
              </div>
              <h4>{operator.operatorName}</h4>
            </div>

            <div className="ranking-metrics">
              <div className="ranking-metric">
                <span
                  className="metric-value"
                  style={{
                    color: getEfficiencyColor(operator.averageEfficiency),
                  }}
                >
                  {operator.averageEfficiency.toFixed(1)}%
                </span>
                <span className="metric-label">Eficiência</span>
              </div>
              <div className="ranking-metric">
                <span className="metric-value">
                  {operator.totalProductivity.toFixed(1)}%
                </span>
                <span className="metric-label">Produtividade</span>
              </div>
              <div className="ranking-metric">
                <span className="metric-value">{operator.totalTasks}</span>
                <span className="metric-label">Tarefas</span>
              </div>
              <div className="ranking-metric">
                <span className="metric-value">
                  {operator.onTimeCompletion.toFixed(1)}%
                </span>
                <span className="metric-label">No Prazo</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
