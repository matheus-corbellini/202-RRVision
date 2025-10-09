import React from 'react';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import type { TestResult } from '../../../hooks/useBlingTest';
import './TestCard.css';

interface TestCardProps {
    title: string;
    icon: string;
    result: TestResult | null;
    onTest: () => void;
    isLoading: boolean;
    testButtonText?: string;
}

export const TestCard: React.FC<TestCardProps> = ({
    title,
    icon,
    result,
    onTest,
    isLoading,
    testButtonText = "Testar"
}) => {
    const getStatusIcon = (result: TestResult | null) => {
        if (!result) return null;
        if (result.success) return <FaCheckCircle className="success-icon" />;
        return <FaExclamationTriangle className="error-icon" />;
    };

    const getStatusClass = (result: TestResult | null) => {
        if (!result) return "pending";
        return result.success ? "success" : "error";
    };

    const getStatusText = (result: TestResult | null) => {
        if (!result) return "⏳ Aguardando teste...";
        
        if (result.success) {
            if (result.count !== undefined) {
                return `✅ ${result.count} ${title.toLowerCase()} encontrados`;
            }
            return `✅ ${title} executado com sucesso!`;
        }
        
        return `❌ Erro: ${result.error}`;
    };

    return (
        <div className="test-card">
            <div className="test-header-card">
                <h3>
                    {icon} {title}
                </h3>
                <button
                    className="btn btn-sm btn-outline"
                    onClick={onTest}
                    disabled={isLoading}
                >
                    {testButtonText}
                </button>
            </div>
            
            <div className={`test-result ${getStatusClass(result)}`}>
                {getStatusIcon(result)}
                <div className="test-info">
                    <span>{getStatusText(result)}</span>
                </div>
            </div>
            
            {result?.data && (
                <div className="test-data">
                    <details>
                        <summary>Ver dados do teste</summary>
                        {title.toLowerCase().includes('produto') && Array.isArray(result.data) ? (
                            <div className="products-preview">
                                <h4>📦 Produtos encontrados ({result.data.length}):</h4>
                                {result.data.slice(0, 5).map((product: any, index: number) => (
                                    <div key={index} className="product-item">
                                        <div className="product-info">
                                            <strong>{product.nome || product.name || 'Nome não informado'}</strong>
                                            {product.codigo && <span className="product-code">Código: {product.codigo}</span>}
                                            {product.preco && <span className="product-price">R$ {product.preco.toFixed(2)}</span>}
                                            {product.situacao && (
                                                <span className={`product-status ${product.situacao === 'A' ? 'active' : 'inactive'}`}>
                                                    {product.situacao === 'A' ? 'Ativo' : 'Inativo'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {result.data.length > 5 && (
                                    <p className="more-products">... e mais {result.data.length - 5} produtos</p>
                                )}
                                <details>
                                    <summary>Ver dados completos (JSON)</summary>
                                    <pre>
                                        {JSON.stringify(result.data.slice(0, 2), null, 2)}
                                    </pre>
                                </details>
                            </div>
                        ) : (
                            <pre>
                                {JSON.stringify(
                                    Array.isArray(result.data) 
                                        ? result.data.slice(0, 2) 
                                        : result.data, 
                                    null, 
                                    2
                                )}
                            </pre>
                        )}
                    </details>
                </div>
            )}
        </div>
    );
};
