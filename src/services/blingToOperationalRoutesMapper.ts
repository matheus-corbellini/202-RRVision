import { blingService } from './blingService';
import type { OperationalRoute } from '../types/operationalRoutes';
import type { BlingOrder } from '../types/blingOrders';

export interface BlingProductionOrder {
	id: string;
	numero: string;
	data: string;
	situacao: string;
	cliente: {
		nome: string;
		email?: string;
		telefone?: string;
	};
	itens: Array<{
		produto: {
			id: string;
			codigo: string;
			nome: string;
			descricao?: string;
		};
		quantidade: number;
		descricao: string;
	}>;
	observacoes?: string;
	dataSaida?: string;
}

export interface BlingToOperationalRouteOptions {
	includeInactive?: boolean;
	defaultSteps?: boolean;
	defaultSetupTime?: number;
	defaultStandardTime?: number;
}

export class BlingToOperationalRoutesMapper {
	/**
	 * Converte ordens de produção do Bling em roteiros operacionais
	 */
	static async convertBlingOrdersToRoutes(
		options: BlingToOperationalRouteOptions = {}
	): Promise<OperationalRoute[]> {
		const {
			includeInactive = false,
			defaultSteps = true,
			defaultSetupTime = 15,
			defaultStandardTime = 30
		} = options;

		try {
			// Buscar ordens de produção do Bling
			const productionOrders = await blingService.getProductionOrders(1, 100);
			
			if (!productionOrders.data || productionOrders.data.length === 0) {
				return [];
			}

			// Converter cada ordem em roteiro operacional
			const routes: OperationalRoute[] = [];
			const processedProducts = new Set<string>();

			for (const order of productionOrders.data) {
				// Processar cada item da ordem
				for (const item of order.itens || []) {
					const productKey = `${item.produto?.codigo || item.produto?.id}`;
					
					// Evitar duplicatas do mesmo produto
					if (processedProducts.has(productKey)) {
						continue;
					}
					processedProducts.add(productKey);

					// Criar roteiro operacional baseado no produto
					const route = this.createOperationalRouteFromBlingOrder(
						order,
						item,
						{
							defaultSteps,
							defaultSetupTime,
							defaultStandardTime
						}
					);

					if (route) {
						routes.push(route);
					}
				}
			}

			return routes;
		} catch (error) {
			console.error('Erro ao converter ordens do Bling em roteiros:', error);
			throw error;
		}
	}

	/**
	 * Cria um roteiro operacional a partir de uma ordem do Bling
	 */
	private static createOperationalRouteFromBlingOrder(
		order: BlingProductionOrder,
		item: BlingProductionOrder['itens'][0],
		options: {
			defaultSteps: boolean;
			defaultSetupTime: number;
			defaultStandardTime: number;
		}
	): OperationalRoute | null {
		if (!item.produto) {
			return null;
		}

		const productCode = item.produto.codigo || `BLING-${item.produto.id}`;
		const productName = item.produto.nome || item.descricao || 'Produto sem nome';
		
		// Determinar status baseado na situação da ordem
		const status = this.mapBlingStatusToRouteStatus(order.situacao);
		
		// Criar passos padrão se solicitado
		const steps = options.defaultSteps ? this.createDefaultSteps(productName) : [];

		// Calcular tempo total padrão
		const totalStandardTime = steps.reduce((total, step) => total + step.standardTime, 0) || options.defaultStandardTime;

		return {
			id: `bling-route-${order.id}-${item.produto.id}`,
			productCode,
			productName,
			productDescription: item.produto.descricao || '',
			status,
			version: '1.0',
			steps,
			setupTime: options.defaultSetupTime,
			totalStandardTime,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			createdBy: 'bling-integration',
			updatedBy: 'bling-integration',
			// Metadados do Bling
			blingOrderId: order.id,
			blingOrderNumber: order.numero,
			blingCustomerName: order.cliente.nome,
			blingOrderDate: order.data,
			blingStatus: order.situacao,
			quantity: item.quantidade,
			observations: order.observacoes || '',
			// Campos opcionais
			isActive: status !== 'inactive',
			primarySectorId: undefined,
			assignedOperatorId: undefined,
			qualityStandards: [],
			requiredTools: [],
			safetyInstructions: [],
			notes: `Roteiro gerado automaticamente a partir da ordem ${order.numero} do Bling`
		};
	}

	/**
	 * Mapeia status do Bling para status de roteiro operacional
	 */
	private static mapBlingStatusToRouteStatus(blingStatus: string): OperationalRoute['status'] {
		const statusMap: Record<string, OperationalRoute['status']> = {
			'em_aberto': 'active',
			'em_producao': 'active',
			'aguardando_producao': 'active',
			'concluido': 'completed',
			'cancelado': 'inactive',
			'pausado': 'inactive',
			'aguardando_materiais': 'inactive'
		};

		return statusMap[blingStatus] || 'active';
	}

	/**
	 * Cria passos padrão para um produto
	 */
	private static createDefaultSteps(productName: string) {
		return [
			{
				id: `step-1-${Date.now()}`,
				name: 'Preparação',
				description: `Preparar materiais e ferramentas para ${productName}`,
				sequence: 1,
				standardTime: 10,
				setupTime: 5,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: 'bling-integration',
				updatedBy: 'bling-integration'
			},
			{
				id: `step-2-${Date.now()}`,
				name: 'Produção',
				description: `Executar processo de produção de ${productName}`,
				sequence: 2,
				standardTime: 20,
				setupTime: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: 'bling-integration',
				updatedBy: 'bling-integration'
			},
			{
				id: `step-3-${Date.now()}`,
				name: 'Finalização',
				description: `Finalizar e embalar ${productName}`,
				sequence: 3,
				standardTime: 10,
				setupTime: 0,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: 'bling-integration',
				updatedBy: 'bling-integration'
			}
		];
	}

	/**
	 * Sincroniza roteiros operacionais com dados do Bling
	 */
	static async syncWithBling(): Promise<{
		success: boolean;
		routes: OperationalRoute[];
		errors: string[];
		message: string;
	}> {
		const errors: string[] = [];
		let routes: OperationalRoute[] = [];

		try {
			// Verificar se há token de acesso do Bling
			const token = localStorage.getItem('bling_access_token');
			if (!token) {
				return {
					success: false,
					routes: [],
					errors: ['Token de acesso do Bling não encontrado'],
					message: 'É necessário autorizar o acesso ao Bling primeiro'
				};
			}

			// Converter ordens do Bling em roteiros
			routes = await this.convertBlingOrdersToRoutes({
				includeInactive: false,
				defaultSteps: true,
				defaultSetupTime: 15,
				defaultStandardTime: 30
			});

			return {
				success: true,
				routes,
				errors,
				message: `Sincronização concluída. ${routes.length} roteiros operacionais criados a partir das ordens do Bling.`
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
			errors.push(errorMessage);
			
			return {
				success: false,
				routes,
				errors,
				message: `Erro na sincronização: ${errorMessage}`
			};
		}
	}
}




