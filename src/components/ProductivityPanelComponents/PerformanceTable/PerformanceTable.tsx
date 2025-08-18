import { FaChartBar } from "react-icons/fa";
import "./PerformanceTable.css";

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

interface PerformanceTableProps {
  filteredData: ProductivityData[];
  getEfficiencyColor: (efficiency: number) => string;
  formatTime: (minutes: number) => string;
}

export default function PerformanceTable({
  filteredData,
  getEfficiencyColor,
  formatTime,
}: PerformanceTableProps) {
  return (
    <div className="performance-section">
      <div className="section-header">
        <h3>Performance Detalhada</h3>
        <div className="section-actions">
          <button className="export-btn">
            <FaChartBar /> Exportar
          </button>
        </div>
      </div>

      <div className="performance-table-container">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Operador</th>
              <th>Tarefa</th>
              <th>Pedido</th>
              <th>Setor</th>
              <th>Planejado</th>
              <th>Real</th>
              <th>Melhor</th>
              <th>Eficiência</th>
              <th>Produtividade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="performance-row">
                <td>
                  <div className="operator-cell">
                    <div className="operator-avatar">
                      {item.operatorName.split(" ")[0].charAt(0)}
                      {item.operatorName.split(" ")[1]?.charAt(0)}
                    </div>
                    <span>{item.operatorName}</span>
                  </div>
                </td>
                <td>
                  <div className="task-cell">
                    <div className="task-name">{item.taskName}</div>
                    <div className="task-id">{item.taskId}</div>
                  </div>
                </td>
                <td>
                  <div className="order-cell">
                    <div className="order-name">{item.orderName}</div>
                    <div className="order-id">{item.orderId}</div>
                  </div>
                </td>
                <td>
                  <span className="sector-badge">{item.sector}</span>
                </td>
                <td>{formatTime(item.plannedTime)}</td>
                <td>{formatTime(item.actualTime)}</td>
                <td>{formatTime(item.bestHistoricTime)}</td>
                <td>
                  <div className="efficiency-cell">
                    <span
                      className="efficiency-value"
                      style={{ color: getEfficiencyColor(item.efficiency) }}
                    >
                      {item.efficiency.toFixed(1)}%
                    </span>
                    <div className="efficiency-bar">
                      <div
                        className="efficiency-fill"
                        style={{
                          width: `${Math.min(item.efficiency, 150)}%`,
                          backgroundColor: getEfficiencyColor(item.efficiency),
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="productivity-value"
                    style={{ color: getEfficiencyColor(item.productivity) }}
                  >
                    {item.productivity.toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status === "completed"
                      ? "Concluído"
                      : item.status === "in_progress"
                      ? "Em Andamento"
                      : "Atrasado"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
