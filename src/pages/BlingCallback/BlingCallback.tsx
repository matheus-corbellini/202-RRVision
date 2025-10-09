import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaPause, FaPlay, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaKey, FaEye, FaEyeSlash, FaSpinner, FaSave, FaTrash } from 'react-icons/fa';
import { OAuthService } from '../../services/oauthService';
import { useOAuthConfig } from '../../hooks/useOAuthConfig';
import { useClientSecret } from '../../hooks/useClientSecret';
import './BlingCallback.css';

export default function BlingCallback() {
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(30);
    const [isPaused, setIsPaused] = useState(false);
    const [isAutoCloseEnabled, setIsAutoCloseEnabled] = useState(true);
    const [messageSent, setMessageSent] = useState(false);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Estados para troca de tokens
    const [showSecret, setShowSecret] = useState(false);
    const [isExchangingToken, setIsExchangingToken] = useState(false);
    const [tokenExchangeStatus, setTokenExchangeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [tokenExchangeError, setTokenExchangeError] = useState('');
    const [tokenInfo, setTokenInfo] = useState<any>(null);

    const { config } = useOAuthConfig();
    const { 
        clientSecret, 
        isLoaded: isClientSecretLoaded, 
        saveClientSecret, 
        clearClientSecret, 
        updateClientSecret 
    } = useClientSecret();

    // Debug log
    console.log('BlingCallback - clientSecret:', clientSecret);
    console.log('BlingCallback - isClientSecretLoaded:', isClientSecretLoaded);

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Aguardar um pouco para garantir que a página carregou completamente
        const timer = setTimeout(() => {
            if (error) {
                // Enviar erro para a janela pai
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'BLING_OAUTH_ERROR',
                        error: error
                    }, window.location.origin);
                    setMessageSent(true);
                }
            } else if (code) {
                // Enviar sucesso para a janela pai
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'BLING_OAUTH_SUCCESS',
                        code: code,
                        state: state
                    }, window.location.origin);
                    setMessageSent(true);
                }
            } else {
                // Enviar erro genérico
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({
                        type: 'BLING_OAUTH_ERROR',
                        error: 'Código de autorização não encontrado'
                    }, window.location.origin);
                    setMessageSent(true);
                }
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [searchParams]);

    useEffect(() => {
        if (isAutoCloseEnabled && !isPaused && countdown > 0) {
            countdownIntervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        if (window.opener && !window.opener.closed) {
                            window.close();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
        }

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [isAutoCloseEnabled, isPaused, countdown]);

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    const handleTogglePause = () => {
        setIsPaused(!isPaused);
    };

    const handleToggleAutoClose = () => {
        setIsAutoCloseEnabled(!isAutoCloseEnabled);
    };

    const handleCloseNow = () => {
        if (window.opener && !window.opener.closed) {
            window.close();
        }
    };

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

    const handleExchangeToken = async () => {
        const code = searchParams.get('code');
        if (!code) {
            setTokenExchangeError('Nenhum código de autorização disponível');
            setTokenExchangeStatus('error');
            return;
        }

        if (!clientSecret.trim()) {
            setTokenExchangeError('Client Secret é obrigatório');
            setTokenExchangeStatus('error');
            return;
        }

        setIsExchangingToken(true);
        setTokenExchangeStatus('loading');
        setTokenExchangeError('');

        try {
            const tokenRequest = {
                clientId: config.clientId,
                clientSecret: clientSecret.trim(),
                authorizationCode: code,
                redirectUri: config.redirectUri
            };

            console.log('Trocando código por token...');
            const tokenResponse = await OAuthService.exchangeCodeForTokens(tokenRequest);
            
            console.log('Token obtido com sucesso:', {
                token_type: tokenResponse.token_type,
                expires_in: tokenResponse.expires_in,
                has_refresh_token: !!tokenResponse.refresh_token
            });

            // Salvar tokens
            OAuthService.saveTokens(tokenResponse);
            
            // Atualizar informações do token
            setTokenInfo(OAuthService.getTokenInfo());
            setTokenExchangeStatus('success');
            setTokenExchangeError('');

            // Notificar a janela pai sobre o sucesso
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
                    type: 'BLING_TOKEN_SUCCESS',
                    token: tokenResponse.access_token,
                    tokenInfo: OAuthService.getTokenInfo()
                }, window.location.origin);
            }

        } catch (error) {
            console.error('Erro ao trocar código por token:', error);
            setTokenExchangeStatus('error');
            setTokenExchangeError(error instanceof Error ? error.message : 'Erro desconhecido');
        } finally {
            setIsExchangingToken(false);
        }
    };

    const getStatusIcon = () => {
        if (code) return <FaCheckCircle className="status-icon success" />;
        if (error) return <FaExclamationTriangle className="status-icon error" />;
        return <FaInfoCircle className="status-icon info" />;
    };

    const getStatusMessage = () => {
        if (code) {
            return isAutoCloseEnabled 
                ? `Autorização concluída com sucesso! Esta janela será fechada automaticamente em ${countdown} segundos.`
                : `Autorização concluída com sucesso! O fechamento automático está desabilitado.`;
        }
        if (error) {
            return `Erro na autorização: ${error}`;
        }
        return 'Processando autorização...';
    };

    return (
        <div className="bling-callback">
            <div className="callback-content">
                <div className="callback-header">
                    <div className="callback-icon">
                        {getStatusIcon()}
                    </div>
                    <h2>
                        {code ? 'Autorização Concluída!' : error ? 'Erro na Autorização' : 'Processando...'}
                    </h2>
                    <p className="status-message">
                        {getStatusMessage()}
                    </p>
                </div>

                {messageSent && (
                    <div className="message-status">
                        <FaCheckCircle className="message-icon" />
                        <span>Mensagem enviada para a aplicação principal</span>
                    </div>
                )}

                <div className="callback-details">
                    {code && (
                        <>
                            <div className="detail-item">
                                <strong>Código de Autorização:</strong>
                                <code>{code}</code>
                            </div>
                            <div className="detail-item">
                                <strong>State:</strong>
                                <code>{state || 'N/A'}</code>
                            </div>
                            <div className="detail-item">
                                <strong>Timestamp:</strong>
                                <span>{new Date().toLocaleString('pt-BR')}</span>
                            </div>
                        </>
                    )}
                    {error && (
                        <div className="detail-item error">
                            <strong>Erro:</strong>
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {code && (
                    <div className="token-exchange-section">
                        <h5>🔄 Trocar Código por Token de Acesso</h5>
                        <div className="expiration-warning">
                            <FaExclamationTriangle className="warning-icon" />
                            <strong>⚠️ Importante:</strong> O código de autorização expira em <strong>1 minuto</strong>!
                        </div>
                        <p>Configure o Client Secret para obter o token de acesso automaticamente:</p>
                        <div className="oauth-info">
                            <strong>📋 Conforme documentação do Bling:</strong> A requisição POST para `/oauth/token` requer o header <code>Authorization: Basic [base64_das_credenciais_do_client_app]</code>, onde as credenciais são <code>ClientID:ClientSecret</code> codificadas em Base64.
                        </div>
                        
                        <div className="client-secret-config">
                            <label htmlFor="client-secret-callback">
                                <FaKey />
                                Client Secret:
                                {isClientSecretLoaded && clientSecret && (
                                    <span className="saved-indicator">
                                        <FaCheckCircle />
                                        Salvo
                                    </span>
                                )}
                            </label>
                            <div className="secret-input-group">
                                <input
                                    id="client-secret-callback"
                                    type={showSecret ? 'text' : 'password'}
                                    value={clientSecret}
                                    onChange={(e) => updateClientSecret(e.target.value)}
                                    placeholder="Digite o Client Secret do Bling"
                                    className="secret-input"
                                />
                                <button
                                    type="button"
                                    className="btn btn-toggle-secret"
                                    onClick={() => setShowSecret(!showSecret)}
                                    title={showSecret ? 'Ocultar secret' : 'Mostrar secret'}
                                >
                                    {showSecret ? <FaEyeSlash /> : <FaEye />}
                                </button>
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

                        {!tokenInfo?.access_token && (
                            <>
                                <div className="token-exchange-actions">
                                    <button
                                        className="btn btn-exchange"
                                        onClick={handleExchangeToken}
                                        disabled={isExchangingToken || !clientSecret.trim()}
                                    >
                                        {isExchangingToken ? (
                                            <>
                                                <FaSpinner className="spinning" />
                                                Trocando Token...
                                            </>
                                        ) : (
                                            <>
                                                <FaKey />
                                                Trocar por Token
                                            </>
                                        )}
                                    </button>
                                </div>

                                {tokenExchangeStatus !== 'idle' && (
                                    <div className={`token-exchange-status ${tokenExchangeStatus}`}>
                                        {tokenExchangeStatus === 'success' && (
                                            <span>✅ Token obtido com sucesso!</span>
                                        )}
                                        {tokenExchangeStatus === 'error' && (
                                            <span>❌ Erro: {tokenExchangeError}</span>
                                        )}
                                        {tokenExchangeStatus === 'loading' && (
                                            <span>⏳ Trocando código por token...</span>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {tokenInfo?.access_token && (
                    <div className="token-success-section">
                        <h5> Token de Acesso Obtido!</h5>
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
                        </div>
                        <div className="token-display">
                            <strong>Access Token:</strong>
                            <div className="token-value">
                                <code>{tokenInfo.access_token}</code>
                            </div>
                        </div>
                    </div>
                )}

                {code && (
                    <div className="countdown-controls">
                        <div className="countdown-display">
                            <div className={`countdown-circle ${isPaused ? 'paused' : ''}`}>
                                <span className="countdown-number">{countdown}</span>
                            </div>
                            <p className="countdown-text">
                                {isPaused 
                                    ? 'Contador pausado' 
                                    : isAutoCloseEnabled 
                                        ? `Fechando em ${countdown} segundo${countdown !== 1 ? 's' : ''}`
                                        : 'Fechamento automático desabilitado'
                                }
                            </p>
                        </div>

                        <div className="control-buttons">
                            <button 
                                className={`btn btn-control ${isPaused ? 'btn-resume' : 'btn-pause'}`}
                                onClick={handleTogglePause}
                                title={isPaused ? 'Retomar contador' : 'Pausar contador'}
                            >
                                {isPaused ? <FaPlay /> : <FaPause />}
                                {isPaused ? 'Retomar' : 'Pausar'}
                            </button>
                            
                            <button 
                                className={`btn btn-control ${isAutoCloseEnabled ? 'btn-disable' : 'btn-enable'}`}
                                onClick={handleToggleAutoClose}
                                title={isAutoCloseEnabled ? 'Desabilitar fechamento automático' : 'Habilitar fechamento automático'}
                            >
                                {isAutoCloseEnabled ? 'Desabilitar Auto' : 'Habilitar Auto'}
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="callback-actions">
                    <button 
                        className="btn btn-close"
                        onClick={handleCloseNow}
                        title="Fechar janela imediatamente"
                    >
                        <FaTimes />
                        Fechar Janela
                    </button>
                </div>
                
                <div className="callback-info">
                    <div className="info-section">
                        <FaInfoCircle className="info-icon" />
                        <div className="info-content">
                            <p><strong>O que aconteceu?</strong></p>
                            <p>
                                {code 
                                    ? 'Você autorizou com sucesso o acesso da aplicação à sua conta do Bling. O código de autorização foi enviado para a aplicação principal.'
                                    : 'Ocorreu um erro durante o processo de autorização. Verifique os detalhes acima.'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="help-section">
                        <p><strong>💡 Dicas:</strong></p>
                        <ul>
                            <li>Use os controles acima para pausar ou desabilitar o fechamento automático</li>
                            <li>Você pode fechar esta janela manualmente a qualquer momento</li>
                            <li>Se a janela não fechar automaticamente, clique em "Fechar Janela"</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}