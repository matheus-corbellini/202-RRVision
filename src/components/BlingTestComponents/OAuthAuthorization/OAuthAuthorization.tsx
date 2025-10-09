import React, { useState } from 'react';
import { FaExternalLinkAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaEdit, FaSave, FaTimes, FaUndo } from 'react-icons/fa';
import { useOAuthConfig } from '../../../hooks/useOAuthConfig';
import { TokenExchange } from '../TokenExchange/TokenExchange';
import './OAuthAuthorization.css';

interface OAuthAuthorizationProps {
    onAuthorizationSuccess?: (code: string) => void;
}

export const OAuthAuthorization: React.FC<OAuthAuthorizationProps> = ({ onAuthorizationSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [, setErrorMessage] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [authorizationCode, setAuthorizationCode] = useState<string | null>(null);

    const {
        config,
        isEditing,
        setIsEditing,
        saveConfig,
        resetConfig,
        updateField,
        validateConfig
    } = useOAuthConfig();

    const handleSaveConfig = () => {
        const errors = validateConfig(config);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }
        
        setValidationErrors([]);
        saveConfig(config);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setValidationErrors([]);
        // Recarregar configuração salva
        window.location.reload();
    };

    const handleResetConfig = () => {
        if (window.confirm('Tem certeza que deseja resetar para a configuração padrão?')) {
            resetConfig();
            setValidationErrors([]);
            setErrorMessage('');
            setStatus('idle');
            setAuthorizationCode(null);
        }
    };

    const handleOAuthRequest = async () => {
        setIsLoading(true);
        setStatus('loading');
        setErrorMessage('');

        try {
            // Construir a URL de autorização
            const authUrl = `https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&state=${config.state}`;
            
            // Abrir janela de popup para OAuth
            const popup = window.open(
                authUrl,
                'bling-oauth',
                'width=600,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
            );

            if (!popup) {
                throw new Error('Não foi possível abrir a janela de autorização. Verifique se o popup está bloqueado.');
            }

            // Escutar mensagens da janela popup
            const messageListener = (event: MessageEvent) => {
                console.log('Mensagem recebida:', event.data, 'Origin:', event.origin);
                
                if (event.origin !== window.location.origin) {
                    console.log('Origin não confere, ignorando mensagem');
                    return;
                }

                if (event.data.type === 'BLING_OAUTH_SUCCESS') {
                    console.log('Sucesso na autorização:', event.data.code);
                    setStatus('success');
                    setIsLoading(false);
                    setAuthorizationCode(event.data.code);
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                    window.removeEventListener('message', messageListener);
                    
                    if (onAuthorizationSuccess) {
                        onAuthorizationSuccess(event.data.code);
                    }
                } else if (event.data.type === 'BLING_TOKEN_SUCCESS') {
                    console.log('Token obtido com sucesso:', event.data.token);
                    // Recarregar a página para atualizar o estado dos tokens
                    window.location.reload();
                } else if (event.data.type === 'BLING_OAUTH_ERROR') {
                    console.log('Erro na autorização:', event.data.error);
                    setStatus('error');
                    setErrorMessage(event.data.error || 'Erro na autorização');
                    setIsLoading(false);
                    if (popup && !popup.closed) {
                        popup.close();
                    }
                    window.removeEventListener('message', messageListener);
                }
            };

            window.addEventListener('message', messageListener);

            // Verificar se a janela foi fechada manualmente
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    console.log('Popup foi fechado');
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageListener);
                    if (status === 'loading') {
                        setStatus('idle');
                        setIsLoading(false);
                        setErrorMessage('Janela de autorização foi fechada');
                    }
                }
            }, 1000);

        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido');
            setIsLoading(false);
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


    return (
        <div className="oauth-authorization">
            <div className="oauth-header">
                <h4>Autenticação OAuth com Bling</h4>
                <p>Inicie o processo de autorização para obter acesso à API do Bling</p>
            </div>

            <div className="oauth-details">
                <div className="oauth-config-header">
                    <h5>Configuração OAuth</h5>
                    <div className="config-actions">
                        {!isEditing ? (
                            <button
                                className="btn btn-edit"
                                onClick={() => setIsEditing(true)}
                                title="Editar configuração"
                            >
                                <FaEdit />
                                Editar
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn btn-save"
                                    onClick={handleSaveConfig}
                                    title="Salvar configuração"
                                >
                                    <FaSave />
                                    Salvar
                                </button>
                                <button
                                    className="btn btn-cancel"
                                    onClick={handleCancelEdit}
                                    title="Cancelar edição"
                                >
                                    <FaTimes />
                                    Cancelar
                                </button>
                            </>
                        )}
                        <button
                            className="btn btn-reset"
                            onClick={handleResetConfig}
                            title="Resetar para configuração padrão"
                        >
                            <FaUndo />
                            Resetar
                        </button>
                    </div>
                </div>

                {validationErrors.length > 0 && (
                    <div className="validation-errors">
                        <strong>⚠️ Erros de validação:</strong>
                        <ul>
                            {validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="oauth-info">
                    <div className="info-item">
                        <strong>Client ID:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                value={config.clientId}
                                onChange={(e) => updateField('clientId', e.target.value)}
                                className="config-input"
                                placeholder="Digite o Client ID"
                            />
                        ) : (
                            <code>{config.clientId}</code>
                        )}
                    </div>
                    <div className="info-item">
                        <strong>Redirect URI:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                value={config.redirectUri}
                                onChange={(e) => updateField('redirectUri', e.target.value)}
                                className="config-input"
                                placeholder="Digite a Redirect URI"
                            />
                        ) : (
                            <code>{config.redirectUri}</code>
                        )}
                    </div>
                    <div className="info-item">
                        <strong>State:</strong>
                        {isEditing ? (
                            <input
                                type="text"
                                value={config.state}
                                onChange={(e) => updateField('state', e.target.value)}
                                className="config-input"
                                placeholder="Digite o State"
                            />
                        ) : (
                            <code>{config.state}</code>
                        )}
                    </div>
                </div>

                <div className="oauth-url">
                    <strong>URL de Autorização:</strong>
                    <div className="url-display">
                        <code>
                            https://bling.com.br/Api/v3/oauth/authorize?response_type=code&client_id={config.clientId}&redirect_uri={encodeURIComponent(config.redirectUri)}&state={config.state}
                        </code>
                    </div>
                </div>
            </div>

            <div className="oauth-actions">
                <button
                    className="btn btn-oauth"
                    onClick={handleOAuthRequest}
                    disabled={isLoading}
                >
                    {getStatusIcon()}
                    <FaExternalLinkAlt />
                    {isLoading ? 'Abrindo Autorização...' : 'Iniciar Autorização OAuth'}
                </button>
            </div>

            <TokenExchange 
                authorizationCode={authorizationCode}
                onTokenExchangeSuccess={() => {
                    console.log('Tokens obtidos com sucesso!');
                    // Opcional: recarregar a página para atualizar o estado dos tokens
                    // window.location.reload();
                }}
            />
        </div>
    );
};
