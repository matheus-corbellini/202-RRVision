// Tipos para dashboard
import type { NonConformityStats } from "./nonConformities";

export interface Alert {
	id: string;
	title: string;
	description: string;
	severity: "low" | "medium" | "high" | "critical";
	priority: "low" | "medium" | "high" | "urgent";
	status: "active" | "acknowledged" | "resolved" | "dismissed";
	location: {
		sector: string;
		station?: string;
		equipment?: string;
	};
	relatedEntity: {
		id: string;
		name: string;
	};
	source: {
		id: string;
		name: string;
	};
	createdAt: string;
	acknowledgedAt?: string;
	acknowledgedBy?: string;
	resolvedAt?: string;
	resolvedBy?: string;
	attachments: string[];
	tags?: string[];
	recipients: Array<{
		id: string;
		name: string;
		role: string;
		acknowledged: boolean;
		department?: string;
	}>;
	comments?: Array<{
		id: string;
		userName: string;
		message: string;
		timestamp: string;
		type: "comment" | "status_change" | "escalation";
		userId?: string;
	}>;
}

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
	priority: "low" | "medium" | "high" | "urgent";
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
	alerts: Alert[];
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
