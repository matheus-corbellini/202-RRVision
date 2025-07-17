import type { DashboardStats as StatsData } from "../../types/dashboard";
import "./DashboardStats.css";

interface StatCardProps {
  title: string;
  icon: string;
  value: number | string;
  change: string;
  changeType: "positive" | "negative";
}

function StatCard({ title, icon, value, change, changeType }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeType}`}>{change}</div>
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
        title="Pedidos Ativos"
        icon="📋"
        value={stats.activeOrders}
        change="+2 hoje"
        changeType="positive"
      />
      <StatCard
        title="Eficiência Média"
        icon="⚡"
        value={`${stats.averageEfficiency}%`}
        change="+3% esta semana"
        changeType="positive"
      />
      <StatCard
        title="Pedidos Urgentes"
        icon="🚨"
        value={stats.urgentOrders}
        change="Atenção necessária"
        changeType="negative"
      />
      <StatCard
        title="Setores Ativos"
        icon="🏭"
        value={stats.activeSectors}
        change="Operação normal"
        changeType="positive"
      />
    </div>
  );
}
