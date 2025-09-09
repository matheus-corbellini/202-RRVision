// Tipos para roteiros operacionais
import type { BaseEntity } from './base';

export interface Product extends BaseEntity {
	code: string;
	name: string;
	description: string;
	category: string;
	isActive: boolean;
}

export interface Step extends BaseEntity {
	name: string;
	description: string;
	sequence: number;
	standardTime: number; // em minutos
	setupTime: number; // em minutos
	equipment: string;
	requirements: string[];
	notes: string;
	sectorId: string; // Associação com setor
	operatorId?: string; // Associação com operador (opcional)
}

export interface OperationalRoute extends BaseEntity {
	productId: string;
	productCode: string;
	productName: string;
	productDescription?: string;
	productCategory?: string;
	version: string;
	status: "active" | "inactive" | "draft";
	steps: Step[];
	totalStandardTime: number;
	totalSetupTime: number;
	totalSteps: number;
	// Associações com setor e operador
	primarySectorId: string;
	assignedOperatorId?: string;
}

export interface RouteAssignment extends BaseEntity {
	routeId: string;
	operatorId: string;
	sectorId: string;
	assignedAt: string;
	assignedBy: string;
	status: "active" | "inactive";
	notes?: string;
}

export interface RouteStats {
	total: number;
	active: number;
	draft: number;
	inactive: number;
	bySector: Record<string, number>;
	byOperator: Record<string, number>;
}