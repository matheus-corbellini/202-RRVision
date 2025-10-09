import { useEffect, useCallback, useRef, useState } from 'react';
import { OAuthService } from '../services/oauthService';
import type { OAuthRefreshRequest } from '../types';
import { useOAuthConfig } from './useOAuthConfig';
import { useClientSecret } from './useClientSecret';

export interface UseTokenRefreshReturn {
    isRefreshing: boolean;
    refreshToken: () => Promise<boolean>;
    startMonitoring: () => void;
    stopMonitoring: () => void;
}

export const useTokenRefresh = (): UseTokenRefreshReturn => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { config } = useOAuthConfig();
    const { clientSecret } = useClientSecret();

    // Função para renovar o token
    const refreshToken = useCallback(async (): Promise<boolean> => {
        if (isRefreshing) {
            console.log('🔄 Refresh já em andamento, aguardando...');
            return false;
        }

        const refreshTokenValue = OAuthService.getRefreshToken();
        if (!refreshTokenValue) {
            console.log('❌ Nenhum refresh token disponível');
            return false;
        }

        if (!clientSecret.trim()) {
            console.log('❌ Client Secret não configurado para refresh');
            return false;
        }

        setIsRefreshing(true);

        try {
            const refreshRequest: OAuthRefreshRequest = {
                clientId: config.clientId,
                clientSecret: clientSecret.trim(),
                refreshToken: refreshTokenValue
            };

            console.log('🔄 Renovando token automaticamente...');
            const newTokens = await OAuthService.refreshAccessToken(refreshRequest);
            
            // Salvar os novos tokens
            OAuthService.saveTokens(newTokens);
            
            console.log('✅ Token renovado automaticamente com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao renovar token automaticamente:', error);
            return false;
        } finally {
            setIsRefreshing(false);
        }
    }, [isRefreshing, config.clientId, clientSecret]);

    // Função para verificar se o token precisa ser renovado
    const checkTokenExpiration = useCallback(() => {
        const tokenInfo = OAuthService.getTokenInfo();
        
        if (!tokenInfo.is_valid && tokenInfo.has_refresh_token) {
            console.log('⏰ Token expirado, iniciando renovação automática...');
            refreshToken();
        }
    }, [refreshToken]);

    // Função para iniciar o monitoramento
    const startMonitoring = useCallback(() => {
        if (monitoringIntervalRef.current) {
            return; // Já está monitorando
        }

        console.log('🔄 Iniciando monitoramento de expiração do token...');
        
        // Verificar a cada 30 segundos
        monitoringIntervalRef.current = setInterval(checkTokenExpiration, 30000);
        
        // Verificar imediatamente
        checkTokenExpiration();
    }, [checkTokenExpiration]);

    // Função para parar o monitoramento
    const stopMonitoring = useCallback(() => {
        if (monitoringIntervalRef.current) {
            console.log('⏹️ Parando monitoramento de expiração do token...');
            clearInterval(monitoringIntervalRef.current);
            monitoringIntervalRef.current = null;
        }
    }, []);

    // Iniciar monitoramento quando o hook é montado
    useEffect(() => {
        startMonitoring();

        // Parar monitoramento quando o componente é desmontado
        return () => {
            stopMonitoring();
        };
    }, [startMonitoring, stopMonitoring]);

    // Parar monitoramento se não há token válido ou refresh token
    useEffect(() => {
        const tokenInfo = OAuthService.getTokenInfo();
        if (!tokenInfo.has_refresh_token) {
            stopMonitoring();
        }
    }, [stopMonitoring]);

    return {
        isRefreshing,
        refreshToken,
        startMonitoring,
        stopMonitoring
    };
};
