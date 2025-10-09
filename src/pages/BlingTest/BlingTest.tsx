import { FaSpinner, FaSync } from "react-icons/fa";
import { TokenConfiguration, TestCard, TestSummary, OAuthAuthorization } from "../../components/BlingTestComponents";
import { useBlingTest } from "../../hooks/useBlingTest";
import "./BlingTest.css";

export default function BlingTest() {
    const {
        isLoading,
        testResults,
        testConnection,
        testOrders,
        testProducts,
        testCustomers,
        testProductionOrders,
        testSync,
        testEndpoints,
        testApiStructure,
        testApiBaseUrls,
        runAllTests
    } = useBlingTest();

    return (
        <div className="bling-test-page">
            <div className="test-header">
                <h1>🧪 Bling Test Suite</h1>
                <p>Teste completo da integração com a API do Bling</p>
            </div>

            <OAuthAuthorization />

            <TokenConfiguration />

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
                <TestCard
                    title="Teste de Conexão"
                    icon="🔗"
                    result={testResults.connection}
                    onTest={testConnection}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de URLs Base da API"
                    icon="🌐"
                    result={testResults.apiBaseUrls}
                    onTest={testApiBaseUrls}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Estrutura da API"
                    icon="🏗️"
                    result={testResults.apiStructure}
                    onTest={testApiStructure}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Endpoints"
                    icon="🔍"
                    result={testResults.endpoints}
                    onTest={testEndpoints}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Vendas"
                    icon="📦"
                    result={testResults.orders}
                    onTest={testOrders}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Produtos"
                    icon="🏷️"
                    result={testResults.products}
                    onTest={testProducts}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Clientes"
                    icon="👥"
                    result={testResults.customers}
                    onTest={testCustomers}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Ordens de Produção"
                    icon="🏭"
                    result={testResults.productionOrders}
                    onTest={testProductionOrders}
                    isLoading={isLoading}
                />

                <TestCard
                    title="Teste de Sincronização Completa"
                    icon="🔄"
                    result={testResults.sync}
                    onTest={testSync}
                    isLoading={isLoading}
                />
            </div>

            <TestSummary testResults={testResults} />
        </div>
    );
}
