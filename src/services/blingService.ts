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

	constructor() {
		this.config = {
			clientId: import.meta.env.VITE_BLING_CLIENT_ID || "",
			clientSecret: import.meta.env.VITE_BLING_CLIENT_SECRET || "",
			baseUrl: import.meta.env.VITE_BLING_BASE_URL || "https://api.bling.com.br/Api/v3",
			accessToken: import.meta.env.VITE_BLING_ACCESS_TOKEN || "",
			redirectUri: import.meta.env.VITE_BLING_REDIRECT_URI || "http://localhost:5173/bling/callback",
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
		const params = new URLSearchParams({
			client_id: this.config.clientId,
			redirect_uri: this.config.redirectUri || "",
			response_type: "code",
			scope: "pedidos:read produtos:read contatos:read",
			state: this.generateState(),
		});

		return `https://bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
	}

	/**
	 * Troca código de autorização por token de acesso
	 */
	async exchangeCodeForToken(code: string): Promise<BlingAuthResponse> {
		try {
			const response = await fetch("https://bling.com.br/Api/v3/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					code: code,
					redirect_uri: this.config.redirectUri || "",
				}),
			});

			if (!response.ok) {
				throw new Error(`Erro ao trocar código por token: ${response.status}`);
			}

			const data: BlingAuthResponse = await response.json();
			this.setTokens(data.access_token, data.refresh_token, data.expires_in);
			return data;
		} catch (error) {
			console.error("Erro ao trocar código por token:", error);
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
			const response = await fetch("https://bling.com.br/Api/v3/oauth/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "refresh_token",
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
					refresh_token: this.refreshToken,
				}),
			});

			if (!response.ok) {
				throw new Error(`Erro ao renovar token: ${response.status}`);
			}

			const data: BlingAuthResponse = await response.json();
			this.setTokens(data.access_token, data.refresh_token, data.expires_in);
			return data;
		} catch (error) {
			console.error("Erro ao renovar token:", error);
			throw error;
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
		if (!this.accessToken) {
			throw new Error("Token de acesso não configurado. Configure o VITE_BLING_ACCESS_TOKEN ou use setAccessToken()");
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
	 * Busca pedidos da API Bling com filtros específicos para produção
	 */
	async getOrders(page: number = 1, limit: number = 50, filters?: {
		dataInicial?: string;
		dataFinal?: string;
		situacao?: string;
		cliente?: string;
	}): Promise<{ data: BlingOrder[]; total: number; page: number }> {
		try {
			const token = await this.getValidToken();

			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (filters?.dataInicial) params.append("dataInicial", filters.dataInicial);
			if (filters?.dataFinal) params.append("dataFinal", filters.dataFinal);
			if (filters?.situacao) params.append("situacao", filters.situacao);
			if (filters?.cliente) params.append("cliente", filters.cliente);

			const response = await fetch(
				`${this.config.baseUrl}/pedidos?${params.toString()}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Erro ao buscar pedidos: ${response.status}`);
			}

			const result = await response.json();
			return {
				data: result.data || [],
				total: result.total || 0,
				page: result.page || page,
			};
		} catch (error) {
			console.error("Erro ao buscar pedidos:", error);
			throw error;
		}
	}

	/**
	 * Busca pedidos específicos para produção (com status específicos)
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
			console.error("Erro ao buscar pedidos de produção:", error);
			throw error;
		}
	}

	/**
	 * Busca um pedido específico por ID
	 */
	async getOrderById(orderId: string): Promise<BlingOrder> {
		try {
			const token = await this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/pedidos/${orderId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error(`Erro ao buscar pedido: ${response.status}`);
			}

			const result = await response.json();
			return result.data;
		} catch (error) {
			console.error("Erro ao buscar pedido:", error);
			throw error;
		}
	}

	/**
	 * Busca produtos da API Bling
	 */
	async getProducts(page: number = 1, limit: number = 50): Promise<any> {
		try {
			const token = this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/produtos?page=${page}&limit=${limit}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

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
	async getCustomers(page: number = 1, limit: number = 50): Promise<any> {
		try {
			const token = this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/contatos?page=${page}&limit=${limit}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

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
		try {
			const token = this.getValidToken();

			const response = await fetch(`${this.config.baseUrl}/contatos?page=1&limit=1`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

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
}

export const blingService = new BlingService();
export default blingService;
