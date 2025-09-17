interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
	accessToken?: string;
	redirectUri?: string;
}

interface BlingAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
	scope?: string;
}

interface BlingOrder {
	id: string;
	numero: string;
	data: string;
	dataSaida?: string;
	cliente: {
		nome: string;
		cpf_cnpj?: string;
		email?: string;
		telefone?: string;
	};
	itens: Array<{
		codigo: string;
		descricao: string;
		quantidade: number;
		valor: number;
	}>;
	observacoes?: string;
	situacao: string;
	total: number;
}

class BlingService {
	private config: BlingConfig;
	private accessToken: string | null = null;
	private refreshToken: string | null = null;
	private tokenExpiry: number = 0;
	private processingCodes: Set<string> = new Set();

	constructor() {
		this.config = {
			clientId: import.meta.env.VITE_BLING_CLIENT_ID || "",
			clientSecret: import.meta.env.VITE_BLING_CLIENT_SECRET || "",
			baseUrl: import.meta.env.VITE_BLING_BASE_URL || "/api/bling", // Usar proxy local
			accessToken: import.meta.env.VITE_BLING_ACCESS_TOKEN || "",
			redirectUri: import.meta.env.VITE_BLING_REDIRECT_URI || "",
		};

		if (this.config.accessToken) {
			this.accessToken = this.config.accessToken;
			this.tokenExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000);
		}
	}

	/**
	 * Gera URL de autorização OAuth 2.0
	 */
	getAuthorizationUrl(): string {
		// Validar configuração antes de gerar URL
		if (!this.config.clientId) {
			throw new Error("Client ID não configurado. Configure VITE_BLING_CLIENT_ID no arquivo .env");
		}

		if (!this.config.redirectUri) {
			throw new Error("Redirect URI não configurado. Configure VITE_BLING_REDIRECT_URI no arquivo .env");
		}

		const params = new URLSearchParams({
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri,
			response_type: "code",
			scope: "pedidos:read produtos:read contatos:read",
			state: this.generateState(),
		});

		// Usar a URL que aparece no painel do Bling (formato correto)
		const authUrl = `https://www.bling.com.br/b/Api/v3/oauth/authorize?${params.toString()}`;
		console.log("URL de autorização gerada:", authUrl);
		console.log("Parâmetros da URL:", {
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri,
			response_type: "code",
			scope: "pedidos:read produtos:read contatos:read",
			state: "gerado_automaticamente"
		});
		return authUrl;
	}

	/**
	 * Troca código de autorização por token de acesso
	 */
	async exchangeCodeForToken(code: string): Promise<BlingAuthResponse> {
		try {
			// Verificar se o código já está sendo processado
			if (this.processingCodes.has(code)) {
				throw new Error("Código já está sendo processado");
			}

			// Marcar código como sendo processado
			this.processingCodes.add(code);

			// Validar configuração
			if (!this.config.clientId) {
				this.processingCodes.delete(code);
				throw new Error("Client ID não configurado");
			}
			if (!this.config.clientSecret) {
				this.processingCodes.delete(code);
				throw new Error("Client Secret não configurado");
			}
			if (!this.config.redirectUri) {
				this.processingCodes.delete(code);
				throw new Error("Redirect URI não configurado");
			}

			console.log("Trocando código por token:", {
				code: code.substring(0, 10) + "...",
				clientId: this.config.clientId,
				clientSecret: this.config.clientSecret ? "CONFIGURADO" : "NÃO CONFIGURADO",
				redirectUri: this.config.redirectUri
			});

			// Usar proxy para evitar problemas de CORS
			const proxyUrl = "/api/bling/oauth/token";
			const requestBody = new URLSearchParams({
				grant_type: "authorization_code",
				code: code,
				redirect_uri: this.config.redirectUri,
			});

			// Criar autenticação HTTP Basic com client_id e client_secret
			const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

			const response = await fetch(proxyUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Authorization": `Basic ${credentials}`,
				},
				body: requestBody,
			});

			console.log("Resposta da API:", response.status, response.statusText);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Erro detalhado:", errorText);
				throw new Error(`Erro ao trocar código por token: ${response.status} - ${errorText}`);
			}

			const data: BlingAuthResponse = await response.json();
			console.log("Token recebido com sucesso");
			this.setTokens(data.access_token, data.refresh_token, data.expires_in);

			// Remover código da lista de processamento
			this.processingCodes.delete(code);

			return data;
		} catch (error) {
			console.error("Erro ao trocar código por token:", error);
			// Remover código da lista de processamento em caso de erro
			this.processingCodes.delete(code);
			throw error;
		}
	}

	/**
	 * Renova token de acesso usando refresh token
	 */
	async refreshAccessToken(): Promise<BlingAuthResponse> {
		if (!this.refreshToken) {
			throw new Error("Refresh token não disponível");
		}

		try {
			// Usar proxy para evitar problemas de CORS
			const proxyUrl = "/api/bling/oauth/token";
			const requestBody = new URLSearchParams({
				grant_type: "refresh_token",
				refresh_token: this.refreshToken,
			});

			// Criar autenticação HTTP Basic com client_id e client_secret
			const credentials = btoa(`${this.config.clientId}:${this.config.clientSecret}`);

			const response = await fetch(proxyUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"Authorization": `Basic ${credentials}`,
				},
				body: requestBody,
			});

			if (!response.ok) {
				throw new Error(`Erro ao renovar token: ${response.status}`);
			}

			const data: BlingAuthResponse = await response.json();
			this.setTokens(data.access_token, data.refresh_token, data.expires_in);
			return data;
		} catch (err) {
			console.error("Erro ao renovar token:", err);
			throw err;
		}
	}

	/**
	 * Define tokens de acesso e refresh
	 */
	setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
		this.accessToken = accessToken;
		if (refreshToken) {
			this.refreshToken = refreshToken;
		}
		this.tokenExpiry = Date.now() + (expiresIn ? expiresIn * 1000 : 365 * 24 * 60 * 60 * 1000);

		// Salvar no localStorage para persistência
		localStorage.setItem("bling_access_token", accessToken);
		if (refreshToken) {
			localStorage.setItem("bling_refresh_token", refreshToken);
		}
		localStorage.setItem("bling_token_expiry", this.tokenExpiry.toString());

		// Disparar evento customizado para notificar componentes
		window.dispatchEvent(new CustomEvent('blingTokenChanged'));
	}

	/**
	 * Carrega tokens salvos do localStorage
	 */
	loadSavedTokens(): void {
		const accessToken = localStorage.getItem("bling_access_token");
		const refreshToken = localStorage.getItem("bling_refresh_token");
		const expiry = localStorage.getItem("bling_token_expiry");

		if (accessToken && expiry) {
			this.accessToken = accessToken;
			this.refreshToken = refreshToken;
			this.tokenExpiry = parseInt(expiry);
		}
	}

	/**
	 * Verifica se há um token válido configurado
	 */
	hasValidToken(): boolean {
		const token = this.accessToken || localStorage.getItem("bling_access_token");
		return !!(token && !token.startsWith('demo-token-'));
	}

	/**
	 * Verifica se está em modo demonstração
	 */
	isDemoMode(): boolean {
		const token = this.accessToken || localStorage.getItem("bling_access_token");
		// Se não há token ou é um token demo, usar modo demonstração
		return !token || token.startsWith('demo-token-');
	}

	/**
	 * Define o token de acesso OAuth (método legado)
	 */
	setAccessToken(token: string): void {
		this.setTokens(token);
	}

	/**
	 * Gera estado aleatório para OAuth
	 */
	private generateState(): string {
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}

	/**
	 * Verifica se o token ainda é válido
	 */
	private isTokenValid(): boolean {
		return this.accessToken !== null && Date.now() < this.tokenExpiry;
	}

	/**
	 * Obtém um token válido, renovando automaticamente se necessário
	 */
	private async getValidToken(): Promise<string> {
		// Primeiro tenta carregar tokens salvos
		if (!this.accessToken) {
			this.loadSavedTokens();
		}

		if (!this.accessToken) {
			throw new Error("Token de acesso não configurado. Faça a autenticação OAuth primeiro.");
		}

		// Se o token está próximo do vencimento (5 minutos), tenta renovar
		if (this.tokenExpiry - Date.now() < 5 * 60 * 1000 && this.refreshToken) {
			try {
				await this.refreshAccessToken();
			} catch (error) {
				console.warn("Não foi possível renovar o token:", error);
				// Continua com o token atual mesmo se a renovação falhar
			}
		}

		if (!this.isTokenValid()) {
			throw new Error("Token de acesso expirado e não foi possível renovar. Refaça a autenticação.");
		}

		return this.accessToken!;
	}

	/**
	 * Helper para fazer chamadas da API do Bling
	 */
	private async makeApiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
		// Se estiver em modo demonstração, simular resposta
		if (this.isDemoMode()) {
			return this.simulateApiResponse(endpoint);
		}

		const token = await this.getValidToken();
		const apiUrl = `${this.config.baseUrl}${endpoint}`;
		const headers = {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			...options.headers,
		};

		return fetch(apiUrl, {
			...options,
			headers,
		});
	}

	/**
	 * Simula resposta da API para modo demonstração
	 */
	private simulateApiResponse(endpoint: string): Promise<Response> {
		return new Promise((resolve) => {
			setTimeout(() => {
				const mockData = this.getMockDataForEndpoint(endpoint);
				resolve(new Response(JSON.stringify(mockData), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}));
			}, 500); // Simular latência
		});
	}

	/**
	 * Retorna dados mockados baseados no endpoint
	 */
	private getMockDataForEndpoint(endpoint: string): any {
		if (endpoint.includes('/vendas') || endpoint.includes('/pedidos')) {
			return {
				data: this.getDemoOrders(1, 10).data,
				total: 4,
				page: 1
			};
		}

		if (endpoint.includes('/produtos')) {
			return {
				data: [
					{
						id: "1",
						codigo: "PROD001",
						descricao: "Produto A - Modelo Premium",
						preco: 150.00,
						estoque: 100
					},
					{
						id: "2",
						codigo: "PROD002",
						descricao: "Produto B - Modelo Standard",
						preco: 200.00,
						estoque: 50
					}
				],
				total: 2,
				page: 1
			};
		}

		if (endpoint.includes('/contatos')) {
			return {
				data: [
					{
						id: "1",
						nome: "Empresa ABC Ltda",
						email: "contato@empresaabc.com",
						telefone: "(11) 99999-9999"
					},
					{
						id: "2",
						nome: "Comércio XYZ S.A.",
						email: "vendas@comercioxyz.com",
						telefone: "(11) 88888-8888"
					}
				],
				total: 2,
				page: 1
			};
		}

		// Resposta padrão para outros endpoints
		return {
			data: [],
			total: 0,
			page: 1,
			message: "Endpoint simulado em modo demonstração"
		};
	}

	/**
	 * Busca vendas da API Bling com filtros específicos para produção
	 */
	async getOrders(page: number = 1, limit: number = 50, filters?: {
		dataInicial?: string;
		dataFinal?: string;
		situacao?: string;
		cliente?: string;
	}): Promise<{ data: BlingOrder[]; total: number; page: number }> {
		// Se estiver em modo demonstração, retornar dados simulados
		if (this.isDemoMode()) {
			return this.getDemoOrders(page, limit, filters);
		}

		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (filters?.dataInicial) params.append("dataInicial", filters.dataInicial);
			if (filters?.dataFinal) params.append("dataFinal", filters.dataFinal);
			if (filters?.situacao) params.append("situacao", filters.situacao);
			if (filters?.cliente) params.append("cliente", filters.cliente);

			const response = await this.makeApiCall(`/vendas?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Erro ao buscar vendas: ${response.status}`);
			}

			const result = await response.json();
			return {
				data: result.data || [],
				total: result.total || 0,
				page: result.page || page,
			};
		} catch (error) {
			console.error("Erro ao buscar vendas:", error);
			throw error;
		}
	}

	/**
	 * Retorna dados de demonstração para testes
	 */
	private getDemoOrders(page: number = 1, limit: number = 50, filters?: any): { data: BlingOrder[]; total: number; page: number } {
		const demoOrders: BlingOrder[] = [
			{
				id: "1",
				numero: "V001",
				data: "2024-01-15",
				dataSaida: "2024-01-20",
				cliente: {
					nome: "Empresa ABC Ltda",
					email: "contato@empresaabc.com",
					telefone: "(11) 99999-9999"
				},
				itens: [
					{
						codigo: "PROD001",
						descricao: "Produto A - Modelo Premium",
						quantidade: 100,
						valor: 150.00
					}
				],
				observacoes: "Pedido urgente - cliente VIP",
				situacao: "em_producao",
				total: 15000.00
			},
			{
				id: "2",
				numero: "V002",
				data: "2024-01-16",
				dataSaida: "2024-01-22",
				cliente: {
					nome: "Comércio XYZ S.A.",
					email: "vendas@comercioxyz.com",
					telefone: "(11) 88888-8888"
				},
				itens: [
					{
						codigo: "PROD002",
						descricao: "Produto B - Modelo Standard",
						quantidade: 50,
						valor: 200.00
					}
				],
				observacoes: "",
				situacao: "em_aberto",
				total: 10000.00
			},
			{
				id: "3",
				numero: "V003",
				data: "2024-01-18",
				dataSaida: "2024-01-25",
				cliente: {
					nome: "Indústria DEF Ltda",
					email: "compras@industriadef.com",
					telefone: "(11) 77777-7777"
				},
				itens: [
					{
						codigo: "PROD003",
						descricao: "Produto C - Modelo Industrial",
						quantidade: 200,
						valor: 75.00
					}
				],
				observacoes: "Entrega programada",
				situacao: "aguardando_producao",
				total: 15000.00
			},
			{
				id: "4",
				numero: "V004",
				data: "2024-01-10",
				dataSaida: "2024-01-17",
				cliente: {
					nome: "Distribuidora GHI Ltda",
					email: "pedidos@distribuidoraghi.com",
					telefone: "(11) 66666-6666"
				},
				itens: [
					{
						codigo: "PROD004",
						descricao: "Produto D - Modelo Especial",
						quantidade: 75,
						valor: 300.00
					}
				],
				observacoes: "",
				situacao: "concluido",
				total: 22500.00
			}
		];

		// Simular paginação
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedData = demoOrders.slice(startIndex, endIndex);

		return {
			data: paginatedData,
			total: demoOrders.length,
			page: page,
		};
	}

	/**
	 * Busca vendas específicas para produção (com status específicos)
	 */
	async getProductionOrders(page: number = 1, limit: number = 50): Promise<{ data: BlingOrder[]; total: number }> {
		try {
			// Buscar pedidos com status que indicam produção
			const productionStatuses = ["em_aberto", "em_producao", "aguardando_producao"];
			const allOrders: BlingOrder[] = [];
			let total = 0;

			for (const status of productionStatuses) {
				const result = await this.getOrders(page, limit, { situacao: status });
				allOrders.push(...result.data);
				total += result.total;
			}

			return { data: allOrders, total };
		} catch (error) {
			console.error("Erro ao buscar vendas de produção:", error);
			throw error;
		}
	}

	/**
	 * Busca uma venda específica por ID
	 */
	async getOrderById(orderId: string): Promise<BlingOrder> {
		try {
			const response = await this.makeApiCall(`/vendas/${orderId}`);

			if (!response.ok) {
				throw new Error(`Erro ao buscar venda: ${response.status}`);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			console.error("Erro ao buscar venda:", error);
			throw error;
		}
	}

	/**
	 * Busca produtos da API Bling
	 */
	async getProducts(page: number = 1, limit: number = 50): Promise<{ data: any[]; total: number }> {
		try {
			const response = await this.makeApiCall(`/produtos?page=${page}&limit=${limit}`);

			if (!response.ok) {
				throw new Error(`Erro ao buscar produtos: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Erro ao buscar produtos:", error);
			throw error;
		}
	}

	/**
	 * Busca clientes da API Bling
	 */
	async getCustomers(page: number = 1, limit: number = 50): Promise<{ data: any[]; total: number }> {
		try {
			const response = await this.makeApiCall(`/contatos?page=${page}&limit=${limit}`);

			if (!response.ok) {
				throw new Error(`Erro ao buscar clientes: ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Erro ao buscar clientes:", error);
			throw error;
		}
	}

	/**
	 * Testa a conexão com a API Bling
	 */
	async testConnection(): Promise<{ success: boolean; error?: string }> {
		// Se estiver em modo demonstração, simular sucesso
		if (this.isDemoMode()) {
			return { success: true };
		}

		try {
			const response = await this.makeApiCall(`/contatos?page=1&limit=1`);

			if (response.ok) {
				return { success: true };
			} else {
				return {
					success: false,
					error: `Erro ${response.status}: ${response.statusText}`
				};
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Erro desconhecido"
			};
		}
	}

	/**
	 * Testa diferentes endpoints para descobrir qual funciona para vendas/pedidos
	 */
	async testEndpoints(): Promise<{ endpoint: string; status: number; success: boolean }[]> {
		const endpoints = [
			'/vendas',
			'/pedidos',
			'/vendas/pedidos',
			'/pedidos/vendas',
			'/orders',
			'/sales',
			'/vendas?page=1&limit=1',
			'/pedidos?page=1&limit=1',
			'/notas-fiscais',
			'/notas',
			'/nfe',
			'/vendas/notas',
			'/pedidos/notas',
			'/vendas/lista',
			'/pedidos/lista',
			'/vendas/list',
			'/pedidos/list',
			'/vendas/all',
			'/pedidos/all'
		];

		const results = [];

		for (const endpoint of endpoints) {
			try {
				const response = await this.makeApiCall(endpoint);
				results.push({
					endpoint,
					status: response.status,
					success: response.ok
				});
			} catch (error) {
				results.push({
					endpoint,
					status: 0,
					success: false
				});
			}
		}

		return results;
	}

	/**
	 * Testa endpoints de listagem geral para entender a estrutura da API
	 */
	async testApiStructure(): Promise<{ endpoint: string; status: number; success: boolean; data?: any }[]> {
		const endpoints = [
			'/',  // Root endpoint
			'/api',
			'/v3',
			'/v3/',
			'/v3/endpoints',
			'/v3/resources',
			'/v3/help',
			'/v3/docs',
			'/v3/status',
			'/v3/info',
			'/v2',  // Testar se v2 ainda funciona
			'/v2/',
			'/v2/pedidos',  // Testar endpoint v2
			'/v2/vendas',   // Testar endpoint v2
			'/v3/pedidos',  // Testar endpoint v3
			'/v3/vendas'    // Testar endpoint v3
		];

		const results = [];

		for (const endpoint of endpoints) {
			try {
				const response = await this.makeApiCall(endpoint);
				let data = null;

				if (response.ok) {
					try {
						data = await response.json();
					} catch (e) {
						// Se não conseguir fazer parse do JSON, continua
					}
				}

				results.push({
					endpoint,
					status: response.status,
					success: response.ok,
					data: data
				});
			} catch (error) {
				results.push({
					endpoint,
					status: 0,
					success: false
				});
			}
		}

		return results;
	}

	/**
	 * Testa diferentes URLs base da API para descobrir a correta
	 */
	async testApiBaseUrls(): Promise<{ baseUrl: string; status: number; success: boolean; data?: any }[]> {
		// Se estiver em modo demonstração, simular sucesso
		if (this.isDemoMode()) {
			return [
				{
					baseUrl: '/api/bling (proxy local)',
					status: 200,
					success: true,
					data: { message: 'Modo demonstração ativo - usando proxy local' }
				}
			];
		}

		// Para tokens reais, testar apenas o proxy local
		const results = [];

		try {
			const response = await this.makeApiCall('/produtos?page=1&limit=1');
			let data = null;

			if (response.ok) {
				try {
					data = await response.json();
				} catch (e) {
					data = { message: 'Resposta não é JSON válido' };
				}
			}

			results.push({
				baseUrl: '/api/bling (proxy local)',
				status: response.status,
				success: response.ok,
				data
			});
		} catch (error) {
			results.push({
				baseUrl: '/api/bling (proxy local)',
				status: 0,
				success: false,
				data: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
			});
		}

		return results;
	}

	/**
	 * Sincroniza dados do Bling com tratamento robusto de erros
	 */
	async syncData(): Promise<{
		orders: number;
		products: number;
		customers: number;
		success: boolean;
		message: string;
		errors: string[];
		lastSync: string;
	}> {
		const errors: string[] = [];
		let ordersCount = 0;
		let productsCount = 0;
		let customersCount = 0;

		try {
			// Carregar tokens salvos antes de sincronizar
			this.loadSavedTokens();

			// Sincronizar pedidos de produção
			try {
				const ordersResult = await this.getProductionOrders(1, 100);
				ordersCount = ordersResult.total;
			} catch (error) {
				errors.push(`Erro ao sincronizar pedidos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
			}

			// Sincronizar produtos
			try {
				const productsResult = await this.getProducts(1, 100);
				productsCount = productsResult.data?.length || 0;
			} catch (error) {
				errors.push(`Erro ao sincronizar produtos: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
			}

			// Sincronizar clientes
			try {
				const customersResult = await this.getCustomers(1, 100);
				customersCount = customersResult.data?.length || 0;
			} catch (error) {
				errors.push(`Erro ao sincronizar clientes: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
			}

			const success = errors.length === 0 || (ordersCount > 0 || productsCount > 0 || customersCount > 0);
			const message = success
				? `Sincronização concluída: ${ordersCount} pedidos, ${productsCount} produtos, ${customersCount} clientes`
				: "Falha na sincronização de todos os dados";

			return {
				orders: ordersCount,
				products: productsCount,
				customers: customersCount,
				success,
				message,
				errors,
				lastSync: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Erro geral na sincronização:", error);
			return {
				orders: 0,
				products: 0,
				customers: 0,
				success: false,
				message: `Erro geral na sincronização: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
				errors: [error instanceof Error ? error.message : "Erro desconhecido"],
				lastSync: new Date().toISOString(),
			};
		}
	}

	/**
	 * Inicializa o serviço carregando tokens salvos
	 */
	initialize(): void {
		this.loadSavedTokens();
	}

	/**
	 * Verifica a configuração atual do serviço
	 */
	getConfigurationStatus(): {
		clientId: boolean;
		clientSecret: boolean;
		redirectUri: boolean;
		baseUrl: string;
		authUrl: string | null;
		errors: string[];
	} {
		const errors: string[] = [];

		const clientId = !!this.config.clientId;
		const clientSecret = !!this.config.clientSecret;
		const redirectUri = !!this.config.redirectUri;

		if (!clientId) errors.push("Client ID não configurado");
		if (!clientSecret) errors.push("Client Secret não configurado");
		if (!redirectUri) errors.push("Redirect URI não configurado");

		let authUrl: string | null = null;
		try {
			if (clientId && redirectUri) {
				authUrl = this.getAuthorizationUrl();
			}
		} catch (error) {
			errors.push(`Erro ao gerar URL de autorização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
		}

		return {
			clientId,
			clientSecret,
			redirectUri,
			baseUrl: this.config.baseUrl,
			authUrl,
			errors
		};
	}

	/**
	 * Testa a URL de autorização e fornece instruções de configuração
	 */
	testAuthorizationSetup(): {
		authUrl: string;
		instructions: string[];
		checklist: string[];
		debugInfo: any;
	} {
		const authUrl = this.getAuthorizationUrl();

		const instructions = [
			"1. Acesse: https://www.bling.com.br/central.extensoes.php",
			"2. Vá para 'Minhas instalações' → 'Gestão de estoques'",
			"3. Clique nos 3 pontos da 'API Borderless'",
			"4. Configure a URL de callback: http://localhost:5173/bling/callback",
			"5. Habilite as permissões: Pedidos, Produtos, Contatos",
			"6. Salve as configurações"
		];

		const checklist = [
			"✅ Client ID configurado",
			"✅ Client Secret configurado",
			"✅ Redirect URI configurado",
			"❓ Aplicação registrada no Bling",
			"❓ URL de callback configurada no Bling",
			"❓ Permissões OAuth habilitadas no Bling"
		];

		const debugInfo = {
			config: {
				clientId: this.config.clientId ? `${this.config.clientId.substring(0, 10)}...` : "NÃO CONFIGURADO",
				clientSecret: this.config.clientSecret ? "CONFIGURADO" : "NÃO CONFIGURADO",
				redirectUri: this.config.redirectUri,
				baseUrl: this.config.baseUrl
			},
			authUrl: authUrl,
			expectedCallback: "http://localhost:5173/bling/callback"
		};

		return {
			authUrl,
			instructions,
			checklist,
			debugInfo
		};
	}

	/**
	 * Valida se a aplicação está configurada corretamente no Bling
	 */
	async validateBlingApp(): Promise<{
		isValid: boolean;
		errors: string[];
		suggestions: string[];
	}> {
		const errors: string[] = [];
		const suggestions: string[] = [];

		// Verificar configuração local
		if (!this.config.clientId) {
			errors.push("Client ID não configurado no .env");
		}

		if (!this.config.clientSecret) {
			errors.push("Client Secret não configurado no .env");
		}

		if (!this.config.redirectUri) {
			errors.push("Redirect URI não configurado no .env");
		}

		// Verificar se a URL de autorização é válida
		try {
			const authUrl = this.getAuthorizationUrl();
			const url = new URL(authUrl);

			if (!url.searchParams.get('client_id')) {
				errors.push("Client ID não está sendo incluído na URL de autorização");
			}

			if (!url.searchParams.get('redirect_uri')) {
				errors.push("Redirect URI não está sendo incluído na URL de autorização");
			}

			if (!url.searchParams.get('response_type')) {
				errors.push("Response type não está sendo incluído na URL de autorização");
			}

		} catch (error) {
			errors.push(`Erro ao gerar URL de autorização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
		}

		// Sugestões baseadas nos erros
		if (errors.length === 0) {
			suggestions.push("Configuração local parece estar correta");
			suggestions.push("Verifique se a aplicação está registrada no painel do Bling");
			suggestions.push("Teste a URL de autorização manualmente no navegador");
		} else {
			suggestions.push("Corrija os erros de configuração primeiro");
			suggestions.push("Verifique o arquivo .env");
		}

		return {
			isValid: errors.length === 0,
			errors,
			suggestions
		};
	}

	/**
	 * Testa se a aplicação está registrada corretamente no Bling
	 */
	async testAppRegistration(): Promise<{
		isRegistered: boolean;
		message: string;
		testUrl: string;
		instructions: string[];
	}> {
		const authUrl = this.getAuthorizationUrl();

		// Testar se a URL de autorização é válida
		try {
			const response = await fetch(authUrl, { method: 'HEAD' });

			if (response.ok) {
				return {
					isRegistered: true,
					message: "✅ Aplicação parece estar registrada corretamente",
					testUrl: authUrl,
					instructions: [
						"1. Cole a URL de teste no navegador",
						"2. Faça login no Bling se necessário",
						"3. Autorize a aplicação",
						"4. Verifique se é redirecionado para o callback"
					]
				};
			} else {
				return {
					isRegistered: false,
					message: "❌ Aplicação não encontrada ou não registrada",
					testUrl: authUrl,
					instructions: [
						"1. Verifique se a aplicação está ativa no painel do Bling",
						"2. Confirme se o Client ID está correto",
						"3. Verifique se as permissões estão habilitadas",
						"4. Entre em contato com o suporte do Bling se necessário"
					]
				};
			}
		} catch (error) {
			return {
				isRegistered: false,
				message: `❌ Erro ao testar aplicação: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
				testUrl: authUrl,
				instructions: [
					"1. Verifique sua conexão com a internet",
					"2. Teste a URL manualmente no navegador",
					"3. Verifique se o Bling está funcionando"
				]
			};
		}
	}

	/**
	 * Gera URL de autorização para teste manual
	 */
	getManualTestUrl(): string {
		const params = new URLSearchParams({
			response_type: "code",
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri || "http://localhost:5173/bling/callback",
			scope: "pedidos:read produtos:read contatos:read",
			state: `fresh_${Date.now()}` // Usar timestamp para garantir unicidade
		});

		return `https://www.bling.com.br/b/Api/v3/oauth/authorize?${params.toString()}`;
	}

	/**
	 * Testa se a aplicação está funcionando corretamente
	 */
	async testAppFunctionality(): Promise<{
		status: string;
		message: string;
		manualTestUrl: string;
		nextSteps: string[];
		configStatus: any;
	}> {
		const manualTestUrl = this.getManualTestUrl();

		// Verificar se todas as configurações estão presentes
		const hasClientId = !!this.config.clientId;
		const hasClientSecret = !!this.config.clientSecret;
		const hasRedirectUri = !!this.config.redirectUri;

		const configStatus = {
			clientId: hasClientId ? `${this.config.clientId.substring(0, 10)}...` : "NÃO CONFIGURADO",
			clientSecret: hasClientSecret ? "CONFIGURADO" : "NÃO CONFIGURADO",
			redirectUri: this.config.redirectUri || "NÃO CONFIGURADO",
			baseUrl: this.config.baseUrl
		};

		if (!hasClientId || !hasClientSecret || !hasRedirectUri) {
			return {
				status: "error",
				message: "❌ Configuração incompleta",
				manualTestUrl,
				configStatus,
				nextSteps: [
					"1. Verifique se todas as variáveis estão no .env",
					"2. Reinicie o servidor após alterar o .env",
					"3. Confirme se o Client ID e Secret estão corretos"
				]
			};
		}

		return {
			status: "ready",
			message: "✅ Configuração parece estar correta",
			manualTestUrl,
			configStatus,
			nextSteps: [
				"1. Cole a URL de teste no navegador",
				"2. Faça login no Bling se necessário",
				"3. Autorize a aplicação IMEDIATAMENTE",
				"4. Verifique se é redirecionado com código",
				"5. ⚠️ IMPORTANTE: Use o código imediatamente após receber"
			]
		};
	}

	/**
	 * Gera uma URL de autorização fresca com timestamp único
	 */
	getFreshAuthorizationUrl(): string {
		const params = new URLSearchParams({
			response_type: "code",
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri || "http://localhost:5173/bling/callback",
			scope: "pedidos:read produtos:read contatos:read",
			state: `fresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
		});

		return `https://www.bling.com.br/b/Api/v3/oauth/authorize?${params.toString()}`;
	}
}

export const blingService = new BlingService();

// Disponibilizar no window para debug no console
if (typeof window !== 'undefined') {
	(window as any).blingService = blingService;
}

export default blingService;
