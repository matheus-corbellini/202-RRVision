import React, { useState } from 'react';
import { FaKey, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaCopy, FaSave, FaTrash, FaSync } from 'react-icons/fa';
import { useOAuthFlow } from '../../../hooks/useOAuthFlow';
import { useClientSecret } from '../../../hooks/useClientSecret';
import './TokenExchange.css';

interface TokenExchangeProps {
    authorizationCode: string | null;
    onTokenExchangeSuccess?: () => void;
}

export const TokenExchange: React.FC<TokenExchangeProps> = ({ 
    authorizationCode, 
    onTokenExchangeSuccess 
}) => {
    const [showSecret, setShowSecret] = useState(false);
    const { 
        isExchangingToken, 
        isRefreshing,
        status, 
        tokenInfo, 
        exchangeCodeForTokens
    } = useOAuthFlow();
    
    const { 
        clientSecret, 
        isLoaded: isClientSecretLoaded, 
        saveClientSecret, 
        clearClientSecret, 
        updateClientSecret 
    } = useClientSecret();

    const handleSaveClientSecret = () => {
        if (clientSecret.trim()) {
            saveClientSecret(clientSecret);
            console.log('Client Secret salvo com sucesso!');
        } else {
            console.log('Nenhum Client Secret para salvar');
        }
    };

    const handleClearClientSecret = () => {
        clearClientSecret();
        console.log('Client Secret limpo com sucesso!');
    };


    const handleExchangeTokens = async () => {
        if (!authorizationCode) {
            alert('Nenhum código de autorização disponível');
            return;
        }

        if (!clientSecret.trim()) {
            alert('Client Secret é obrigatório');
            return;
        }

        await exchangeCodeForTokens(authorizationCode, clientSecret);
        
        if (status === 'success') {
            onTokenExchangeSuccess?.();
        }
    };

    const copyToken = async () => {
        if (tokenInfo.access_token) {
            try {
                await navigator.clipboard.writeText(tokenInfo.access_token);
                alert('Token copiado para a área de transferência!');
            } catch (error) {
                console.error('Erro ao copiar token:', error);
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = tokenInfo.access_token;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Token copiado para a área de transferência!');
            }
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <FaCheckCircle className="status-icon success" />;
            case 'error':
                return <FaExclamationTriangle className="status-icon error" />;
            case 'loading':
                return <FaSpinner className="status-icon loading spinning" />;
            default:
                return null;
        }
    };


    if (!authorizationCode) {
        return null;
    }

    return (
        <div className="token-exchange">

            <div className="token-exchange-content">
                <div className="authorization-code-display">
                    <strong>Código de Autorização:</strong>
                    <div className="code-display">
                        <code>{authorizationCode}</code>
                    </div>
                </div>

                <div className="client-secret-input">
                    <label htmlFor="client-secret">
                        <FaKey />
                        Client Secret:
                        {isClientSecretLoaded && clientSecret && (
                            <span className="saved-indicator">
                                <FaCheckCircle />
                                Salvo
                            </span>
                        )}
                    </label>
                    <div className="secret-input-wrapper">
                        <div className="secret-input-container">
                            <input
                                id="client-secret"
                                type={showSecret ? 'text' : 'password'}
                                value={clientSecret}
                                onChange={(e) => updateClientSecret(e.target.value)}
                                placeholder="Digite o Client Secret do Bling"
                                className="secret-input"
                            />
                            <button
                                type="button"
                                className="secret-toggle-icon"
                                onClick={() => setShowSecret(!showSecret)}
                                title={showSecret ? 'Ocultar secret' : 'Mostrar secret'}
                            >
                                {showSecret ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        <button
                            type="button"
                            className="btn btn-save"
                            onClick={handleSaveClientSecret}
                            title="Salvar Client Secret"
                        >
                            <FaSave />
                            Salvar
                        </button>
                        <button
                            type="button"
                            className="btn btn-clear"
                            onClick={handleClearClientSecret}
                            title="Limpar Client Secret salvo"
                        >
                            <FaTrash />
                            Limpar
                        </button>
                    </div>
                </div>

                <div className="token-exchange-actions">
                    <button
                        className="btn btn-exchange"
                        onClick={handleExchangeTokens}
                        disabled={isExchangingToken || !clientSecret.trim()}
                    >
                        {getStatusIcon()}
                        {isExchangingToken ? 'Trocando Tokens...' : 'Trocar por Tokens'}
                    </button>
                </div>

                {tokenInfo.access_token && (
                    <div className="token-info">
                        <h5>
                            Informações do Token:
                            {isRefreshing && (
                                <span className="refresh-indicator">
                                    <FaSync className="spinning" />
                                    Renovando...
                                </span>
                            )}
                        </h5>
                        <div className="token-details">
                            <div className="token-detail">
                                <strong>Tipo:</strong>
                                <span>{tokenInfo.token_type || 'N/A'}</span>
                            </div>
                            <div className="token-detail">
                                <strong>Válido:</strong>
                                <span className={tokenInfo.is_valid ? 'valid' : 'invalid'}>
                                    {tokenInfo.is_valid ? '✅ Sim' : '❌ Não'}
                                </span>
                            </div>
                            <div className="token-detail">
                                <strong>Expira em:</strong>
                                <span>
                                    {tokenInfo.expires_at 
                                        ? new Date(tokenInfo.expires_at).toLocaleString('pt-BR')
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="token-detail">
                                <strong>Refresh Token:</strong>
                                <span className={tokenInfo.has_refresh_token ? 'valid' : 'invalid'}>
                                    {tokenInfo.has_refresh_token ? '✅ Disponível' : '❌ Não disponível'}
                                </span>
                            </div>
                        </div>

                        <div className="token-display">
                            <strong>Access Token:</strong>
                            <div className="token-value">
                                <input
                                    type="text"
                                    value={tokenInfo.access_token || ''}
                                    readOnly
                                    className="token-input"
                                    placeholder="Token será exibido aqui após a troca"
                                />
                                <button
                                    className="btn btn-copy-token"
                                    onClick={copyToken}
                                    title="Copiar token para área de transferência"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
