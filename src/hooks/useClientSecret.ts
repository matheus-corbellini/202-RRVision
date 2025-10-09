import { useState, useEffect, useCallback } from 'react';

const CLIENT_SECRET_KEY = 'bling_client_secret';

export const useClientSecret = () => {
    const [clientSecret, setClientSecret] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregar Client Secret salvo
    useEffect(() => {
        const savedSecret = localStorage.getItem(CLIENT_SECRET_KEY);
        if (savedSecret) {
            setClientSecret(savedSecret);
        }
        setIsLoaded(true);
    }, []);

    // Salvar Client Secret
    const saveClientSecret = useCallback((secret: string) => {
        try {
            if (secret.trim()) {
                localStorage.setItem(CLIENT_SECRET_KEY, secret.trim());
                setClientSecret(secret.trim());
            }
        } catch (error) {
            console.error('Erro ao salvar Client Secret:', error);
        }
    }, []);

    // Limpar Client Secret
    const clearClientSecret = useCallback(() => {
        try {
            localStorage.removeItem(CLIENT_SECRET_KEY);
            setClientSecret('');
        } catch (error) {
            console.error('Erro ao limpar Client Secret:', error);
        }
    }, []);

    // Atualizar Client Secret
    const updateClientSecret = useCallback((secret: string) => {
        setClientSecret(secret);
    }, []);

    return {
        clientSecret,
        isLoaded,
        saveClientSecret,
        clearClientSecret,
        updateClientSecret
    };
};
