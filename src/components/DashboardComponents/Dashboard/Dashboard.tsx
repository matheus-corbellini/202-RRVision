"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigation } from "../../../hooks/useNavigation";
import { path } from "../../../routes/path";
import {
	DashboardHeader,
	DashboardStats,
	OrdersSection,
	AlertsPanel,
	SectorsPanel,
} from "../index";
import type {
	Order,
	Alert,
	DashboardStats as StatsData,
} from "../../../types/dashboard";
import type { Sector } from "../../../types/sectors";
import "./Dashboard.css";

export default function Dashboard() {
	const { user, logout, loading } = useAuth();
	const { goTo } = useNavigation();
	const [orders, setOrders] = useState<Order[]>([]);
	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [sectors, setSectors] = useState<Sector[]>([]);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [, setImportLogs] = useState<string[]>([]);
	const [lastSync, setLastSync] = useState<Date>(new Date());

	// Mock data - Em produção, isso viria da API/Bling
	useEffect(() => {
		// Simular dados de pedidos
		const mockOrders: Order[] = [
			{
				id: "OP-2024-001",
				orderNumber: "OP-2024-001",
				customer: "Cliente A",
				product: "Produto A - Modelo X",
				quantity: 100,
				status: "in_progress",
				priority: "urgent",
				createdAt: "2024-01-15",
				dueDate: "2024-01-20",
			},
			{
				id: "OP-2024-002",
				orderNumber: "OP-2024-002",
				customer: "Cliente B",
				product: "Produto B - Modelo Y",
				quantity: 50,
				status: "in_progress",
				priority: "medium",
				createdAt: "2024-01-16",
				dueDate: "2024-01-22",
			},
			{
				id: "OP-2024-003",
				orderNumber: "OP-2024-003",
				customer: "Cliente C",
				product: "Produto C - Modelo Z",
				quantity: 200,
				status: "pending",
				priority: "low",
				createdAt: "2024-01-18",
				dueDate: "2024-01-25",
			},
			{
				id: "OP-2024-004",
				orderNumber: "OP-2024-004",
				customer: "Cliente D",
				product: "Produto D - Modelo W",
				quantity: 75,
				status: "completed",
				priority: "low",
				createdAt: "2024-01-10",
				dueDate: "2024-01-17",
				completedAt: "2024-01-16",
			},
		];

		const mockAlerts: Alert[] = [
			{
				id: "1",
				title: "Atraso Crítico",
				description: "OP-2024-001 está 2 dias atrasada",
				severity: "critical",
				priority: "urgent",
				status: "active",
				location: {
					sector: "Produção",
				},
				relatedEntity: {
					id: "OP-2024-001",
					name: "Pedido OP-2024-001",
				},
				source: {
					id: "system",
					name: "Sistema",
				},
				createdAt: "2024-01-20T10:30:00Z",
				updatedAt: "2024-01-20T10:30:00Z",
				createdBy: "system",
				updatedBy: "system",
				attachments: [],
				recipients: [],
			},
			{
				id: "2",
				title: "Setor Ocioso",
				description: "Setor de Acabamento com 40% de ociosidade",
				severity: "medium",
				priority: "medium",
				status: "active",
				location: {
					sector: "Acabamento",
				},
				relatedEntity: {
					id: "acabamento",
					name: "Setor de Acabamento",
				},
				source: {
					id: "system",
					name: "Sistema",
				},
				createdAt: "2024-01-20T09:15:00Z",
				updatedAt: "2024-01-20T09:15:00Z",
				createdBy: "system",
				updatedBy: "system",
				attachments: [],
				recipients: [],
			},
			{
				id: "3",
				title: "Importação Concluída",
				description: "15 novos pedidos importados do Bling",
				severity: "low",
				priority: "low",
				status: "active",
				location: {
					sector: "Sistema",
				},
				relatedEntity: {
					id: "bling",
					name: "Integração Bling",
				},
				source: {
					id: "system",
					name: "Sistema",
				},
				createdAt: "2024-01-20T08:45:00Z",
				updatedAt: "2024-01-20T08:45:00Z",
				createdBy: "system",
				updatedBy: "system",
				attachments: [],
				recipients: [],
			},
		];

		const mockSectors: Sector[] = [
			{ id: "1", name: "Corte", code: "CORT", description: "Setor de Corte", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01", createdBy: "system", updatedBy: "system" },
			{ id: "2", name: "Montagem", code: "MONT", description: "Setor de Montagem", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01", createdBy: "system", updatedBy: "system" },
			{ id: "3", name: "Acabamento", code: "ACAB", description: "Setor de Acabamento", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01", createdBy: "system", updatedBy: "system" },
			{ id: "4", name: "Embalagem", code: "EMBA", description: "Setor de Embalagem", isActive: true, createdAt: "2024-01-01", updatedAt: "2024-01-01", createdBy: "system", updatedBy: "system" },
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
		totalAlerts: alerts.length,
		activeAlerts: alerts.filter(a => a.status === "active").length,
		resolvedAlerts: alerts.filter(a => a.status === "resolved").length,
		totalOrders: orders.length,
		pendingOrders: orders.filter(o => o.status === "pending").length,
		completedOrders: orders.filter(o => o.status === "completed").length,
		productivity: 84,
		efficiency: 84,
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
