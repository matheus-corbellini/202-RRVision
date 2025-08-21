// Tipos para alertas
export interface ProductionAlert {
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

export interface AlertStats {
	total: number;
	active: number;
	acknowledged: number;
	resolved: number;
	dismissed: number;
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
