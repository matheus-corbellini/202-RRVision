import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ApiConfig } from '../services/apiAuthService';
import { useApiAuth } from '../hooks/useApiAuth';
import { externalApiService } from '../services/externalApiService';

interface ApiContextType {
  // Configuração
  config: ApiConfig | null;
  setConfig: (config: ApiConfig) => void;
  
  // Autenticação
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authenticate: () => Promise<void>;
  clearAuth: () => void;
  
  // Status da conexão
  isConnected: boolean;
  lastSync: Date | null;
  
  // Métodos de teste
  testConnection: () => Promise<boolean>;
  getApiInfo: () => Promise<any>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const {
    isLoading,
    error,
    isAuthenticated,
    configureApi,
    authenticate,
    clearAuth,
  } = useApiAuth();

  const [config, setConfigState] = useState<ApiConfig | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync] = useState<Date | null>(null);

  // Carrega configuração do localStorage na inicialização
  useEffect(() => {
    const savedConfig = localStorage.getItem('api_config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfigState(parsedConfig);
        configureApi(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configuração da API:', error);
      }
    }
  }, [configureApi]);

  // Salva configuração no localStorage
  const setConfig = (newConfig: ApiConfig) => {
    setConfigState(newConfig);
    configureApi(newConfig);
    localStorage.setItem('api_config', JSON.stringify(newConfig));
    
    // Configura a URL base no serviço
    externalApiService.setBaseUrl(newConfig.baseUrl);
  };

  // Testa conexão com a API
  const testConnection = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await externalApiService.getStats();
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setIsConnected(false);
      return false;
    }
  };

  // Busca informações da API
  const getApiInfo = async () => {
    try {
      const response = await externalApiService.getStats();
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar informações da API:', error);
      throw error;
    }
  };

  // Atualiza status de conexão quando token muda
  useEffect(() => {
    if (isAuthenticated) {
      testConnection();
    } else {
      setIsConnected(false);
    }
  }, [isAuthenticated]);

  const value: ApiContextType = {
    config,
    setConfig,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    clearAuth,
    isConnected,
    lastSync,
    testConnection,
    getApiInfo,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi deve ser usado dentro de um ApiProvider');
  }
  return context;
}
