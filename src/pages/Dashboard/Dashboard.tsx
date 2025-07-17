"use client";

import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { path } from "../../routes/path";
import Button from "../../components/Button/Button";
import "./Dashboard.css";
import { useState, useEffect } from "react";

interface Order {
  id: string;
  product: string;
  quantity: number;
  status: "pending" | "production" | "completed" | "urgent";
  progress: number;
  startDate: string;
  expectedEnd: string;
  actualEnd?: string;
  isOverdue: boolean;
  isUrgent: boolean;
  sectors: OrderSector[];
}

interface OrderSector {
  name: string;
  activity: string;
  estimatedTime: number;
  actualTime?: number;
  setupTime: number;
  status: "pending" | "active" | "completed" | "blocked";
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
}

interface Sector {
  name: string;
  status: "active" | "idle" | "blocked";
  efficiency: number;
  activeOrders: number;
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { goTo } = useNavigation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Mock data - Em produção, isso viria da API/Bling
  useEffect(() => {
    // Simular dados de pedidos
    const mockOrders: Order[] = [
      {
        id: "OP-2024-001",
        product: "Produto A - Modelo X",
        quantity: 100,
        status: "urgent",
        progress: 45,
        startDate: "2024-01-15",
        expectedEnd: "2024-01-20",
        isOverdue: true,
        isUrgent: true,
        sectors: [
          {
            name: "Corte",
            activity: "Cortar peças",
            estimatedTime: 120,
            actualTime: 140,
            setupTime: 30,
            status: "completed",
          },
          {
            name: "Montagem",
            activity: "Montar componentes",
            estimatedTime: 180,
            setupTime: 45,
            status: "active",
          },
          {
            name: "Acabamento",
            activity: "Finalizar produto",
            estimatedTime: 90,
            setupTime: 15,
            status: "pending",
          },
        ],
      },
      {
        id: "OP-2024-002",
        product: "Produto B - Modelo Y",
        quantity: 50,
        status: "production",
        progress: 75,
        startDate: "2024-01-16",
        expectedEnd: "2024-01-22",
        isOverdue: false,
        isUrgent: false,
        sectors: [
          {
            name: "Corte",
            activity: "Cortar peças",
            estimatedTime: 60,
            actualTime: 55,
            setupTime: 20,
            status: "completed",
          },
          {
            name: "Montagem",
            activity: "Montar componentes",
            estimatedTime: 120,
            actualTime: 110,
            setupTime: 30,
            status: "completed",
          },
          {
            name: "Acabamento",
            activity: "Finalizar produto",
            estimatedTime: 45,
            setupTime: 10,
            status: "active",
          },
        ],
      },
      {
        id: "OP-2024-003",
        product: "Produto C - Modelo Z",
        quantity: 200,
        status: "pending",
        progress: 0,
        startDate: "2024-01-18",
        expectedEnd: "2024-01-25",
        isOverdue: false,
        isUrgent: false,
        sectors: [
          {
            name: "Corte",
            activity: "Cortar peças",
            estimatedTime: 240,
            setupTime: 60,
            status: "pending",
          },
          {
            name: "Montagem",
            activity: "Montar componentes",
            estimatedTime: 360,
            setupTime: 90,
            status: "pending",
          },
          {
            name: "Acabamento",
            activity: "Finalizar produto",
            estimatedTime: 180,
            setupTime: 30,
            status: "pending",
          },
        ],
      },
      {
        id: "OP-2024-004",
        product: "Produto D - Modelo W",
        quantity: 75,
        status: "completed",
        progress: 100,
        startDate: "2024-01-10",
        expectedEnd: "2024-01-17",
        actualEnd: "2024-01-16",
        isOverdue: false,
        isUrgent: false,
        sectors: [
          {
            name: "Corte",
            activity: "Cortar peças",
            estimatedTime: 90,
            actualTime: 85,
            setupTime: 25,
            status: "completed",
          },
          {
            name: "Montagem",
            activity: "Montar componentes",
            estimatedTime: 135,
            actualTime: 130,
            setupTime: 40,
            status: "completed",
          },
          {
            name: "Acabamento",
            activity: "Finalizar produto",
            estimatedTime: 67,
            actualTime: 60,
            setupTime: 12,
            status: "completed",
          },
        ],
      },
    ];

    const mockAlerts: Alert[] = [
      {
        id: "1",
        type: "critical",
        title: "Atraso Crítico",
        message: "OP-2024-001 está 2 dias atrasada",
        timestamp: "10:30",
      },
      {
        id: "2",
        type: "warning",
        title: "Setor Ocioso",
        message: "Setor de Acabamento com 40% de ociosidade",
        timestamp: "09:15",
      },
      {
        id: "3",
        type: "info",
        title: "Importação Concluída",
        message: "15 novos pedidos importados do Bling",
        timestamp: "08:45",
      },
    ];

    const mockSectors: Sector[] = [
      { name: "Corte", status: "active", efficiency: 87, activeOrders: 3 },
      { name: "Montagem", status: "active", efficiency: 92, activeOrders: 5 },
      { name: "Acabamento", status: "idle", efficiency: 65, activeOrders: 1 },
      { name: "Embalagem", status: "blocked", efficiency: 0, activeOrders: 0 },
    ];

    const mockLogs = [
      "08:45 [INFO] Iniciando importação do Bling...",
      "08:46 [SUCCESS] 15 pedidos importados com sucesso",
      "08:47 [INFO] Processando roteiros de produção...",
      "08:48 [SUCCESS] Roteiros carregados para 12 produtos",
      "08:49 [WARNING] 3 produtos sem roteiro definido",
      "08:50 [INFO] Calculando tempos de produção...",
      "08:51 [SUCCESS] Importação finalizada",
    ];

    setOrders(mockOrders);
    setAlerts(mockAlerts);
    setSectors(mockSectors);
    setImportLogs(mockLogs);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      goTo(path.landing);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleImportBling = () => {
    // Simular importação do Bling
    const newLog = `${new Date().toLocaleTimeString()} [INFO] Importação manual iniciada...`;
    setImportLogs((prev) => [...prev, newLog]);
    setLastSync(new Date());
  };

  const filteredOrders = orders.filter(
    (order) => filterStatus === "all" || order.status === filterStatus
  );

  const getStatusBadgeClass = (status: string, isUrgent: boolean) => {
    if (isUrgent) return "status-badge status-urgent";
    switch (status) {
      case "pending":
        return "status-badge status-pending";
      case "production":
        return "status-badge status-production";
      case "completed":
        return "status-badge status-completed";
      default:
        return "status-badge";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "production":
        return "Produção";
      case "completed":
        return "Concluído";
      case "urgent":
        return "Urgente";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (!user) {
    goTo(path.login);
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Dashboard de Produção</h1>
              <p>Bem-vindo, {user.name || user.displayName || user.email}</p>
            </div>
            <div className="header-actions">
              <div className="sync-status">
                <div className="sync-indicator"></div>
                <span>Última sync: {lastSync.toLocaleTimeString()}</span>
              </div>
              <Button variant="primary" onClick={handleImportBling}>
                Importar Bling
              </Button>
              <Button variant="secondary" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Pedidos Ativos</span>
              <span className="stat-icon">📋</span>
            </div>
            <div className="stat-value">
              {orders.filter((o) => o.status !== "completed").length}
            </div>
            <div className="stat-change positive">+2 hoje</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Eficiência Média</span>
              <span className="stat-icon">⚡</span>
            </div>
            <div className="stat-value">84%</div>
            <div className="stat-change positive">+3% esta semana</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Pedidos Urgentes</span>
              <span className="stat-icon">🚨</span>
            </div>
            <div className="stat-value">
              {orders.filter((o) => o.isUrgent).length}
            </div>
            <div className="stat-change negative">Atenção necessária</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-title">Setores Ativos</span>
              <span className="stat-icon">🏭</span>
            </div>
            <div className="stat-value">
              {sectors.filter((s) => s.status === "active").length}
            </div>
            <div className="stat-change positive">Operação normal</div>
          </div>
        </div>

        {/* Import Section */}
        <div className="import-section">
          <div className="import-header">
            <h3>Importação e Preparação - Bling ERP</h3>
            <Button variant="outline" onClick={handleImportBling}>
              Sincronizar Agora
            </Button>
          </div>

          <div className="import-stats">
            <div className="import-stat">
              <div className="import-stat-value">15</div>
              <div className="import-stat-label">Pedidos Importados</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-value">12</div>
              <div className="import-stat-label">Roteiros Carregados</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-value">3</div>
              <div className="import-stat-label">Pendentes Roteiro</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-value">100%</div>
              <div className="import-stat-label">Tempos Calculados</div>
            </div>
          </div>

          <div className="import-log">
            {importLogs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-timestamp">{log.split(" ")[0]}</span>
                <span
                  className={`log-message ${
                    log.includes("[SUCCESS]")
                      ? "log-success"
                      : log.includes("[ERROR]")
                      ? "log-error"
                      : log.includes("[WARNING]")
                      ? "log-warning"
                      : ""
                  }`}
                >
                  {log.substring(log.indexOf(" ") + 1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Orders Section */}
          <div className="orders-section">
            <div className="section-header">
              <h3 className="section-title">Ordens de Produção</h3>
              <div className="section-actions">
                <button className="btn-icon" title="Atualizar">
                  🔄
                </button>
                <button className="btn-icon" title="Exportar">
                  📊
                </button>
                <button className="btn-icon" title="Configurações">
                  ⚙️
                </button>
              </div>
            </div>

            <div className="orders-filters">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
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
                        className={getStatusBadgeClass(
                          order.status,
                          order.isUrgent
                        )}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="progress-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-text">{order.progress}%</div>
                    </td>
                    <td>
                      <div
                        className={`date-cell ${
                          order.isOverdue ? "date-overdue" : ""
                        }`}
                      >
                        {new Date(order.expectedEnd).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </td>
                    <td>
                      {order.isOverdue && (
                        <span className="alert-icon">⚠️</span>
                      )}
                      {order.isUrgent && <span className="alert-icon">🚨</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar */}
          <div className="sidebar-section">
            {/* Alerts Panel */}
            <div className="alerts-panel">
              <div className="panel-header">
                <h4 className="panel-title">Alertas e Notificações</h4>
              </div>
              <div className="panel-content">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    <div className="alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.message}</p>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#4a5568" }}>
                      {alert.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sectors-panel">
              <div className="panel-header">
                <h4 className="panel-title">Status dos Setores</h4>
              </div>
              <div className="panel-content">
                {sectors.map((sector, index) => (
                  <div key={index} className="sector-item">
                    <div className="sector-info">
                      <h4>{sector.name}</h4>
                      <p>
                        Eficiência: {sector.efficiency}% | Pedidos:{" "}
                        {sector.activeOrders}
                      </p>
                    </div>
                    <div className="sector-status">
                      <div
                        className={`status-indicator status-${sector.status}`}
                      ></div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {sector.status === "active"
                          ? "Ativo"
                          : sector.status === "idle"
                          ? "Ocioso"
                          : "Bloqueado"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
