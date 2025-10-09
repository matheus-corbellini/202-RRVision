import React from 'react';
import { useBlingToken } from '../../../hooks/useBlingToken';
import './TokenConfiguration.css';

export const TokenConfiguration: React.FC = () => {
    const { hasToken, token, setDemoToken, setRealToken, clearToken, copyToken } = useBlingToken();

    const handleSetRealToken = () => {
        const newToken = prompt('Cole seu Access Token do Bling:');
        if (newToken) {
            setRealToken(newToken);
        }
    };


    return (
        <div className="token-configuration">
            <div className="token-status">
                <h4>🔧 Configuração de Tokennn</h4>
                <p>Status atual: {hasToken ? 'Token configurado' : 'Sem token'}</p>
            </div>

            <div className="token-actions">
                <button
                    className="btn btn-demo"
                    onClick={setDemoToken}
                    title="Configurar token de demonstração para testes"
                >
                    🧪 Modo Demonstração
                </button>

                <button
                    className="btn btn-real"
                    onClick={handleSetRealToken}
                    title="Configurar token real do Bling"
                >
                    🔑 Configurar Token Real
                </button>

                <button
                    className="btn btn-clear"
                    onClick={clearToken}
                    title="Remover token atual"
                >
                    🗑️ Limpar Token
                </button>
            </div>

            <div className="token-tip">
                <strong>💡 Dica:</strong> Para obter um Access Token do Bling, acesse sua conta → Configurações → API → Gerar novo token
            </div>

            {hasToken && (
                <div className="token-display">
                    <h5>🔑 Token Atual</h5>
                    <div className="token-info">
                        <strong>Status:</strong> ✅ Configurado
                    </div>
                    <div className="token-value">
                        <strong>Token:</strong>
                        <div className="token-text">
                            {token}
                        </div>
                        <button
                            className="btn btn-copy"
                            onClick={copyToken}
                            title="Copiar token para área de transferência"
                        >
                            📋 Copiar Token
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
