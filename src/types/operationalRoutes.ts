// Tipos para roteiros operacionais
import type { BaseEntity } from './base';

export interface Product extends BaseEntity {
	code: string;
	name: string;
	description: string;
	category: string;
	isActive: boolean;
	// Campos adicionais do Bling
	price?: number;
	costPrice?: number;
	brand?: string;
	model?: string;
	weight?: number;
	dimensions?: {
		width?: number;
		height?: number;
		depth?: number;
	};
	gtin?: string;
	type?: 'product' | 'service';
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
	productId?: string; // Opcional para roteiros criados a partir do Bling
	productCode: string;
	productName: string;
	productDescription?: string;
	productCategory?: string;
	version: string;
	status: "active" | "inactive" | "draft" | "completed";
	steps: Step[];
	setupTime: number; // Tempo de setup em minutos
	totalStandardTime: number; // Tempo total padrão em minutos
	// Associações com setor e operador
	primarySectorId?: string;
	assignedOperatorId?: string;
	// Campos de qualidade e segurança
	qualityStandards?: string[];
	requiredTools?: string[];
	safetyInstructions?: string[];
	notes?: string;
	// Campos específicos do Bling
	blingOrderId?: string;
	blingOrderNumber?: string;
	blingCustomerName?: string;
	blingOrderDate?: string;
	blingStatus?: string;
	quantity?: number;
	observations?: string;
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