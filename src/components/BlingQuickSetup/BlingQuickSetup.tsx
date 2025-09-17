import { useState } from 'react';
import { blingService } from '../../services/blingService';
import { FaKey, FaCheck, FaExclamationTriangle, FaInfoCircle, FaRocket } from 'react-icons/fa';
import './BlingQuickSetup.css';

interface BlingQuickSetupProps {
    onTokenConfigured?: () => void;
}

export default function BlingQuickSetup({ onTokenConfigured }: BlingQuickSetupProps) {
    const [token, setToken] = useState('');
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showDemoMode, setShowDemoMode] = useState(false);

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

            onTokenConfigured?.();
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

    const handleDemoMode = () => {
        // Configurar um token de demonstração que não faz requisições reais
        const demoToken = 'demo-token-' + Date.now();
        blingService.setAccessToken(demoToken);

        setResult({
            success: true,
            message: 'Modo demonstração ativado! Os testes usarão dados simulados.'
        });

        setShowDemoMode(true);
        onTokenConfigured?.();
    };

    const handleClearToken = () => {
        localStorage.removeItem('bling_access_token');
        localStorage.removeItem('bling_refresh_token');
        localStorage.removeItem('bling_token_expiry');
        setToken('');
        setResult(null);
        setShowDemoMode(false);
        onTokenConfigured?.();
    };

    return (
        <div className="bling-quick-setup">
            <div className="setup-header">
                <FaRocket className="rocket-icon" />
                <h2>Configuração Rápida do Bling</h2>
                <p>Configure um token para testar a integração ou ative o modo demonstração.</p>
            </div>

            <div className="setup-options">
                <div className="option-card">
                    <div className="option-header">
                        <FaKey className="option-icon" />
                        <h3>Token Real</h3>
                        <p>Use seu Access Token real do Bling para dados reais</p>
                    </div>

                    <div className="option-form">
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Cole seu Access Token do Bling aqui..."
                            disabled={testing}
                        />

                        <button
                            className="btn btn-primary"
                            onClick={handleSetToken}
                            disabled={testing || !token.trim()}
                        >
                            {testing ? 'Testando...' : 'Configurar Token Real'}
                        </button>
                    </div>
                </div>

                <div className="option-card demo-card">
                    <div className="option-header">
                        <FaInfoCircle className="option-icon" />
                        <h3>Modo Demonstração</h3>
                        <p>Ative para testar com dados simulados (sem token real)</p>
                    </div>

                    <div className="option-form">
                        <button
                            className="btn btn-demo"
                            onClick={handleDemoMode}
                            disabled={testing}
                        >
                            <FaRocket />
                            Ativar Modo Demonstração
                        </button>
                    </div>
                </div>
            </div>

            {result && (
                <div className={`setup-result ${result.success ? 'success' : 'error'}`}>
                    <div className="result-icon">
                        {result.success ? <FaCheck /> : <FaExclamationTriangle />}
                    </div>
                    <div className="result-message">
                        {result.message}
                    </div>
                </div>
            )}

            <div className="setup-actions">
                <button
                    className="btn btn-outline"
                    onClick={handleClearToken}
                    disabled={testing}
                >
                    Limpar Configuração
                </button>
            </div>

            <div className="setup-info">
                <h4>Como obter um Access Token:</h4>
                <ol>
                    <li>Acesse sua conta do Bling</li>
                    <li>Vá em Configurações → API</li>
                    <li>Gere um novo Access Token</li>
                    <li>Cole o token no campo acima</li>
                </ol>

                <div className="demo-info">
                    <strong>💡 Dica:</strong> Se você não tem um token do Bling, use o "Modo Demonstração"
                    para testar todas as funcionalidades com dados simulados.
                </div>

                <div className="proxy-info">
                    <strong>🔧 Informação Técnica:</strong> O sistema usa um proxy local para contornar
                    problemas de CORS com a API do Bling. Todas as requisições passam por `/api/bling`
                    que redireciona para `https://api.bling.com.br/Api/v3`.
                </div>
            </div>
        </div>
    );
}
