"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigation } from "../../../hooks/useNavigation";
import { path } from "../../../routes/path";
import {
	DashboardHeader,
	DashboardStats,
	ImportSection,
	OrdersSection,
	AlertsPanel,
	SectorsPanel,
} from "../index";
import type {
	Order,
	Alert,
	Sector,
	DashboardStats as StatsData,
	ImportData,
} from "../../../types/dashboard";
import "./Dashboard.css";

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

	// Calcular estatísticas
	const dashboardStats: StatsData = {
		activeOrders: orders.filter((o) => o.status !== "completed").length,
		averageEfficiency: 84,
		urgentOrders: orders.filter((o) => o.isUrgent).length,
		activeSectors: sectors.filter((s) => s.status === "active").length,
	};

	const importData: ImportData = {
		ordersImported: 15,
		routesLoaded: 12,
		pendingRoutes: 3,
		timesCalculated: "100%",
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

	const userName = user.name || user.displayName || user.email;

	return (
		<div className="dashboard-page">
			<div className="dashboard-container">
				<DashboardHeader
					userName={userName}
					lastSync={lastSync}
					onImportBling={handleImportBling}
					onLogout={handleLogout}
				/>

				<DashboardStats stats={dashboardStats} />

				<ImportSection
					importData={importData}
					importLogs={importLogs}
					onImportBling={handleImportBling}
				/>

				<div className="dashboard-content">
					<OrdersSection
						orders={orders}
						filterStatus={filterStatus}
						onFilterChange={setFilterStatus}
					/>

					<div className="sidebar-section">
						<AlertsPanel alerts={alerts} />
						<SectorsPanel sectors={sectors} />
					</div>
				</div>
			</div>
		</div>
	);
}
