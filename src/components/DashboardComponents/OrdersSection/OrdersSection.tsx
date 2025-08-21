import {
  FaSync,
  FaChartBar,
  FaCog,
  FaExclamationTriangle,
} from "react-icons/fa";
import type { Order } from "../../../types/dashboard";
import "./OrdersSection.css";

interface OrdersSectionProps {
  orders: Order[];
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

export default function OrdersSection({
  orders,
  filterStatus,
  onFilterChange,
}: OrdersSectionProps) {
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "urgent") return order.priority === "urgent";
    return order.status === filterStatus;
  });

  const getStatusBadgeClass = (status: string, priority: string) => {
    let baseClass = "status-badge";
    if (priority === "urgent") baseClass += " urgent";
    switch (status) {
      case "pending":
        return baseClass + " pending";
      case "in_progress":
        return baseClass + " production";
      case "completed":
        return baseClass + " completed";
      case "cancelled":
        return baseClass + " cancelled";
      default:
        return baseClass;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "production":
        return "Em Produção";
      case "completed":
        return "Concluído";
      case "urgent":
        return "Urgente";
      default:
        return status;
    }
  };

  return (
    <div className="orders-section">
      <div className="section-header">
        <h3 className="section-title">Ordens de Produção</h3>
        <div className="section-actions">
          <button className="btn-icon" title="Atualizar">
            <FaSync />
          </button>
          <button className="btn-icon" title="Exportar">
            <FaChartBar />
          </button>
          <button className="btn-icon" title="Configurações">
            <FaCog />
          </button>
        </div>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="production">Em Produção</option>
            <option value="completed">Concluído</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Período:</label>
          <select className="filter-select">
            <option>Hoje</option>
            <option>Esta Semana</option>
            <option>Este Mês</option>
          </select>
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>OP</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Status</th>
            <th>Progresso</th>
            <th>Previsão</th>
            <th>Alertas</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="order-row">
              <td>
                <div className="order-id">{order.id}</div>
              </td>
              <td>
                <div className="order-product">{order.product}</div>
              </td>
              <td>{order.quantity}</td>
              <td>
                <span
                  className={getStatusBadgeClass(order.status, order.priority)}
                >
                  {getStatusText(order.status)}
                </span>
              </td>
              <td>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{ width: "0%" }}
                  ></div>
                </div>
                <div className="progress-text">0%</div>
              </td>
              <td>
                <div className="date-cell">
                  {new Date(order.dueDate).toLocaleDateString("pt-BR")}
                </div>
              </td>
              <td>
                {order.priority === "urgent" && (
                  <span className="alert-icon">
                    <FaExclamationTriangle />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
