// Tipos para dashboard
import type { ProductionAlert } from './alerts';
import type { NonConformityStats } from './nonConformities';
import type { Priority } from './base';

// Re-exportar ProductionAlert como Alert para compatibilidade
export type { ProductionAlert as Alert } from './alerts';

export interface DashboardStats {
	totalAlerts: number;
	activeAlerts: number;
	resolvedAlerts: number;
	totalOrders: number;
	pendingOrders: number;
	completedOrders: number;
	productivity: number;
	efficiency: number;
}

export interface Order {
	id: string;
	orderNumber: string;
	customer: string;
	product: string;
	quantity: number;
	status: "pending" | "in_progress" | "completed" | "cancelled";
	priority: Priority;
	createdAt: string;
	dueDate: string;
	completedAt?: string;
}

export interface ImportData {
	id: string;
	fileName: string;
	importDate: string;
	status: "pending" | "processing" | "completed" | "failed";
	recordsCount: number;
	successCount: number;
	errorCount: number;
	errors?: string[];
}

export interface ControlPanelData {
	alerts: ProductionAlert[];
	pendencies: any[];
	nonConformities: NonConformityStats;
	stats: {
		totalAlerts: number;
		activeAlerts: number;
		totalPendencies: number;
		totalNonConformities: number;
	};
	generalStatus: "green" | "yellow" | "red";
	activeOrders: number;
	urgentOrders: number;
	blockedOrders: number;
}