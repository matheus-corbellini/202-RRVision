// Tipos para roteiros operacionais
export interface Product {
	id: string;
	code: string;
	name: string;
	description: string;
	category: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface Step {
	id: string;
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

export interface OperationalRoute {
	id: string;
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
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface RouteAssignment {
	id: string;
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
