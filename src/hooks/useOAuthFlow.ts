import { useState, useCallback, useEffect } from 'react';
import { OAuthService } from '../services';
import { useOAuthConfig } from './useOAuthConfig';
import { useTokenRefresh } from './useTokenRefresh';

// Definir tipos localmente para evitar problemas de importação
interface OAuthTokenRequest {
    clientId: string;
    clientSecret: string;
    authorizationCode: string;
    redirectUri: string;
}


export interface UseOAuthFlowReturn {
    isLoading: boolean;
    isExchangingToken: boolean;
    isRefreshing: boolean;
    status: 'idle' | 'loading' | 'success' | 'error';
    errorMessage: string;
    tokenInfo: {
        access_token: string | null;
        token_type: string | null;
        expires_at: string | null;
        scope: string | null;
        is_valid: boolean;
        has_refresh_token: boolean;
    };
    exchangeCodeForTokens: (authorizationCode: string, clientSecret: string) => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearTokens: () => void;
}

export const useOAuthFlow = (): UseOAuthFlowReturn => {
    const [isLoading] = useState(false);
    const [isExchangingToken, setIsExchangingToken] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');
    
    const { config } = useOAuthConfig();
    const { isRefreshing, refreshToken } = useTokenRefresh();

    const exchangeCodeForTokens = useCallback(async (authorizationCode: string, clientSecret: string) => {
        setIsExchangingToken(true);
        setStatus('loading');
        setErrorMessage('');

        try {
            const tokenRequest: OAuthTokenRequest = {
                clientId: config.clientId,
                clientSecret: clientSecret,
                authorizationCode: authorizationCode,
                redirectUri: config.redirectUri
            };

            console.log('Trocando código por token:', {
                clientId: config.clientId,
                redirectUri: config.redirectUri,
                code: authorizationCode.substring(0, 10) + '...' // Log apenas parte do código por segurança
            });

            const tokenResponse = await OAuthService.exchangeCodeForTokens(tokenRequest);
            
            console.log('Tokens recebidos:', {
                token_type: tokenResponse.token_type,
                expires_in: tokenResponse.expires_in,
                has_refresh_token: !!tokenResponse.refresh_token,
                scope: tokenResponse.scope
            });

            // Salvar tokens
            OAuthService.saveTokens(tokenResponse);
            
            setStatus('success');
            setErrorMessage('');

        } catch (error) {
            console.error('Erro ao trocar código por token:', error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Erro desconhecido ao trocar código por token');
        } finally {
            setIsExchangingToken(false);
        }
    }, [config]);

    const clearTokens = useCallback(() => {
        OAuthService.clearTokens();
        setStatus('idle');
        setErrorMessage('');
    }, []);

    // Atualizar tokenInfo quando há mudanças
    const [tokenInfo, setTokenInfo] = useState(() => OAuthService.getTokenInfo());

    useEffect(() => {
        const handleTokenChange = () => {
            setTokenInfo(OAuthService.getTokenInfo());
        };

        // Escutar mudanças nos tokens
        window.addEventListener('blingTokenChanged', handleTokenChange);
        
        return () => {
            window.removeEventListener('blingTokenChanged', handleTokenChange);
        };
    }, []);

    return {
        isLoading,
        isExchangingToken,
        isRefreshing,
        status,
        errorMessage,
        tokenInfo,
        exchangeCodeForTokens,
        refreshToken,
        clearTokens
    };
};
