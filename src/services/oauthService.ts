import type { 
    OAuthTokenResponse, 
    OAuthTokenRequest, 
    OAuthRefreshRequest 
} from '../types/oauth';

// Re-exportar as interfaces para compatibilidade
export type { OAuthTokenResponse, OAuthTokenRequest, OAuthRefreshRequest };

export class OAuthService {
    // Usar proxy do backend para evitar problemas de CORS
    private static readonly TOKEN_ENDPOINT = '/api/bling/oauth/token';

    /**
     * Troca o authorization code pelos tokens de acesso
     */
    static async exchangeCodeForTokens(request: OAuthTokenRequest): Promise<OAuthTokenResponse> {
        const { clientId, clientSecret, authorizationCode, redirectUri } = request;

        try {
            console.log('🔑 Iniciando troca de código por token via proxy:', {
                endpoint: this.TOKEN_ENDPOINT,
                clientId: clientId,
                codeLength: authorizationCode.length
            });

            // Enviar dados como JSON para nosso backend proxy
            const response = await fetch(this.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    clientId,
                    clientSecret,
                    authorizationCode,
                    redirectUri
                })
            });

            if (!response.ok) {
                let errorMessage = `Erro na requisição de token: ${response.status}`;
                
                try {
                    const errorData = await response.json();
                    if (errorData.error_description) {
                        errorMessage = errorData.error_description;
                    } else if (errorData.error) {
                        errorMessage = `Erro ${errorData.error}`;
                    }
                } catch {
                    // Se não conseguir fazer parse do JSON, usar mensagem padrão
                    const errorText = await response.text();
                    errorMessage = `Erro ${response.status}: ${errorText}`;
                }
                
                throw new Error(errorMessage);
            }

            const tokenData = await response.json();
            
            console.log('✅ Token obtido com sucesso:', {
                token_type: tokenData.token_type,
                expires_in: tokenData.expires_in,
                has_refresh_token: !!tokenData.refresh_token,
                scope: tokenData.scope
            });
            
            // Validar se recebemos os dados esperados
            if (!tokenData.access_token) {
                throw new Error('Token de acesso não encontrado na resposta');
            }

            return tokenData as OAuthTokenResponse;

        } catch (error) {
            console.error('Erro ao trocar código por token:', error);
            throw error;
        }
    }

    /**
     * Salva os tokens no localStorage
     */
    static saveTokens(tokens: OAuthTokenResponse): void {
        try {
            localStorage.setItem('bling_access_token', tokens.access_token);
            localStorage.setItem('bling_token_type', tokens.token_type);
            localStorage.setItem('bling_token_expires_in', tokens.expires_in.toString());
            
            if (tokens.refresh_token) {
                localStorage.setItem('bling_refresh_token', tokens.refresh_token);
            }
            
            if (tokens.scope) {
                localStorage.setItem('bling_token_scope', tokens.scope);
            }

            // Calcular data de expiração
            const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));
            localStorage.setItem('bling_token_expires_at', expiresAt.toISOString());

            // Disparar evento customizado para notificar outros componentes
            window.dispatchEvent(new CustomEvent('blingTokenChanged'));
            
        } catch (error) {
            console.error('Erro ao salvar tokens:', error);
            throw error;
        }
    }

    /**
     * Limpa todos os tokens do localStorage
     */
    static clearTokens(): void {
        localStorage.removeItem('bling_access_token');
        localStorage.removeItem('bling_refresh_token');
        localStorage.removeItem('bling_token_type');
        localStorage.removeItem('bling_token_expires_in');
        localStorage.removeItem('bling_token_expires_at');
        localStorage.removeItem('bling_token_scope');
        
        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('blingTokenChanged'));
    }

    /**
     * Verifica se há um token válido
     */
    static hasValidToken(): boolean {
        const token = localStorage.getItem('bling_access_token');
        const expiresAt = localStorage.getItem('bling_token_expires_at');
        
        if (!token || !expiresAt) {
            return false;
        }

        const expirationDate = new Date(expiresAt);
        return expirationDate > new Date();
    }

    /**
     * Obtém o token de acesso atual
     */
    static getAccessToken(): string | null {
        return localStorage.getItem('bling_access_token');
    }

    /**
     * Renova o access token usando o refresh token
     */
    static async refreshAccessToken(request: OAuthRefreshRequest): Promise<OAuthTokenResponse> {
        const { clientId, clientSecret, refreshToken } = request;

        try {
            console.log('🔄 Iniciando refresh do token via proxy:', {
                endpoint: this.TOKEN_ENDPOINT,
                clientId: clientId,
                refreshTokenLength: refreshToken.length
            });

            // Enviar dados como JSON para nosso backend proxy
            const response = await fetch(this.TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    clientId,
                    clientSecret,
                    refreshToken,
                    grantType: 'refresh_token'
                })
            });

            if (!response.ok) {
                let errorMessage = `Erro na requisição de refresh token: ${response.status}`;
                
                try {
                    const errorData = await response.json();
                    if (errorData.error_description) {
                        errorMessage = errorData.error_description;
                    } else if (errorData.error) {
                        errorMessage = `Erro ${errorData.error}`;
                    }
                } catch {
                    const errorText = await response.text();
                    errorMessage = `Erro ${response.status}: ${errorText}`;
                }
                
                throw new Error(errorMessage);
            }

            const tokenData = await response.json();
            
            console.log('✅ Token renovado com sucesso:', {
                token_type: tokenData.token_type,
                expires_in: tokenData.expires_in,
                has_refresh_token: !!tokenData.refresh_token,
                scope: tokenData.scope
            });
            
            if (!tokenData.access_token) {
                throw new Error('Token de acesso não encontrado na resposta do refresh');
            }

            return tokenData as OAuthTokenResponse;

        } catch (error) {
            console.error('Erro ao renovar token:', error);
            throw error;
        }
    }

    /**
     * Obtém o refresh token atual
     */
    static getRefreshToken(): string | null {
        return localStorage.getItem('bling_refresh_token');
    }

    /**
     * Verifica se há um refresh token disponível
     */
    static hasRefreshToken(): boolean {
        return !!localStorage.getItem('bling_refresh_token');
    }

    /**
     * Obtém informações completas do token
     */
    static getTokenInfo(): {
        access_token: string | null;
        token_type: string | null;
        expires_at: string | null;
        scope: string | null;
        is_valid: boolean;
        has_refresh_token: boolean;
    } {
        const access_token = localStorage.getItem('bling_access_token');
        const token_type = localStorage.getItem('bling_token_type');
        const expires_at = localStorage.getItem('bling_token_expires_at');
        const scope = localStorage.getItem('bling_token_scope');
        
        const is_valid = this.hasValidToken();
        const has_refresh_token = this.hasRefreshToken();

        return {
            access_token,
            token_type,
            expires_at,
            scope,
            is_valid,
            has_refresh_token
        };
    }
}
