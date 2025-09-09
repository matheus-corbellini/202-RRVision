// Tipos para pendências
import type { BaseEntity, Location, UserReference, Priority, Status, Comment } from './base';

export interface Pendency extends BaseEntity {
	title: string;
	description: string;
	priority: Priority;
	status: Status;
	category: string;
	location: Location;
	assignedTo: UserReference;
	reportedBy: UserReference;
	dueDate: string;
	completedAt?: string;
	completedBy?: string;
	attachments: string[];
	tags?: string[];
	comments?: Comment[];
}