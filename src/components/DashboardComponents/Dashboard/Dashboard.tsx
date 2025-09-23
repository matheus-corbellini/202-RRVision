"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigation } from "../../../hooks/useNavigation";
import { useBlingOrders } from "../../../hooks/useBlingOrders";
import { useBlingToken } from "../../../hooks/useBlingToken";
import { path } from "../../../routes/path";
import {
	DashboardHeader,
	DashboardStats,
	OrdersSection,
	AlertsPanel,
	SectorsPanel,
} from "../index";
import BlingIntegrationStatus from "../../BlingIntegrationStatus/BlingIntegrationStatus";
import BlingDemoData from "../../BlingDemoData/BlingDemoData";
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
	const { hasToken, token } = useBlingToken();

	// Hook para dados do Bling
	const {
		orders,
		loading: blingLoading,
		error: blingError,
		stats: blingStats,
		lastSync: blingLastSync,
		refresh: refreshBlingOrders,
	} = useBlingOrders({
		accessToken: token || undefined, // Token reativo do hook
		autoRefresh: true,
		refreshInterval: 60000, // 1 minuto
	});

	const [alerts, setAlerts] = useState<Alert[]>([]);
	const [sectors, setSectors] = useState<Sector[]>([]);
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [, setImportLogs] = useState<string[]>([]);
	const [lastSync, setLastSync] = useState<Date>(new Date());
	const [demoOrders, setDemoOrders] = useState<Order[]>([]);

	// Dados mockados apenas para alerts e setores (que não vêm do Bling)
	useEffect(() => {

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

	const handleImportBling = async () => {
		// Atualizar dados do Bling
		try {
			await refreshBlingOrders();
			const newLog = `${new Date().toLocaleTimeString()} [SUCCESS] Dados do Bling atualizados com sucesso`;
			setImportLogs((prev) => [...prev, newLog]);
			setLastSync(blingLastSync || new Date());
		} catch (error) {
			const newLog = `${new Date().toLocaleTimeString()} [ERROR] Erro ao atualizar dados do Bling`;
			setImportLogs((prev) => [...prev, newLog]);
			console.error('Erro ao atualizar dados do Bling:', error);
		}
	};

	// Usar dados reais do Bling ou dados de demonstração
	const currentOrders = hasToken ? orders : demoOrders;
	const currentStats = hasToken ? blingStats : {
		totalOrders: demoOrders.length,
		pendingOrders: demoOrders.filter(o => o.status === 'pending').length,
		completedOrders: demoOrders.filter(o => o.status === 'completed').length,
		inProgressOrders: demoOrders.filter(o => o.status === 'in_progress').length,
		cancelledOrders: demoOrders.filter(o => o.status === 'cancelled').length,
		urgentOrders: demoOrders.filter(o => o.priority === 'urgent').length,
		highPriorityOrders: demoOrders.filter(o => o.priority === 'high').length,
		mediumPriorityOrders: demoOrders.filter(o => o.priority === 'medium').length,
		lowPriorityOrders: demoOrders.filter(o => o.priority === 'low').length,
	};

	// Calcular estatísticas usando dados reais do Bling ou demonstração
	const dashboardStats: StatsData = {
		totalAlerts: alerts.length,
		activeAlerts: alerts.filter(a => a.status === "active").length,
		resolvedAlerts: alerts.filter(a => a.status === "resolved").length,
		totalOrders: currentStats.totalOrders,
		pendingOrders: currentStats.pendingOrders,
		completedOrders: currentStats.completedOrders,
		productivity: 84, // TODO: Calcular baseado em dados reais
		efficiency: 84, // TODO: Calcular baseado em dados reais
	};

	if (loading || blingLoading) {
		return (
			<div className="dashboard-loading">
				<p>Carregando dashboard...</p>
				{blingLoading && <p>Carregando dados do Bling...</p>}
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
					lastSync={blingLastSync || lastSync}
					onImportBling={handleImportBling}
					onLogout={handleLogout}
				/>

				<DashboardStats stats={dashboardStats} />

				<div className="dashboard-content">
					{!hasToken ? (
						<BlingDemoData onDataChange={setDemoOrders} />
					) : (
						<BlingIntegrationStatus
							hasToken={hasToken}
							lastSync={blingLastSync}
							error={blingError}
							onConfigure={() => goTo('/bling-integration')}
						/>
					)}

					{(!blingError || !hasToken) && (
						<OrdersSection
							orders={currentOrders}
							filterStatus={filterStatus}
							onFilterChange={setFilterStatus}
						/>
					)}

					<div className="sidebar-section">
						<AlertsPanel alerts={alerts} />
						<SectorsPanel sectors={sectors} />
					</div>
				</div>
			</div>
		</div>
	);
}
