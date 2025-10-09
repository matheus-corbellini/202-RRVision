import { useState, useEffect, useCallback } from 'react';

export interface UseBlingTokenReturn {
    hasToken: boolean;
    token: string | null;
    setDemoToken: () => void;
    setRealToken: (token: string) => void;
    clearToken: () => void;
    copyToken: () => Promise<void>;
}

const BLING_ACCESS_TOKEN_KEY = 'bling_access_token';
const BLING_REFRESH_TOKEN_KEY = 'bling_refresh_token';
const BLING_TOKEN_EXPIRY_KEY = 'bling_token_expiry';

export const useBlingToken = (): UseBlingTokenReturn => {
    const [hasToken, setHasToken] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    const checkToken = useCallback(() => {
        const storedToken = localStorage.getItem(BLING_ACCESS_TOKEN_KEY);
        setToken(storedToken);
        setHasToken(!!storedToken);
    }, []);

    useEffect(() => {
        checkToken();

        // Escutar mudanças no localStorage
        const handleStorageChange = () => checkToken();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('blingTokenChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blingTokenChanged', handleStorageChange);
        };
    }, [checkToken]);

    const setDemoToken = useCallback(() => {
        const demoToken = `demo-token-${Date.now()}`;
        localStorage.setItem(BLING_ACCESS_TOKEN_KEY, demoToken);
        setToken(demoToken);
        setHasToken(true);
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('blingTokenChanged'));
    }, []);

    const setRealToken = useCallback((newToken: string) => {
        if (newToken && newToken.trim()) {
            const trimmedToken = newToken.trim();
            localStorage.setItem(BLING_ACCESS_TOKEN_KEY, trimmedToken);
            setToken(trimmedToken);
            setHasToken(true);
            
            // Disparar evento customizado para notificar outros componentes
            window.dispatchEvent(new CustomEvent('blingTokenChanged'));
        }
    }, []);

    const clearToken = useCallback(() => {
        localStorage.removeItem(BLING_ACCESS_TOKEN_KEY);
        localStorage.removeItem(BLING_REFRESH_TOKEN_KEY);
        localStorage.removeItem(BLING_TOKEN_EXPIRY_KEY);
        setToken(null);
        setHasToken(false);
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new CustomEvent('blingTokenChanged'));
    }, []);

    const copyToken = useCallback(async () => {
        if (token) {
            try {
                await navigator.clipboard.writeText(token);
                // Aqui você pode adicionar uma notificação de sucesso
                console.log('Token copiado para a área de transferência!');
            } catch (error) {
                console.error('Erro ao copiar token:', error);
                // Fallback para navegadores mais antigos
                const textArea = document.createElement('textarea');
                textArea.value = token;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
        }
    }, [token]);

    return {
        hasToken,
        token,
        setDemoToken,
        setRealToken,
        clearToken,
        copyToken
    };
};