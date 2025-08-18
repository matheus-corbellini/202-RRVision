interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
}

interface BlingAuthResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
}

class BlingService {
	private config: BlingConfig;
	private accessToken: string | null = null;
	private tokenExpiry: number = 0;

	constructor() {
		this.config = {
			clientId: import.meta.env.VITE_BLING_CLIENT_ID || "",
			clientSecret: import.meta.env.VITE_BLING_CLIENT_SECRET || "",
			baseUrl:
				import.meta.env.VITE_BLING_API_BASE_URL ||
				"https://www.bling.com.br/Api/v2",
		};
	}

	/**
	 * Autentica com a API Bling usando Client Credentials
	 */
	async authenticate(): Promise<string> {
		try {
			const response = await fetch(`${this.config.baseUrl}/oauth/token`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					grant_type: "client_credentials",
					client_id: this.config.clientId,
					client_secret: this.config.clientSecret,
				}),
			});

			if (!response.ok) {
				throw new Error(`Erro na autenticação: ${response.status}`);
			}

			const authData: BlingAuthResponse = await response.json();

			this.accessToken = authData.access_token;
			this.tokenExpiry = Date.now() + authData.expires_in * 1000;

			return this.accessToken;
		} catch (error) {
			console.error("Erro na autenticação Bling:", error);
			throw error;
		}
	}

	/**
	 * Verifica se o token ainda é válido
	 */
	private isTokenValid(): boolean {
		return this.accessToken !== null && Date.now() < this.tokenExpiry;
	}

	/**
	 * Obtém um token válido (renova se necessário)
	 */
	private async getValidToken(): Promise<string> {
		if (!this.isTokenValid()) {
			await this.authenticate();
		}
		return this.accessToken!;
	}

	/**
	 * Busca pedidos da API Bling
	 */
	async getOrders(page: number = 1, limit: number = 50): Promise<any> {
		try {
			const token = await this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/pedidos?apikey=${token}&page=${page}&limit=${limit}`,
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
			const token = await this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/produtos?apikey=${token}&page=${page}&limit=${limit}`,
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
			const token = await this.getValidToken();

			const response = await fetch(
				`${this.config.baseUrl}/contatos?apikey=${token}&page=${page}&limit=${limit}`,
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
