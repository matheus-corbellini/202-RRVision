// Tipos para não conformidades
import type { BaseEntity, Location, UserReference, SectorReference, Priority, Severity, Status, Attachment, Comment } from './base';

export interface NonConformity extends BaseEntity {
	title: string;
	description: string;
	severity: Severity;
	priority: Priority;
	status: Status;
	category: "quality" | "safety" | "process" | "equipment" | "material";
	location: Location;
	relatedOrderId?: string; // ID da ordem de produção
	reportedBy: UserReference;
	assignedTo?: UserReference;
	responsibleSector?: SectorReference;
	dueDate?: string;
	resolvedAt?: string;
	resolvedBy?: string;
	// Upload de anexos (fotos, laudos)
	attachments: Attachment[];
	tags?: string[];
	comments?: Comment[];
	// Campos adicionais para controle
	stopProduction: boolean;
	requiresImmediateAction: boolean;
	escalationLevel: "none" | "supervisor" | "manager" | "director";
}

export interface NonConformityStats {
	total: number;
	open: number;
	investigating: number;
	resolved: number;
	closed: number;
	bySeverity: Record<Severity, number>;
	byPriority: Record<Priority, number>;
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
	status?: Status[];
	severity?: Severity[];
	priority?: Priority[];
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