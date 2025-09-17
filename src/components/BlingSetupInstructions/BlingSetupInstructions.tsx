import { useState } from 'react';
import { FaArrowRight, FaCheck, FaExclamationTriangle, FaKey } from "react-icons/fa";
import BlingTestToken from "../BlingTestToken/BlingTestToken";
import "./BlingSetupInstructions.css";

interface BlingSetupInstructionsProps {
    onConfigure: () => void;
}

export default function BlingSetupInstructions({ onConfigure }: BlingSetupInstructionsProps) {
    const [showTokenTest, setShowTokenTest] = useState(false);

    return (
        <div className="bling-setup-instructions">
            <div className="setup-header">
                <FaExclamationTriangle className="warning-icon" />
                <h2>Configure a Integração com Bling</h2>
                <p>Para visualizar dados reais de pedidos, você precisa configurar a integração com o Bling.</p>
            </div>

            <div className="setup-steps">
                <h3>Como configurar:</h3>

                <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h4>Obter Access Token</h4>
                        <p>Acesse sua conta do Bling e gere um Access Token para a API.</p>
                    </div>
                </div>

                <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h4>Configurar no Sistema</h4>
                        <p>Use o botão abaixo para acessar a página de configuração.</p>
                    </div>
                </div>

                <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                        <h4>Testar Conexão</h4>
                        <p>Teste a conexão para garantir que está funcionando corretamente.</p>
                    </div>
                </div>
            </div>

            <div className="setup-benefits">
                <h3>Benefícios da integração:</h3>
                <ul>
                    <li><FaCheck /> Dados reais de pedidos em tempo real</li>
                    <li><FaCheck /> Estatísticas atualizadas automaticamente</li>
                    <li><FaCheck /> Sincronização automática a cada minuto</li>
                    <li><FaCheck /> Status de pedidos atualizado</li>
                    <li><FaCheck /> Prioridades calculadas automaticamente</li>
                </ul>
            </div>

            <div className="setup-actions">
                <button 
                    className="btn btn-primary btn-large"
                    onClick={onConfigure}
                >
                    <FaArrowRight />
                    Configurar Integração Agora
                </button>
                
                <button 
                    className="btn btn-outline btn-large"
                    onClick={() => setShowTokenTest(!showTokenTest)}
                >
                    <FaKey />
                    {showTokenTest ? 'Ocultar' : 'Testar Token Rapidamente'}
                </button>
            </div>

            {showTokenTest && (
                <div className="token-test-section">
                    <BlingTestToken onTokenSet={() => {
                        setShowTokenTest(false);
                        // Recarregar a página para atualizar os dados
                        window.location.reload();
                    }} />
                </div>
            )}

            <div className="setup-note">
                <p>
                    <strong>Nota:</strong> Sem a integração configurada, o sistema mostrará dados mockados
                    para demonstração. Configure a integração para ver dados reais do seu Bling.
                </p>
            </div>
        </div>
    );
}
