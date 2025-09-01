interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
	accessToken?: string;
}


class BlingService {
	private config: BlingConfig;
	private accessToken: string | null = null;
	private tokenExpiry: number = 0;

	constructor() {
		this.config = {
			clientId: import.meta.env.VITE_BLING_CLIENT_ID || "",
			clientSecret: import.meta.env.VITE_BLING_CLIENT_SECRET || "",
			baseUrl: "https://api.bling.com.br/Api/v3",
			accessToken: import.meta.env.VITE_BLING_ACCESS_TOKEN || "",
		};
		
		if (this.config.accessToken) {
			this.accessToken = this.config.accessToken;
			this.tokenExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000); 
		}
	}

	/**
	 * Define o token de acesso OAuth
	 * Este método deve ser chamado quando o usuário autorizar o aplicativo
	 */
	setAccessToken(token: string): void {
		this.accessToken = token;
		this.tokenExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 ano
	}

	/**
	 * Verifica se o token ainda é válido
	 */
	private isTokenValid(): boolean {
		return this.accessToken !== null && Date.now() < this.tokenExpiry;
	}

	/**
	 * Obtém um token válido
	 */
	private getValidToken(): string {
		if (!this.isTokenValid()) {
			throw new Error("Token de acesso não configurado ou expirado. Configure o VITE_BLING_ACCESS_TOKEN ou use setAccessToken()");
		}
		return this.accessToken!;
	}

	/**
	 * Busca pedidos da API Bling
	 */
	async getOrders(page: number = 1, limit: number = 50): Promise<any> {
		try {
			const token = this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/pedidos?page=${page}&limit=${limit}`,
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

			return await response.json();
		} catch (error) {
			console.error("Erro ao buscar pedidos:", error);
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
	 * Sincroniza dados do Bling
	 */
	async syncData(): Promise<{
		orders: number;
		products: number;
		customers: number;
		success: boolean;
		message: string;
	}> {
		try {
			const [orders, products, customers] = await Promise.all([
				this.getOrders(1, 100),
				this.getProducts(1, 100),
				this.getCustomers(1, 100),
			]);

			return {
				orders: orders.data?.length || 0,
				products: products.data?.length || 0,
				customers: customers.data?.length || 0,
				success: true,
				message: "Sincronização realizada com sucesso",
			};
		} catch (error) {
			console.error("Erro na sincronização:", error);
			return {
				orders: 0,
				products: 0,
				customers: 0,
				success: false,
				message: `Erro na sincronização: ${
					error instanceof Error ? error.message : "Erro desconhecido"
				}`,
			};
		}
	}
}

export const blingService = new BlingService();
export default blingService;
