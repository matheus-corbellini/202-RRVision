import { useState, useEffect } from "react";
import { blingService } from "../../services/blingService";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaSync } from "react-icons/fa";
import BlingQuickSetup from "../../components/BlingQuickSetup/BlingQuickSetup";
import "./BlingTest.css";

interface TestResult {
    success: boolean;
    data?: any;
    error?: string;
    count?: number;
}

export default function BlingTest() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasToken, setHasToken] = useState(false);
    const [testResults, setTestResults] = useState<{
        connection: TestResult | null;
        orders: TestResult | null;
        products: TestResult | null;
        customers: TestResult | null;
        sync: TestResult | null;
        endpoints: TestResult | null;
        apiStructure: TestResult | null;
        apiBaseUrls: TestResult | null;
    }>({
        connection: null,
        orders: null,
        products: null,
        customers: null,
        sync: null,
        endpoints: null,
        apiStructure: null,
        apiBaseUrls: null
    });

    // Verificar se há token configurado
    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('bling_access_token');
            setHasToken(!!token);
        };

        checkToken();

        // Escutar mudanças no localStorage
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('blingTokenChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blingTokenChanged', handleStorageChange);
        };
    }, []);

    const testConnection = async () => {
        setIsLoading(true);
        try {
            const result = await blingService.testConnection();
            setTestResults(prev => ({
                ...prev,
                connection: {
                    success: result.success,
                    error: result.error
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                connection: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testOrders = async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getOrders(1, 10);
            setTestResults(prev => ({
                ...prev,
                orders: {
                    success: true,
                    data: result.data,
                    count: result.total
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                orders: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testProducts = async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getProducts(1, 10);
            setTestResults(prev => ({
                ...prev,
                products: {
                    success: true,
                    data: result.data,
                    count: result.data?.length || 0
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                products: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testCustomers = async () => {
        setIsLoading(true);
        try {
            const result = await blingService.getCustomers(1, 10);
            setTestResults(prev => ({
                ...prev,
                customers: {
                    success: true,
                    data: result.data,
                    count: result.data?.length || 0
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                customers: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testSync = async () => {
        setIsLoading(true);
        try {
            const result = await blingService.syncData();
            setTestResults(prev => ({
                ...prev,
                sync: {
                    success: result.success,
                    data: result,
                    error: result.errors.length > 0 ? result.errors.join(", ") : undefined
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                sync: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testEndpoints = async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testEndpoints();
            const successfulEndpoints = results.filter(r => r.success);

            setTestResults(prev => ({
                ...prev,
                endpoints: {
                    success: successfulEndpoints.length > 0,
                    data: results,
                    error: successfulEndpoints.length === 0 ? "Nenhum endpoint de vendas encontrado" : undefined
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                endpoints: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testApiStructure = async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testApiStructure();
            const successfulEndpoints = results.filter(r => r.success);

            setTestResults(prev => ({
                ...prev,
                apiStructure: {
                    success: successfulEndpoints.length > 0,
                    data: results,
                    error: successfulEndpoints.length === 0 ? "Nenhum endpoint de estrutura encontrado" : undefined
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                apiStructure: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const testApiBaseUrls = async () => {
        setIsLoading(true);
        try {
            const results = await blingService.testApiBaseUrls();
            const successfulUrls = results.filter(r => r.success);

            setTestResults(prev => ({
                ...prev,
                apiBaseUrls: {
                    success: successfulUrls.length > 0,
                    data: results,
                    error: successfulUrls.length === 0 ? "Nenhuma URL base funcionando" : undefined
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                apiBaseUrls: {
                    success: false,
                    error: error instanceof Error ? error.message : "Erro desconhecido"
                }
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const runAllTests = async () => {
        await testConnection();
        await testApiBaseUrls();
        await testApiStructure();
        await testEndpoints();
        await testOrders();
        await testProducts();
        await testCustomers();
        await testSync();
    };

    const getStatusIcon = (result: TestResult | null) => {
        if (!result) return null;
        if (result.success) return <FaCheckCircle className="success-icon" />;
        return <FaExclamationTriangle className="error-icon" />;
    };

    const getStatusClass = (result: TestResult | null) => {
        if (!result) return "pending";
        return result.success ? "success" : "error";
    };

    return (
        <div className="bling-test-page">
            <div className="test-header">
                <h1>🧪 Teste da Integração Bling</h1>
                <p>Teste todas as funcionalidades da API Bling integrada</p>
            </div>

            {!hasToken && (
                <BlingQuickSetup onTokenConfigured={() => setHasToken(true)} />
            )}

            {/* Configuração de Token */}
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
                <h4>🔧 Configuração de Token</h4>
                <p>Status atual: {hasToken ? 'Token configurado' : 'Sem token'}</p>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={() => {
                            localStorage.setItem('bling_access_token', 'demo-token-' + Date.now());
                            setHasToken(true);
                            window.location.reload();
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🧪 Modo Demonstração
                    </button>

                    <button
                        onClick={() => {
                            const token = prompt('Cole seu Access Token do Bling:');
                            if (token && token.trim()) {
                                localStorage.setItem('bling_access_token', token.trim());
                                setHasToken(true);
                                window.location.reload();
                            }
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🔑 Configurar Token Real
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem('bling_access_token');
                            localStorage.removeItem('bling_refresh_token');
                            localStorage.removeItem('bling_token_expiry');
                            setHasToken(false);
                            window.location.reload();
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        🗑️ Limpar Token
                    </button>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#e9ecef', borderRadius: '4px', fontSize: '0.9rem' }}>
                    <strong>💡 Dica:</strong> Para obter um Access Token do Bling, acesse sua conta → Configurações → API → Gerar novo token
                </div>

                {/* Token Display */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
                    <h5>🔑 Token Atual</h5>
                    <div style={{ marginTop: '0.5rem' }}>
                        <strong>Status:</strong> {hasToken ? '✅ Configurado' : '❌ Não configurado'}
                    </div>
                    {hasToken && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <strong>Token:</strong>
                            <div style={{
                                background: '#f8f9fa',
                                padding: '0.5rem',
                                borderRadius: '4px',
                                marginTop: '0.25rem',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                wordBreak: 'break-all',
                                border: '1px solid #dee2e6'
                            }}>
                                {localStorage.getItem('bling_access_token')}
                            </div>
                            <button
                                onClick={() => {
                                    const token = localStorage.getItem('bling_access_token');
                                    if (token) {
                                        navigator.clipboard.writeText(token);
                                        alert('Token copiado para a área de transferência!');
                                    }
                                }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.25rem 0.5rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                📋 Copiar Token
                            </button>
                        </div>
                    )}
                </div>

                {/* OAuth Configuration */}
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    <h5>🔐 Configuração OAuth (Client ID encontrado!)</h5>
                    <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        <strong>Client ID:</strong> <code>ea0ed893739830a936ff759edda059ba1d09286c</code>
                    </p>
                    <button
                        onClick={() => {
                            const clientId = 'ea0ed893739830a936ff759edda059ba1d09286c';
                            const redirectUri = window.location.origin + '/bling/callback';
                            const authUrl = `https://www.bling.com.br/b/Api/v3/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read`;

                            window.open(authUrl, '_blank', 'width=600,height=600');
                        }}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        🔗 Fazer Autenticação OAuth
                    </button>
                    <p style={{ fontSize: '0.8rem', margin: '0.5rem 0', color: '#6c757d' }}>
                        Isso abrirá uma nova janela para autenticação no Bling
                    </p>
                </div>
            </div>

            <div className="test-controls">
                <button
                    className="btn btn-primary"
                    onClick={runAllTests}
                    disabled={isLoading}
                >
                    {isLoading ? <FaSpinner className="spinning" /> : <FaSync />}
                    {isLoading ? "Testando..." : "Executar Todos os Testes"}
                </button>
            </div>

            <div className="test-results">
                {/* Teste de Conexão */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🔗 Teste de Conexão</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testConnection}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.connection)}`}>
                        {getStatusIcon(testResults.connection)}
                        <div className="test-info">
                            {testResults.connection ? (
                                testResults.connection.success ? (
                                    <span>✅ Conexão estabelecida com sucesso!</span>
                                ) : (
                                    <span>❌ Erro: {testResults.connection.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Teste de URLs Base da API */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🌐 Teste de URLs Base da API</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testApiBaseUrls}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.apiBaseUrls)}`}>
                        {getStatusIcon(testResults.apiBaseUrls)}
                        <div className="test-info">
                            {testResults.apiBaseUrls ? (
                                testResults.apiBaseUrls.success ? (
                                    <span>✅ URLs base da API encontradas!</span>
                                ) : (
                                    <span>❌ Erro: {testResults.apiBaseUrls.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.apiBaseUrls?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver URLs base da API</summary>
                                    <pre>{JSON.stringify(testResults.apiBaseUrls.data, null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Estrutura da API */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🏗️ Teste de Estrutura da API</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testApiStructure}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.apiStructure)}`}>
                        {getStatusIcon(testResults.apiStructure)}
                        <div className="test-info">
                            {testResults.apiStructure ? (
                                testResults.apiStructure.success ? (
                                    <span>✅ Estrutura da API descoberta!</span>
                                ) : (
                                    <span>❌ Erro: {testResults.apiStructure.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.apiStructure?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver estrutura da API</summary>
                                    <pre>{JSON.stringify(testResults.apiStructure.data, null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Endpoints */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🔍 Teste de Endpoints</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testEndpoints}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.endpoints)}`}>
                        {getStatusIcon(testResults.endpoints)}
                        <div className="test-info">
                            {testResults.endpoints ? (
                                testResults.endpoints.success ? (
                                    <span>✅ Endpoints de vendas encontrados!</span>
                                ) : (
                                    <span>❌ Erro: {testResults.endpoints.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.endpoints?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver resultados dos endpoints</summary>
                                    <pre>{JSON.stringify(testResults.endpoints.data, null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Vendas */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>📦 Teste de Vendas</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testOrders}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.orders)}`}>
                        {getStatusIcon(testResults.orders)}
                        <div className="test-info">
                            {testResults.orders ? (
                                testResults.orders.success ? (
                                    <span>✅ {testResults.orders.count} vendas encontradas</span>
                                ) : (
                                    <span>❌ Erro: {testResults.orders.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.orders?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver dados das vendas</summary>
                                    <pre>{JSON.stringify(testResults.orders.data.slice(0, 2), null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Produtos */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🏷️ Teste de Produtos</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testProducts}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.products)}`}>
                        {getStatusIcon(testResults.products)}
                        <div className="test-info">
                            {testResults.products ? (
                                testResults.products.success ? (
                                    <span>✅ {testResults.products.count} produtos encontrados</span>
                                ) : (
                                    <span>❌ Erro: {testResults.products.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.products?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver dados dos produtos</summary>
                                    <pre>{JSON.stringify(testResults.products.data.slice(0, 2), null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Clientes */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>👥 Teste de Clientes</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testCustomers}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.customers)}`}>
                        {getStatusIcon(testResults.customers)}
                        <div className="test-info">
                            {testResults.customers ? (
                                testResults.customers.success ? (
                                    <span>✅ {testResults.customers.count} clientes encontrados</span>
                                ) : (
                                    <span>❌ Erro: {testResults.customers.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.customers?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver dados dos clientes</summary>
                                    <pre>{JSON.stringify(testResults.customers.data.slice(0, 2), null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teste de Sincronização */}
                <div className="test-card">
                    <div className="test-header-card">
                        <h3>🔄 Teste de Sincronização Completa</h3>
                        <button
                            className="btn btn-sm btn-outline"
                            onClick={testSync}
                            disabled={isLoading}
                        >
                            Testar
                        </button>
                    </div>
                    <div className={`test-result ${getStatusClass(testResults.sync)}`}>
                        {getStatusIcon(testResults.sync)}
                        <div className="test-info">
                            {testResults.sync ? (
                                testResults.sync.success ? (
                                    <span>✅ Sincronização concluída com sucesso!</span>
                                ) : (
                                    <span>❌ Erro: {testResults.sync.error}</span>
                                )
                            ) : (
                                <span>⏳ Aguardando teste...</span>
                            )}
                        </div>
                        {testResults.sync?.data && (
                            <div className="test-data">
                                <details>
                                    <summary>Ver resultado da sincronização</summary>
                                    <pre>{JSON.stringify(testResults.sync.data, null, 2)}</pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="test-summary">
                <h3>📊 Resumo dos Testes</h3>
                <div className="summary-stats">
                    <div className="stat">
                        <span className="stat-label">Conexão:</span>
                        <span className={`stat-value ${getStatusClass(testResults.connection)}`}>
                            {testResults.connection ? (testResults.connection.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">URLs Base:</span>
                        <span className={`stat-value ${getStatusClass(testResults.apiBaseUrls)}`}>
                            {testResults.apiBaseUrls ? (testResults.apiBaseUrls.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Estrutura:</span>
                        <span className={`stat-value ${getStatusClass(testResults.apiStructure)}`}>
                            {testResults.apiStructure ? (testResults.apiStructure.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Endpoints:</span>
                        <span className={`stat-value ${getStatusClass(testResults.endpoints)}`}>
                            {testResults.endpoints ? (testResults.endpoints.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Vendas:</span>
                        <span className={`stat-value ${getStatusClass(testResults.orders)}`}>
                            {testResults.orders ? (testResults.orders.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Produtos:</span>
                        <span className={`stat-value ${getStatusClass(testResults.products)}`}>
                            {testResults.products ? (testResults.products.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Clientes:</span>
                        <span className={`stat-value ${getStatusClass(testResults.customers)}`}>
                            {testResults.customers ? (testResults.customers.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                    <div className="stat">
                        <span className="stat-label">Sincronização:</span>
                        <span className={`stat-value ${getStatusClass(testResults.sync)}`}>
                            {testResults.sync ? (testResults.sync.success ? "✅" : "❌") : "⏳"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
