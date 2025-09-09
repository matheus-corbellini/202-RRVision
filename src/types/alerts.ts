// Tipos para alertas
import type { BaseEntity, Location, Priority, Severity, Status, Comment } from './base';

export interface ProductionAlert extends BaseEntity {
	title: string;
	description: string;
	severity: Severity;
	priority: Priority;
	status: Status;
	location: Location;
	relatedEntity: {
		id: string;
		name: string;
	};
	source: {
		id: string;
		name: string;
	};
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
	comments?: Comment[];
}

export interface AlertStats {
	total: number;
	active: number;
	acknowledged: number;
	resolved: number;
	dismissed: number;
	bySeverity: Record<Severity, number>;
	byPriority: Record<Priority, number>;
}