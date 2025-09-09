import { useState, useEffect, useCallback } from 'react';
import { apiAuthService } from '../services/apiAuthService';
import type { ApiConfig, TokenData } from '../services/apiAuthService';
import { ApiError } from '../services/apiAuthService';

export interface UseApiAuthReturn {
  token: TokenData | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  configureApi: (config: ApiConfig) => void;
  authenticate: () => Promise<void>;
  clearAuth: () => void;
  refreshToken: () => Promise<void>;
}

/**
 * Hook para gerenciar autenticação com APIs externas
 */
export function useApiAuth(): UseApiAuthReturn {
  const [token, setToken] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega token do storage na inicialização
  useEffect(() => {
    const storedToken = apiAuthService.loadTokenFromStorage();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  /**
   * Configura a API
   */
  const configureApi = useCallback((config: ApiConfig) => {
    apiAuthService.setConfig(config);
    setError(null);
  }, []);

  /**
   * Autentica com a API
   */
  const authenticate = useCallback(async () => {
    if (!apiAuthService) {
      setError('API não configurada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newToken = await apiAuthService.getToken();
      setToken(newToken);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erro ao autenticar com a API';
      setError(errorMessage);
      console.error('Erro de autenticação:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Limpa autenticação
   */
  const clearAuth = useCallback(() => {
    apiAuthService.clearToken();
    setToken(null);
    setError(null);
  }, []);

  /**
   * Atualiza token
   */
  const refreshToken = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const newToken = await apiAuthService.getToken();
      setToken(newToken);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Erro ao atualizar token';
      setError(errorMessage);
      console.error('Erro ao atualizar token:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const isAuthenticated = !!token && apiAuthService.isTokenValid();

  return {
    token,
    isLoading,
    error,
    isAuthenticated,
    configureApi,
    authenticate,
    clearAuth,
    refreshToken,
  };
}
