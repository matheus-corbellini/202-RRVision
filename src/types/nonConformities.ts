// Tipos para não conformidades
export interface NonConformity {
	id: string;
	title: string;
	description: string;
	severity: "low" | "medium" | "high" | "critical";
	priority: "low" | "medium" | "high" | "urgent";
	status: "open" | "investigating" | "resolved" | "closed";
	category: "quality" | "safety" | "process" | "equipment" | "material";
	location: {
		sector: string;
		sectorId: string;
		station?: string;
		equipment?: string;
	};
	// Associações com OP, setor e operador
	relatedOrderId?: string; // ID da ordem de produção
	reportedBy: {
		id: string;
		name: string;
		role: string;
		operatorId?: string;
	};
	assignedTo?: {
		id: string;
		name: string;
		role: string;
		operatorId?: string;
	};
	responsibleSector?: {
		id: string;
		name: string;
		managerId?: string;
	};
	createdAt: string;
	updatedAt: string;
	dueDate?: string;
	resolvedAt?: string;
	resolvedBy?: string;
	// Upload de anexos (fotos, laudos)
	attachments: Attachment[];
	tags?: string[];
	comments?: Array<{
		id: string;
		userId: string;
		userName: string;
		message: string;
		timestamp: string;
		type: "comment" | "status_change" | "resolution";
		attachments?: Attachment[];
	}>;
	// Campos adicionais para controle
	stopProduction: boolean;
	requiresImmediateAction: boolean;
	escalationLevel: "none" | "supervisor" | "manager" | "director";
}

export interface Attachment {
	id: string;
	fileName: string;
	fileType: string;
	fileSize: number;
	uploadedAt: string;
	uploadedBy: string;
	url: string;
	thumbnailUrl?: string;
	description?: string;
	category: "photo" | "document" | "video" | "audio" | "other";
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
	byCategory: {
		quality: number;
		safety: number;
		process: number;
		equipment: number;
		material: number;
	};
	bySector: Record<string, number>;
	productionStopped: number;
	requiresImmediateAction: number;
}

export interface NonConformityFilters {
	status?: string[];
	severity?: string[];
	priority?: string[];
	category?: string[];
	sector?: string[];
	assignedTo?: string;
	reportedBy?: string;
	dateRange?: {
		start: string;
		end: string;
	};
	stopProduction?: boolean;
	requiresImmediateAction?: boolean;
	escalationLevel?: string[];
}
