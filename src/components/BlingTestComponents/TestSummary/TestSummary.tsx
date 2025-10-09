import React from 'react';
import type { TestResults } from '../../../hooks/useBlingTest';
import './TestSummary.css';

interface TestSummaryProps {
    testResults: TestResults;
}

interface TestSummaryItem {
    key: keyof TestResults;
    label: string;
}

const testItems: TestSummaryItem[] = [
    { key: 'connection', label: 'Conexão' },
    { key: 'apiBaseUrls', label: 'URLs Base' },
    { key: 'apiStructure', label: 'Estrutura' },
    { key: 'endpoints', label: 'Endpoints' },
    { key: 'orders', label: 'Vendas' },
    { key: 'products', label: 'Produtos' },
    { key: 'customers', label: 'Clientes' },
    { key: 'productionOrders', label: 'Ordens de Produção' },
    { key: 'sync', label: 'Sincronização' }
];

export const TestSummary: React.FC<TestSummaryProps> = ({ testResults }) => {
    const getStatusClass = (result: any) => {
        if (!result) return "pending";
        return result.success ? "success" : "error";
    };

    const getStatusIcon = (result: any) => {
        if (!result) return "⏳";
        return result.success ? "✅" : "❌";
    };

    const getOverallStatus = () => {
        const results = Object.values(testResults);
        const completedTests = results.filter(result => result !== null);
        
        if (completedTests.length === 0) return "pending";
        
        const successfulTests = completedTests.filter(result => result?.success);
        const successRate = successfulTests.length / completedTests.length;
        
        if (successRate === 1) return "success";
        if (successRate >= 0.5) return "partial";
        return "error";
    };

    const overallStatus = getOverallStatus();
    const totalTests = Object.values(testResults).filter(result => result !== null).length;
    const successfulTests = Object.values(testResults).filter(result => result?.success).length;

    return (
        <div className="test-summary">
            <div className="summary-header">
                <h3>📊 Resumo dos Testes</h3>
                <div className={`overall-status ${overallStatus}`}>
                    {overallStatus === 'success' && '🎉 Todos os testes passaram!'}
                    {overallStatus === 'partial' && '⚠️ Alguns testes falharam'}
                    {overallStatus === 'error' && '❌ Muitos testes falharam'}
                    {overallStatus === 'pending' && '⏳ Aguardando testes...'}
                </div>
            </div>
            
            <div className="summary-stats">
                {testItems.map(({ key, label }) => (
                    <div key={String(key)} className="stat">
                        <span className="stat-label">{label}:</span>
                        <span className={`stat-value ${getStatusClass(testResults[key])}`}>
                            {getStatusIcon(testResults[key])}
                        </span>
                    </div>
                ))}
            </div>
            
            <div className="summary-footer">
                <div className="stat-overview">
                    <span className="stat-label">Total de testes:</span>
                    <span className="stat-value">{totalTests}</span>
                </div>
                <div className="stat-overview">
                    <span className="stat-label">Sucessos:</span>
                    <span className="stat-value success">{successfulTests}</span>
                </div>
                <div className="stat-overview">
                    <span className="stat-label">Taxa de sucesso:</span>
                    <span className={`stat-value ${overallStatus}`}>
                        {totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0}%
                    </span>
                </div>
            </div>
        </div>
    );
};
