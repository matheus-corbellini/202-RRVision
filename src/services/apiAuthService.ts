/**
 * Serviço de autenticação para APIs externas
 * Suporta OAuth2 e API Key
 */

export interface ApiConfig {
  baseUrl: string;
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  authType: 'oauth2' | 'api_key';
  tokenEndpoint?: string; // Para OAuth2
  scope?: string; // Para OAuth2
}

export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  expires_at?: number; // Timestamp de expiração
}

export interface ApiError {
  error: string;
  error_description?: string;
  status: number;
  message: string;
}

class ApiAuthService {
  private config: ApiConfig | null = null;
  private token: TokenData | null = null;
  private refreshPromise: Promise<TokenData> | null = null;

  /**
   * Configura a API
   */
  setConfig(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Obtém token OAuth2
   */
  async getOAuth2Token(): Promise<TokenData> {
    if (!this.config || this.config.authType !== 'oauth2') {
      throw new Error('Configuração OAuth2 não encontrada');
    }

    const { baseUrl, clientId, clientSecret, tokenEndpoint, scope } = this.config;

    if (!clientId || !clientSecret || !tokenEndpoint) {
      throw new Error('Credenciais OAuth2 incompletas');
    }

    const url = `${baseUrl}${tokenEndpoint}`;
    
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', clientId);
    body.append('client_secret', clientSecret);
    
    if (scope) {
      body.append('scope', scope);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          error: errorData.error || 'token_error',
          error_description: errorData.error_description || 'Erro ao obter token',
          status: response.status,
          message: `Erro ${response.status}: ${response.statusText}`,
        });
      }

      const tokenData: TokenData = await response.json();
      
      // Calcular timestamp de expiração
      if (tokenData.expires_in) {
        tokenData.expires_at = Date.now() + (tokenData.expires_in * 1000);
      }

      this.token = tokenData;
      this.saveTokenToStorage();
      
      return tokenData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        error: 'network_error',
        error_description: 'Erro de rede ao obter token',
        status: 0,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  /**
   * Obtém token usando API Key
   */
  async getApiKeyToken(): Promise<TokenData> {
    if (!this.config || this.config.authType !== 'api_key') {
      throw new Error('Configuração API Key não encontrada');
    }

    const { apiKey } = this.config;

    if (!apiKey) {
      throw new Error('API Key não encontrada');
    }

    const tokenData: TokenData = {
      access_token: apiKey,
      token_type: 'Bearer',
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    };

    this.token = tokenData;
    this.saveTokenToStorage();
    
    return tokenData;
  }

  /**
   * Obtém token (OAuth2 ou API Key)
   */
  async getToken(): Promise<TokenData> {
    if (!this.config) {
      throw new Error('Configuração da API não encontrada');
    }

    // Se já tem token válido, retorna
    if (this.token && this.isTokenValid()) {
      return this.token;
    }

    // Se está fazendo refresh, aguarda
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Inicia processo de obtenção de token
    this.refreshPromise = this.config.authType === 'oauth2' 
      ? this.getOAuth2Token() 
      : this.getApiKeyToken();

    try {
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      return token;
    } catch (error) {
      this.refreshPromise = null;
      throw error;
    }
  }

  /**
   * Verifica se o token é válido
   */
  isTokenValid(): boolean {
    if (!this.token) return false;
    
    if (!this.token.expires_at) return true; // Token sem expiração
    
    return Date.now() < this.token.expires_at;
  }

  /**
   * Salva token no localStorage
   */
  private saveTokenToStorage() {
    if (this.token) {
      localStorage.setItem('api_token', JSON.stringify(this.token));
    }
  }

  /**
   * Carrega token do localStorage
   */
  loadTokenFromStorage(): TokenData | null {
    try {
      const stored = localStorage.getItem('api_token');
      if (stored) {
        this.token = JSON.parse(stored);
        return this.isTokenValid() ? this.token : null;
      }
    } catch (error) {
      console.error('Erro ao carregar token do storage:', error);
    }
    return null;
  }

  /**
   * Limpa token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('api_token');
  }

  /**
   * Obtém headers de autorização
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.token) {
      throw new Error('Token não encontrado');
    }

    return {
      'Authorization': `${this.token.token_type} ${this.token.access_token}`,
      'Content-Type': 'application/json',
    };
  }
}

// Instância singleton
export const apiAuthService = new ApiAuthService();

// Classe de erro personalizada
export class ApiError extends Error {
  public error: string;
  public error_description?: string;
  public status: number;

  constructor(data: ApiError) {
    super(data.message);
    this.name = 'ApiError';
    this.error = data.error;
    this.error_description = data.error_description;
    this.status = data.status;
  }
}
