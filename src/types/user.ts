// Tipos específicos para usuários
import type { BaseEntity, UserRole, ContractType, AccessLevel, CompetencyLevel } from './base';

export interface User extends BaseEntity {
	email: string;
	name: string;
	displayName?: string;
	company?: string;
	phone?: string;
	photoURL?: string | null;
	emailVerified: boolean;
	userType: string;
	role: UserRole;
	operatorData?: OperatorData;
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
	role: UserRole;
	userType: string;
	accessToken: string;
	operatorData?: OperatorData;
}

export interface OperatorData {
	// Código do Operador (ID)
	code: string;
	
	// Setor principal
	primarySectorId: string;
	primarySectorName?: string;
	
	// Lista de setores secundários ou alternativos
	secondarySectorIds: string[];
	secondarySectorNames?: string[];
	
	// Lista de atividades treinado a executar
	trainedActivities: string[];
	trainedActivitiesDetails?: Array<{
		activityId: string;
		activityName: string;
		trainedDate: string;
		validUntil?: string;
		competencyLevel: CompetencyLevel;
	}>;
	
	// Status (ativo/inativo)
	status: "active" | "inactive" | "suspended" | "terminated";
	
	// Data de admissão / últimos treinamentos
	admissionDate: string;
	lastTrainingDate?: string;
	nextTrainingDate?: string;
	
	// Dados contratuais
	contractType: ContractType;
	workSchedule: string; // Referência ao WorkSchedule
	weeklyHours: number;
	
	// Relacionamentos
	supervisorId?: string;
	supervisorName?: string;
	teamId?: string;
	teamName?: string;
	
	// Habilidades e competências
	skills: string[];
	certifications: Array<{
		id: string;
		name: string;
		issuer: string;
		issuedDate: string;
		expiryDate?: string;
		documentUrl?: string;
	}>;
	
	// Controle de acesso
	accessLevel: AccessLevel;
	permissions: string[];
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

export interface Team extends BaseEntity {
	name: string;
	code: string;
	isActive: boolean;
}