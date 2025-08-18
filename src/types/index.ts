// Tipos principais do sistema
export interface User {
	id: string;
	email: string;
	name: string;
	displayName?: string;
	company?: string;
	phone?: string;
	photoURL?: string | null;
	emailVerified: boolean;
	userType: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	operatorData?: {
		code: string;
		primarySectorId: string;
		secondarySectorIds: string[];
		trainedActivities: string[];
		skills: string[];
		status: string;
		admissionDate: string;
		lastTrainingDate?: string;
		nextTrainingDate?: string;
		contractType: string;
		workSchedule: string;
		weeklyHours: number;
		supervisorId?: string;
		teamId?: string;
	};
}

export interface Operator extends User {
	code: string;
	primarySectorId: string;
	secondarySectorIds: string[];
	skills: string[];
	status: string;
	admissionDate: string;
	lastTrainingDate?: string;
	nextTrainingDate?: string;
	contractType: string;
	workSchedule: string;
	weeklyHours: number;
	supervisorId?: string;
	teamId?: string;
	userId: string;
}

export interface Team {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface Sector {
	id: string;
	name: string;
	code: string;
	description: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface AuthContextType {
	user: AuthUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<AuthUser>;
	logout: () => Promise<void>;
	register: (userData: any) => Promise<AuthUser>;
}

export interface LoginData {
	email: string;
	password: string;
}

export interface RegisterData {
	email: string;
	name: string;
	company?: string;
	phone?: string;
	password: string;
}

export interface AuthUser {
	id: string;
	email: string;
	displayName?: string;
	photoURL?: string | null;
	emailVerified: boolean;
	name?: string;
	company?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
	role: string;
	userType: string;
	accessToken: string;
}

export interface UserRole {
	id: string;
	name: string;
	permissions: string[];
}

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
	}>;
	comments?: Array<{
		id: string;
		userName: string;
		message: string;
		timestamp: string;
		type: "comment" | "status_change" | "escalation";
	}>;
}
