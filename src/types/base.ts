// Tipos base reutilizáveis
export interface BaseEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface Location {
	sector: string;
	sectorId?: string;
	station?: string;
	equipment?: string;
}

export interface UserReference {
	id: string;
	name: string;
	role: string;
	operatorId?: string;
}

export interface SectorReference {
	id: string;
	name: string;
	managerId?: string;
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

export interface Comment {
	id: string;
	userId: string;
	userName: string;
	message: string;
	timestamp: string;
	type: "comment" | "status_change" | "resolution" | "escalation" | "completion";
	attachments?: Attachment[];
}

// Enums e Union Types centralizados
export type Priority = "low" | "medium" | "high" | "urgent";
export type Severity = "low" | "medium" | "high" | "critical";
export type Status = "pending" | "in_progress" | "active" | "acknowledged" | "resolved" | "completed" | "closed" | "dismissed" | "cancelled" | "overdue" | "investigating";
export type UserRole = "admin" | "supervisor" | "operator";
export type ContractType = "clt" | "pj" | "temporary" | "intern" | "other";
export type AccessLevel = "basic" | "intermediate" | "advanced" | "admin";
export type CompetencyLevel = "basic" | "intermediate" | "advanced" | "expert";

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type WithTimestamps<T> = T & {
	createdAt: string;
	updatedAt: string;
};
export type WithUser<T> = T & {
	createdBy: string;
	updatedBy: string;
};
