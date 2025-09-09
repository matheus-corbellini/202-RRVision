// Tipos para pedidos/ordens de produção do Bling
import type { BaseEntity, Priority } from './base';

export interface BlingOrder extends BaseEntity {
	blingOrderId: string; 
	orderNumber: string; 
	
	// Produto
	productCode: string; // Código do Produto
	productName: string; // Descrição do Produto
	productDescription?: string;
	productCategory?: string;
	
	// Quantidade e datas
	quantity: number; // Quantidade pedida
	orderDate: string; // Data de colocação do pedido
	promisedDeliveryDate: string; // Data prometida de entrega
	actualDeliveryDate?: string; // Data real de entrega
	
	// Status e prioridade
	status: "new" | "in_production" | "completed" | "urgent" | "rejected" | "cancelled" | "on_hold";
	priority: Priority;
	
	// Cliente
	customer: {
		id: string;
		name: string;
		code?: string;
		email?: string;
		phone?: string;
		address?: string;
	};
	
	// Observações e controle
	observations?: string;
	internalNotes?: string;
	
	// Relacionamentos
	assignedOperatorId?: string;
	assignedSectorId?: string;
	routeId?: string; // Roteiro operacional associado
	
	// Controle de produção
	productionStartDate?: string;
	productionEndDate?: string;
	estimatedProductionTime?: number; // em minutos
	actualProductionTime?: number; // em minutos
	
	// Status de qualidade
	qualityStatus: "pending" | "approved" | "rejected" | "needs_review";
	qualityNotes?: string;
	
	// Anexos e documentos
	attachments: string[];
	
	// Metadados
	importedAt: string; // Data de importação do Bling
	lastSyncAt?: string; // Última sincronização com Bling
}

export interface BlingOrderStats {
	total: number;
	byStatus: {
		new: number;
		in_production: number;
		completed: number;
		urgent: number;
		rejected: number;
		cancelled: number;
		on_hold: number;
	};
	byPriority: Record<Priority, number>;
	byCustomer: Record<string, number>;
	bySector: Record<string, number>;
	byOperator: Record<string, number>;
	averageProductionTime: number;
	onTimeDelivery: number; // percentual de entregas no prazo
}

export interface BlingOrderFilters {
	status?: string[];
	priority?: Priority[];
	customer?: string[];
	operator?: string;
	sector?: string;
	dateRange?: {
		start: string;
		end: string;
	};
	deliveryDateRange?: {
		start: string;
		end: string;
	};
	hasAttachments?: boolean;
	qualityStatus?: string[];
}

export interface BlingSyncStatus {
	lastSync: string;
	status: "success" | "error" | "in_progress";
	ordersImported: number;
	ordersUpdated: number;
	errors: string[];
	nextSync?: string;
}