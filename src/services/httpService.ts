import { apiAuthService, ApiError } from './apiAuthService';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class HttpService {
  private baseUrl: string = '';
  private defaultTimeout: number = 30000; // 30 segundos
  private defaultRetries: number = 3;

  /**
   * Configura a URL base
   */
  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, ''); // Remove barra final
  }

  /**
   * Constrói URL com parâmetros
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return `${url}?${searchParams.toString()}`;
  }

  /**
   * Faz requisição HTTP
   */
  async request<T = any>(
    endpoint: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
    } = config;

    const url = this.buildUrl(endpoint, params);

    // Headers padrão
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Adiciona autenticação se disponível
    try {
      const authHeaders = apiAuthService.getAuthHeaders();
      Object.assign(defaultHeaders, authHeaders);
    } catch (error) {
      // Token não disponível, continua sem autenticação
    }

    // Configuração da requisição
    const requestConfig: RequestInit = {
      method,
      headers: defaultHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    // Adiciona body se necessário
    if (body && method !== 'GET') {
      requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError: Error | null = null;

    // Tenta fazer a requisição com retry
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestConfig);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError({
            error: errorData.error || 'http_error',
            error_description: errorData.message || errorData.error_description,
            status: response.status,
            message: `Erro ${response.status}: ${response.statusText}`,
          });
        }

        const data = await response.json().catch(() => null);

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Se não é o último attempt, aguarda antes de tentar novamente
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Erro desconhecido na requisição');
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * Upload de arquivo
   */
  async upload<T = any>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, string>,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {};
    
    // Adiciona autenticação se disponível
    try {
      const authHeaders = apiAuthService.getAuthHeaders();
      Object.assign(headers, authHeaders);
    } catch (error) {
      // Token não disponível, continua sem autenticação
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        // Remove Content-Type para permitir que o browser defina
      },
    });
  }

  /**
   * Download de arquivo
   */
  async download(endpoint: string, filename?: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<void> {
    const response = await this.request<Blob>(endpoint, {
      ...config,
      method: 'GET',
      headers: {
        ...config?.headers,
        'Accept': 'application/octet-stream',
      },
    });

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Instância singleton
export const httpService = new HttpService();
