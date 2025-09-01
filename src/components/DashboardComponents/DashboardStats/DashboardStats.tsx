import {
  FaClipboardList,
  FaBolt,
  FaExclamationTriangle,
  FaIndustry,
} from "react-icons/fa";
import type { DashboardStats as StatsData } from "../../../types/dashboard";
import "./DashboardStats.css";

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value: number | string;
  change: string;
  changeType: "positive" | "negative";
}

function StatCard({ title, icon, value, change, changeType }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-grid">
        <div className="stat-title">{title}</div>
        <div className="stat-icon">{icon}</div>
        <div className="stat-value">{value}</div>
        <div className={`stat-change ${changeType}`}>{change}</div>
      </div>
    </div>
  );
}

interface DashboardStatsProps {
  stats: StatsData;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="dashboard-stats">
      <StatCard
        title="Total de Pedidos"
        icon={<FaClipboardList />}
        value={stats.totalOrders}
        change="+2 hoje"
        changeType="positive"
      />
      <StatCard
        title="Produtividade"
        icon={<FaBolt />}
        value={`${stats.productivity}%`}
        change="+3% esta semana"
        changeType="positive"
      />
      <StatCard
        title="Pedidos Pendentes"
        icon={<FaExclamationTriangle />}
        value={stats.pendingOrders}
        change="Atenção necessária"
        changeType="negative"
      />
      <StatCard
        title="Eficiência"
        icon={<FaIndustry />}
        value={`${stats.efficiency}%`}
        change="Operação normal"
        changeType="positive"
      />
    </div>
  );
}
