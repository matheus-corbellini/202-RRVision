import { useState, useCallback } from "react";
import { blingService } from "../services/blingService";

interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
	accessToken: string; // Token OAuth direto
	autoSync: boolean;
	syncInterval: number;
	lastSync?: string;
	nextSync?: string;
}

interface BlingOrder {
	id: string;
	number: string;
	customer: string;
	product: string;
	quantity: number;
	status: string;
	createdAt: string;
	importedAt?: string;
	importedBy?: string;
}

interface ImportResult {
	success: boolean;
	importedCount?: number;
	errorCount?: number;
	error?: string;
	orders?: BlingOrder[];
}

interface ConnectionResult {
	success: boolean;
	error?: string;
}

interface ImportLog {
	id: string;
	timestamp: string;
	type: "success" | "error" | "warning";
	message: string;
	details?: string;
	ordersCount?: number;
	errorsCount?: number;
}

export const useBling = () => {
	const [loading, setLoading] = useState(false);

	// Testar conexão com a API do Bling
	const testConnection = useCallback(
		async (config: BlingConfig): Promise<ConnectionResult> => {
			if (!config.accessToken) {
				return {
					success: false,
					error: "Access Token é obrigatório",
				};
			}

			try {
				setLoading(true);

				// Configurar o token no serviço
				blingService.setAccessToken(config.accessToken);

				// Testar conexão real com a API do Bling
				const result = await blingService.testConnection();
				return result;
			} catch (error) {
				return {
					success: false,
					error: error instanceof Error ? error.message : "Erro inesperado durante o teste de conexão",
				};
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	// Importar ordens de produção do Bling
	const importOrders = useCallback(
		async (config: BlingConfig): Promise<ImportResult> => {
			if (!config.accessToken) {
				return {
					success: false,
					error: "Access Token é obrigatório",
				};
			}

			try {
				setLoading(true);

				// Configurar o token no serviço
				blingService.setAccessToken(config.accessToken);

				// Sincronizar dados reais do Bling
				const syncResult = await blingService.syncData();

				if (syncResult.success) {
					// Buscar pedidos reais de produção
					const productionOrders = await blingService.getProductionOrders(1, 100);

					// Converter pedidos do Bling para o formato interno
      const convertedOrders: BlingOrder[] = productionOrders.data.map((order) => ({
						id: `bling-${order.id}`,
						number: order.numero,
						customer: order.cliente.nome,
						product: order.itens[0]?.descricao || "Produto não especificado",
						quantity: order.itens.reduce((sum, item) => sum + item.quantidade, 0),
						status: mapBlingStatusToInternal(order.situacao),
						createdAt: order.data,
						importedAt: new Date().toISOString(),
						importedBy: "Sistema",
					}));

					return {
						success: true,
						importedCount: convertedOrders.length,
						errorCount: syncResult.errors.length,
						orders: convertedOrders,
					};
				} else {
					return {
						success: false,
						error: syncResult.message,
					};
				}
			} catch (error) {
				return {
					success: false,
					error:
						error instanceof Error
							? error.message
							: "Erro desconhecido na importação",
				};
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	// Mapear status do Bling para status interno
	const mapBlingStatusToInternal = (blingStatus: string): string => {
		const statusMap: Record<string, string> = {
			"em_aberto": "pending",
			"em_producao": "processing",
			"aguardando_producao": "pending",
			"concluido": "completed",
			"cancelado": "cancelled",
		};
		return statusMap[blingStatus] || "pending";
	};

	// Obter histórico de importações
	const getImportHistory = useCallback(async (): Promise<ImportLog[]> => {
		try {
			// Simular dados de histórico
			// Em produção, isso viria do banco de dados
			const mockHistory: ImportLog[] = [
				{
					id: "log-001",
					timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
					type: "success",
					message: "Importação automática realizada",
					details: "3 ordens importadas com sucesso",
					ordersCount: 3,
					errorsCount: 0,
				},
				{
					id: "log-002",
					timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 horas atrás
					type: "warning",
					message: "Importação com avisos",
					details: "2 ordens importadas, 1 com dados incompletos",
					ordersCount: 2,
					errorsCount: 1,
				},
				{
					id: "log-003",
					timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
					type: "error",
					message: "Falha na importação",
					details: "Erro de conexão com a API do Bling",
					ordersCount: 0,
					errorsCount: 1,
				},
			];

			return mockHistory;
		} catch (error) {
			console.error("Erro ao carregar histórico:", error);
			return [];
		}
	}, []);

	// Obter configuração salva
	const getConfiguration =
		useCallback(async (): Promise<BlingConfig | null> => {
			try {
				// Em produção, isso viria do banco de dados ou localStorage
				const savedConfig = localStorage.getItem("bling-config");
				if (savedConfig) {
					return JSON.parse(savedConfig);
				}
				return null;
			} catch (error) {
				console.error("Erro ao carregar configuração:", error);
				return null;
			}
		}, []);

	// Atualizar configuração
	const updateConfiguration = useCallback(
		async (config: BlingConfig): Promise<void> => {
			try {
				// Em produção, isso salvaria no banco de dados
				localStorage.setItem("bling-config", JSON.stringify(config));

				// Simular delay de salvamento
				await new Promise((resolve) => setTimeout(resolve, 500));
			} catch (error) {
				console.error("Erro ao salvar configuração:", error);
				throw error;
			}
		},
		[]
	);

	// Sincronizar ordens automaticamente
	const syncOrders = useCallback(
		async (config: BlingConfig): Promise<ImportResult> => {
			if (!config.autoSync) {
				return {
					success: false,
					error: "Sincronização automática desabilitada",
				};
			}

			return await importOrders(config);
		},
		[importOrders]
	);

	// Obter estatísticas de sincronização
	const getSyncStats = useCallback(async (): Promise<{
		totalOrders: number;
		lastSync: string | null;
		nextSync: string | null;
		successRate: number;
	}> => {
		try {
			const history = await getImportHistory();
			const totalOrders = history.reduce(
				(sum, log) => sum + (log.ordersCount || 0),
				0
			);
			const successCount = history.filter(
				(log) => log.type === "success"
			).length;
			const successRate =
				history.length > 0 ? (successCount / history.length) * 100 : 0;

			return {
				totalOrders,
				lastSync: history.length > 0 ? history[0].timestamp : null,
				nextSync: null, // Seria calculado baseado no intervalo configurado
				successRate,
			};
		} catch (error) {
			console.error("Erro ao obter estatísticas:", error);
			return {
				totalOrders: 0,
				lastSync: null,
				nextSync: null,
				successRate: 0,
			};
		}
	}, [getImportHistory]);

	// Validar configuração
	const validateConfig = useCallback(
		(
			config: BlingConfig
		): {
			isValid: boolean;
			errors: string[];
		} => {
			const errors: string[] = [];

			if (!config.accessToken || config.accessToken.trim().length === 0) {
				errors.push("Access Token é obrigatório");
			}

			if (!config.baseUrl || config.baseUrl.trim().length === 0) {
				errors.push("URL Base é obrigatória");
			}

			if (
				config.autoSync &&
				(config.syncInterval < 5 || config.syncInterval > 1440)
			) {
				errors.push(
					"Intervalo de sincronização deve estar entre 5 e 1440 minutos"
				);
			}

			return {
				isValid: errors.length === 0,
				errors,
			};
		},
		[]
	);

	return {
		loading,
		testConnection,
		importOrders,
		getImportHistory,
		getConfiguration,
		updateConfiguration,
		syncOrders,
		getSyncStats,
		validateConfig,
	};
};
