// Tipos para não conformidades
export interface NonConformity {
	id: string;
	title: string;
	description: string;
	severity: "low" | "medium" | "high" | "critical";
	priority: "low" | "medium" | "high" | "urgent";
	status: "open" | "investigating" | "resolved" | "closed";
	category: string;
	location: {
		sector: string;
		station?: string;
		equipment?: string;
	};
	reportedBy: {
		id: string;
		name: string;
		role: string;
	};
	assignedTo?: {
		id: string;
		name: string;
		role: string;
	};
	createdAt: string;
	updatedAt: string;
	dueDate?: string;
	resolvedAt?: string;
	resolvedBy?: string;
	attachments: string[];
	tags?: string[];
	comments?: Array<{
		id: string;
		userId: string;
		userName: string;
		message: string;
		timestamp: string;
		type: "comment" | "status_change" | "resolution";
	}>;
}

export interface NonConformityStats {
	total: number;
	open: number;
	investigating: number;
	resolved: number;
	closed: number;
	bySeverity: {
		low: number;
		medium: number;
		high: number;
		critical: number;
	};
	byPriority: {
		low: number;
		medium: number;
		high: number;
		urgent: number;
	};
}

export interface NonConformityFilters {
	status?: string[];
	severity?: string[];
	priority?: string[];
	category?: string[];
	sector?: string[];
	assignedTo?: string;
	dateRange?: {
		start: string;
		end: string;
	};
}
