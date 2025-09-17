import { useState, useEffect } from 'react';

export const useBlingToken = () => {
    const [hasToken, setHasToken] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem('bling_access_token');
            setHasToken(!!storedToken);
            setToken(storedToken);
        };

        // Verificar token inicial
        checkToken();

        // Escutar mudanças no localStorage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'bling_access_token') {
                checkToken();
            }
        };

        // Escutar mudanças customizadas (quando o token é salvo na mesma aba)
        const handleCustomStorageChange = () => {
            checkToken();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('blingTokenChanged', handleCustomStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('blingTokenChanged', handleCustomStorageChange);
        };
    }, []);

    return { hasToken, token };
};
