import { blingService } from './blingService';

export interface BlingProductionOrder {
	id: string;
	numero?: string;
	data?: string;
	dataSaida?: string;
	situacao?: string;
	cliente?: {
		nome?: string;
		cpf_cnpj?: string;
		email?: string;
		telefone?: string;
	};
	itens?: Array<{
		codigo?: string;
		descricao?: string;
		quantidade?: number;
		valor?: number;
		produto?: {
			id?: string;
			codigo?: string;
			nome?: string;
			descricao?: string;
		};
	}>;
	observacoes?: string;
	total?: number;
}

export interface BlingOrdersResult {
	success: boolean;
	data: BlingProductionOrder[];
	total: number;
	error?: string;
}

export class BlingOrdersService {
	/**
	 * Busca ordens de produção do Bling
	 */
	static async getProductionOrders(page: number = 1, limit: number = 100): Promise<BlingOrdersResult> {
		try {
			const result = await blingService.getProductionOrders(page, limit);
			
			return {
				success: true,
				data: result.data || [],
				total: result.total || 0
			};
		} catch (error) {
			console.error('Erro ao buscar ordens de produção:', error);
			return {
				success: false,
				data: [],
				total: 0,
				error: error instanceof Error ? error.message : 'Erro desconhecido'
			};
		}
	}

	/**
	 * Mapeia situação do Bling para status legível
	 */
	static mapBlingStatus(status?: string): { label: string; color: string; bgColor: string } {
		if (!status) {
			return { 
				label: 'Não informado', 
				color: '#6b7280', 
				bgColor: 'rgba(107, 114, 128, 0.15)' 
			};
		}

		const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
			'em_aberto': { 
				label: 'Em Aberto', 
				color: '#f59e0b', 
				bgColor: 'rgba(245, 158, 11, 0.15)' 
			},
			'em_producao': { 
				label: 'Em Produção', 
				color: '#3b82f6', 
				bgColor: 'rgba(59, 130, 246, 0.15)' 
			},
			'aguardando_producao': { 
				label: 'Aguardando Produção', 
				color: '#8b5cf6', 
				bgColor: 'rgba(139, 92, 246, 0.15)' 
			},
			'concluido': { 
				label: 'Concluído', 
				color: '#10b981', 
				bgColor: 'rgba(16, 185, 129, 0.15)' 
			},
			'cancelado': { 
				label: 'Cancelado', 
				color: '#ef4444', 
				bgColor: 'rgba(239, 68, 68, 0.15)' 
			},
			'pausado': { 
				label: 'Pausado', 
				color: '#6b7280', 
				bgColor: 'rgba(107, 114, 128, 0.15)' 
			}
		};

		return statusMap[status] || { 
			label: status, 
			color: '#6b7280', 
			bgColor: 'rgba(107, 114, 128, 0.15)' 
		};
	}

	/**
	 * Formata data para exibição
	 */
	static formatDate(dateString?: string): string {
		if (!dateString) {
			return 'Data não informada';
		}

		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric'
			});
		} catch {
			return dateString;
		}
	}

	/**
	 * Formata valor monetário
	 */
	static formatCurrency(value: number): string {
		if (typeof value !== 'number' || isNaN(value)) {
			return 'R$ 0,00';
		}
		
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(value);
	}

	/**
	 * Obtém informações do produto principal da ordem
	 */
	static getMainProduct(order: BlingProductionOrder): {
		code: string;
		name: string;
		quantity: number;
	} {
		if (order.itens && order.itens.length > 0) {
			const mainItem = order.itens[0];
			return {
				code: String(mainItem?.codigo || 'N/A'),
				name: String(mainItem?.descricao || 'Produto não especificado'),
				quantity: Number(mainItem?.quantidade || 0)
			};
		}

		return {
			code: 'N/A',
			name: 'Produto não especificado',
			quantity: 0
		};
	}

	/**
	 * Calcula total de itens na ordem
	 */
	static getTotalItems(order: BlingProductionOrder): number {
		return order.itens?.reduce((total, item) => total + item.quantidade, 0) || 0;
	}
}
