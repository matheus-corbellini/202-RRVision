import { useState, useCallback } from "react";

interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
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
			if (!config.clientId || !config.clientSecret || !config.baseUrl) {
				return {
					success: false,
					error: "Client ID, Client Secret e URL Base são obrigatórios",
				};
			}

			try {
				setLoading(true);

				// Simular teste de conexão com a API do Bling
				// Em produção, isso faria uma chamada real para a API
				// Por enquanto, simulamos para evitar problemas de CORS
				await new Promise((resolve) => setTimeout(resolve, 1500));

				// Validar se as credenciais têm o formato correto
				if (config.clientId.length < 10 || config.clientSecret.length < 10) {
					return {
						success: false,
						error: "Client ID ou Client Secret muito curtos",
					};
				}

				// Simular teste bem-sucedido para demonstração
				// Em produção, isso faria uma chamada real para a API
				return { success: true };
			} catch (error) {
				return {
					success: false,
					error: "Erro inesperado durante o teste de conexão",
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
			if (!config.clientId || !config.clientSecret) {
				return {
					success: false,
					error: "Client ID e Client Secret são obrigatórios",
				};
			}

			try {
				setLoading(true);

				// Simular importação de ordens
				// Em produção, isso faria chamadas reais para a API do Bling
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Simular dados de exemplo
				const mockOrders: BlingOrder[] = [
					{
						id: "bling-001",
						number: "OP-2024-001",
						customer: "Cliente A",
						product: "Produto X",
						quantity: 100,
						status: "pending",
						createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
						importedAt: new Date().toISOString(),
						importedBy: "Sistema",
					},
					{
						id: "bling-002",
						number: "OP-2024-002",
						customer: "Cliente B",
						product: "Produto Y",
						quantity: 50,
						status: "processing",
						createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
						importedAt: new Date().toISOString(),
						importedBy: "Sistema",
					},
					{
						id: "bling-003",
						number: "OP-2024-003",
						customer: "Cliente C",
						product: "Produto Z",
						quantity: 200,
						status: "completed",
						createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 dias atrás
						importedAt: new Date().toISOString(),
						importedBy: "Sistema",
					},
				];

				return {
					success: true,
					importedCount: mockOrders.length,
					errorCount: 0,
					orders: mockOrders,
				};
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

			if (!config.clientId || config.clientId.trim().length === 0) {
				errors.push("Client ID é obrigatório");
			}

			if (!config.clientSecret || config.clientSecret.trim().length === 0) {
				errors.push("Client Secret é obrigatório");
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
