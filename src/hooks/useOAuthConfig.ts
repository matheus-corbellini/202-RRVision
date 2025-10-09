import { useState, useEffect, useCallback } from 'react';

export interface OAuthConfig {
    clientId: string;
    redirectUri: string;
    state: string;
}

const DEFAULT_CONFIG: OAuthConfig = {
    clientId: '',
    redirectUri: '',
    state: ''
};

const OAUTH_CONFIG_KEY = 'bling_oauth_config';

export const useOAuthConfig = () => {
    const [config, setConfig] = useState<OAuthConfig>(DEFAULT_CONFIG);
    const [isEditing, setIsEditing] = useState(false);

    // Carregar configuração salva
    useEffect(() => {
        const savedConfig = localStorage.getItem(OAUTH_CONFIG_KEY);
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig);
                setConfig({
                    clientId: parsedConfig.clientId || DEFAULT_CONFIG.clientId,
                    redirectUri: parsedConfig.redirectUri || DEFAULT_CONFIG.redirectUri,
                    state: parsedConfig.state || DEFAULT_CONFIG.state
                });
            } catch (error) {
                console.error('Erro ao carregar configuração OAuth:', error);
            }
        }
    }, []);

    // Salvar configuração
    const saveConfig = useCallback((newConfig: OAuthConfig) => {
        try {
            localStorage.setItem(OAUTH_CONFIG_KEY, JSON.stringify(newConfig));
            setConfig(newConfig);
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar configuração OAuth:', error);
        }
    }, []);

    // Resetar para configuração padrão
    const resetConfig = useCallback(() => {
        localStorage.removeItem(OAUTH_CONFIG_KEY);
        setConfig(DEFAULT_CONFIG);
        setIsEditing(false);
    }, []);

    // Atualizar campo específico
    const updateField = useCallback((field: keyof OAuthConfig, value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Validar configuração
    const validateConfig = useCallback((configToValidate: OAuthConfig): string[] => {
        const errors: string[] = [];

        if (!configToValidate.clientId.trim()) {
            errors.push('Client ID é obrigatório');
        }

        if (!configToValidate.redirectUri.trim()) {
            errors.push('Redirect URI é obrigatório');
        } else if (!configToValidate.redirectUri.startsWith('http')) {
            errors.push('Redirect URI deve ser uma URL válida');
        }

        if (!configToValidate.state.trim()) {
            errors.push('State é obrigatório');
        }

        return errors;
    }, []);

    return {
        config,
        isEditing,
        setIsEditing,
        saveConfig,
        resetConfig,
        updateField,
        validateConfig
    };
};
