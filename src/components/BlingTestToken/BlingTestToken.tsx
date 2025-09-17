import { useState } from 'react';
import { blingService } from '../../services/blingService';
import { FaKey, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './BlingTestToken.css';

interface BlingTestTokenProps {
    onTokenSet?: () => void;
}

export default function BlingTestToken({ onTokenSet }: BlingTestTokenProps) {
    const [token, setToken] = useState('');
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleSetToken = async () => {
        if (!token.trim()) {
            setResult({ success: false, message: 'Digite um token válido' });
            return;
        }

        setTesting(true);
        setResult(null);

        try {
            // Configurar token no serviço
            blingService.setAccessToken(token);
            
            // Testar conexão
            const testResult = await blingService.getOrders(1, 1);
            
            setResult({ 
                success: true, 
                message: `Token configurado com sucesso! Encontrados ${testResult.total} pedidos.` 
            });
            
            onTokenSet?.();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setResult({ 
                success: false, 
                message: `Erro ao configurar token: ${errorMessage}` 
            });
        } finally {
            setTesting(false);
        }
    };

    const handleClearToken = () => {
        localStorage.removeItem('bling_access_token');
        localStorage.removeItem('bling_refresh_token');
        localStorage.removeItem('bling_token_expiry');
        setToken('');
        setResult(null);
        onTokenSet?.();
    };

    return (
        <div className="bling-test-token">
            <div className="test-header">
                <FaKey className="key-icon" />
                <h3>Configurar Token do Bling</h3>
                <p>Configure um Access Token válido do Bling para testar a integração.</p>
            </div>

            <div className="test-form">
                <div className="input-group">
                    <label htmlFor="token-input">Access Token:</label>
                    <input
                        id="token-input"
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Cole seu Access Token do Bling aqui..."
                        disabled={testing}
                    />
                </div>

                <div className="button-group">
                    <button
                        className="btn btn-primary"
                        onClick={handleSetToken}
                        disabled={testing || !token.trim()}
                    >
                        {testing ? 'Testando...' : 'Configurar Token'}
                    </button>
                    
                    <button
                        className="btn btn-outline"
                        onClick={handleClearToken}
                        disabled={testing}
                    >
                        Limpar Token
                    </button>
                </div>
            </div>

            {result && (
                <div className={`test-result ${result.success ? 'success' : 'error'}`}>
                    <div className="result-icon">
                        {result.success ? <FaCheck /> : <FaExclamationTriangle />}
                    </div>
                    <div className="result-message">
                        {result.message}
                    </div>
                </div>
            )}

            <div className="test-info">
                <h4>Como obter um Access Token:</h4>
                <ol>
                    <li>Acesse sua conta do Bling</li>
                    <li>Vá em Configurações → API</li>
                    <li>Gere um novo Access Token</li>
                    <li>Cole o token no campo acima</li>
                </ol>
                
                <div className="warning">
                    <strong>⚠️ Importante:</strong> Este é um token de teste. 
                    Em produção, use OAuth 2.0 para maior segurança.
                </div>
            </div>
        </div>
    );
}
