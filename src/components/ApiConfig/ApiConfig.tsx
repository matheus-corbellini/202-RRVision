import React, { useState, useEffect } from 'react';
import { useApi } from '../../contexts/ApiContext';
import type { ApiConfig } from '../../services/apiAuthService';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaCog, FaCheck, FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import './ApiConfig.css';

export default function ApiConfig() {
  const {
    config,
    setConfig,
    isAuthenticated,
    isLoading,
    error,
    authenticate,
    clearAuth,
    isConnected,
    testConnection,
  } = useApi();

  const [formData, setFormData] = useState<ApiConfig>({
    baseUrl: '',
    authType: 'oauth2',
    clientId: '',
    clientSecret: '',
    apiKey: '',
    tokenEndpoint: '/oauth/token',
    scope: '',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Carrega configuração existente
  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfig(formData);
  };

  const handleTest = async () => {
    if (!formData.baseUrl) {
      setTestResult({
        success: false,
        message: 'URL base é obrigatória',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Configura temporariamente para teste
      setConfig(formData);
      
      // Aguarda um pouco para a configuração ser aplicada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tenta autenticar
      await authenticate();
      
      // Testa conexão
      const connected = await testConnection();
      
      setTestResult({
        success: connected,
        message: connected 
          ? 'Conexão estabelecida com sucesso!' 
          : 'Falha na conexão. Verifique as credenciais.',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    clearAuth();
    setFormData({
      baseUrl: '',
      authType: 'oauth2',
      clientId: '',
      clientSecret: '',
      apiKey: '',
      tokenEndpoint: '/oauth/token',
      scope: '',
    });
    setTestResult(null);
  };

  return (
    <div className="api-config">
      <div className="api-config-header">
        <h2>
          <FaCog className="header-icon" />
          Configuração da API Externa
        </h2>
        <p>Configure a integração com sua API externa</p>
      </div>

      <div className="api-config-content">
        <form onSubmit={handleSubmit} className="api-config-form">
          <div className="form-section">
            <h3>Configurações Básicas</h3>
            
            <div className="form-group">
              <label>URL Base da API *</label>
              <Input
                type="url"
                name="baseUrl"
                value={formData.baseUrl}
                onChange={handleChange}
                placeholder="https://api.exemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Tipo de Autenticação *</label>
              <select
                name="authType"
                value={formData.authType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="oauth2">OAuth2</option>
                <option value="api_key">API Key</option>
              </select>
            </div>
          </div>

          {formData.authType === 'oauth2' && (
            <div className="form-section">
              <h3>Configurações OAuth2</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Client ID *</label>
                  <Input
                    type="text"
                    name="clientId"
                    value={formData.clientId || ''}
                    onChange={handleChange}
                    placeholder="seu_client_id"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Client Secret *</label>
                  <Input
                    type="password"
                    name="clientSecret"
                    value={formData.clientSecret || ''}
                    onChange={handleChange}
                    placeholder="seu_client_secret"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Endpoint do Token</label>
                <Input
                  type="text"
                  name="tokenEndpoint"
                  value={formData.tokenEndpoint || ''}
                  onChange={handleChange}
                  placeholder="/oauth/token"
                />
              </div>

              <div className="form-group">
                <label>Escopo (Opcional)</label>
                <Input
                  type="text"
                  name="scope"
                  value={formData.scope || ''}
                  onChange={handleChange}
                  placeholder="read write"
                />
              </div>
            </div>
          )}

          {formData.authType === 'api_key' && (
            <div className="form-section">
              <h3>Configurações API Key</h3>
              
              <div className="form-group">
                <label>API Key *</label>
                <Input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey || ''}
                  onChange={handleChange}
                  placeholder="sua_api_key"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !formData.baseUrl}
            >
              {isTesting ? (
                <>
                  <FaSpinner className="spinning" />
                  Testando...
                </>
              ) : (
                <>
                  <FaCheck />
                  Testar Conexão
                </>
              )}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="spinning" />
                  Salvando...
                </>
              ) : (
                <>
                  <FaCog />
                  Salvar Configuração
                </>
              )}
            </Button>

            {isAuthenticated && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="clear-btn"
              >
                <FaTimes />
                Limpar
              </Button>
            )}
          </div>
        </form>

        {/* Status da Conexão */}
        <div className="connection-status">
          <h3>Status da Conexão</h3>
          
          <div className="status-indicators">
            <div className={`status-item ${isAuthenticated ? 'success' : 'error'}`}>
              <div className="status-icon">
                {isAuthenticated ? <FaCheck /> : <FaTimes />}
              </div>
              <div className="status-content">
                <div className="status-label">Autenticação</div>
                <div className="status-value">
                  {isAuthenticated ? 'Conectado' : 'Desconectado'}
                </div>
              </div>
            </div>

            <div className={`status-item ${isConnected ? 'success' : 'error'}`}>
              <div className="status-icon">
                {isConnected ? <FaCheck /> : <FaTimes />}
              </div>
              <div className="status-content">
                <div className="status-label">API</div>
                <div className="status-value">
                  {isConnected ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              <div className="test-icon">
                {testResult.success ? <FaCheck /> : <FaTimes />}
              </div>
              <div className="test-message">{testResult.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
