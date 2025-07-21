import "./ChartsSection.css";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ProductivityData {
  operatorId: string;
  operatorName: string;
  taskId: string;
  taskName: string;
  orderId: string;
  orderName: string;
  sector: string;
  shift: "morning" | "afternoon" | "night";
  date: string;
  plannedTime: number;
  actualTime: number;
  bestHistoricTime: number;
  efficiency: number;
  productivity: number;
  status: "completed" | "in_progress" | "delayed";
}

interface ChartsSectionProps {
  productivityData: ProductivityData[];
}

interface TooltipPayload {
  payload: {
    efficiency: number;
    productivity: number;
    taskName: string;
    sector: string;
    status: string;
  };
}

export default function ChartsSection({
  productivityData,
}: ChartsSectionProps) {
  // Preparar dados para o gráfico de dispersão
  const scatterData = productivityData.map((item) => ({
    efficiency: item.efficiency,
    productivity: item.productivity,
    taskName: item.taskName,
    sector: item.sector,
    status: item.status,
  }));

  // Função para obter cor baseada no desempenho
  const getPerformanceColor = (efficiency: number, productivity: number) => {
    const average = (efficiency + productivity) / 2;
    if (average >= 105) return "#48bb78"; // Excelente - Verde
    if (average >= 95) return "#fbb040"; // Bom - Amarelo
    return "#f56565"; // Precisa Melhorar - Vermelho
  };

  // Tooltip customizado
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: TooltipPayload[];
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-title">{data.taskName}</p>
          <p className="tooltip-content">
            <span className="tooltip-label">Setor:</span> {data.sector}
          </p>
          <p className="tooltip-content">
            <span className="tooltip-label">Eficiência:</span>{" "}
            {data.efficiency.toFixed(1)}%
          </p>
          <p className="tooltip-content">
            <span className="tooltip-label">Produtividade:</span>{" "}
            {data.productivity.toFixed(1)}%
          </p>
          <p className="tooltip-content">
            <span className="tooltip-label">Status:</span>{" "}
            {data.status === "completed" ? "Concluído" : "Atrasado"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="charts-section">
      <div className="chart-card">
        <div className="chart-header">
          <h4>Eficiência vs. Produtividade</h4>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="efficiency"
                name="Eficiência"
                unit="%"
                domain={[60, 130]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis
                type="number"
                dataKey="productivity"
                name="Produtividade"
                unit="%"
                domain={[60, 130]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Linha de referência para 100% */}
              <line
                x1="100"
                y1="60"
                x2="100"
                y2="130"
                stroke="#cbd5e0"
                strokeDasharray="5,5"
              />
              <line
                x1="60"
                y1="100"
                x2="130"
                y2="100"
                stroke="#cbd5e0"
                strokeDasharray="5,5"
              />

              <Scatter name="Tarefas" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getPerformanceColor(
                      entry.efficiency,
                      entry.productivity
                    )}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#48bb78" }}
            ></div>
            <span>Excelente (&gt;105%)</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#fbb040" }}
            ></div>
            <span>Bom (95-105%)</span>
          </div>
          <div className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: "#f56565" }}
            ></div>
            <span>Precisa Melhorar (&lt;95%)</span>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h4>Tendência de Performance</h4>
        </div>
        <div className="chart-placeholder">
          <div className="chart-info">
            <p>Evolução da performance ao longo do tempo</p>
            <div className="trend-indicators">
              <div className="trend-item">
                <span className="trend-value positive">+5.2%</span>
                <span>vs. semana anterior</span>
              </div>
              <div className="trend-item">
                <span className="trend-value positive">+12.8%</span>
                <span>vs. mês anterior</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
