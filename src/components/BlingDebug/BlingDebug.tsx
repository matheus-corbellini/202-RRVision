import { useState } from "react";
import { blingService } from "../../services/blingService";
import { FaCheckCircle, FaExclamationTriangle, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import "./BlingDebug.css";

export default function BlingDebug() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [validation, setValidation] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runDiagnostics = async () => {
        setIsLoading(true);
        try {
            const setup = blingService.testAuthorizationSetup();
            const validation = await blingService.validateBlingApp();

            setDebugInfo(setup);
            setValidation(validation);
        } catch (error) {
            console.error("Erro ao executar diagnósticos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copiado para a área de transferência!");
    };

    const openAuthUrl = () => {
        if (debugInfo?.authUrl) {
            window.open(debugInfo.authUrl, '_blank');
        }
    };

    return (
        <div className="bling-debug">
            <div className="debug-header">
                <h2>🔧 Diagnóstico da Integração Bling</h2>
                <p>Execute este diagnóstico para identificar problemas na configuração OAuth</p>
            </div>

            <div className="debug-actions">
                <button
                    className="btn btn-primary"
                    onClick={runDiagnostics}
                    disabled={isLoading}
                >
                    {isLoading ? "Executando..." : "Executar Diagnóstico"}
                </button>
            </div>

            {debugInfo && (
                <div className="debug-results">
                    <div className="debug-section">
                        <h3>📋 Informações de Debug</h3>
                        <div className="debug-info">
                            <div className="info-item">
                                <strong>Client ID:</strong>
                                <span className={debugInfo.debugInfo.config.clientId !== "NÃO CONFIGURADO" ? "success" : "error"}>
                                    {debugInfo.debugInfo.config.clientId}
                                </span>
                            </div>
                            <div className="info-item">
                                <strong>Client Secret:</strong>
                                <span className={debugInfo.debugInfo.config.clientSecret !== "NÃO CONFIGURADO" ? "success" : "error"}>
                                    {debugInfo.debugInfo.config.clientSecret}
                                </span>
                            </div>
                            <div className="info-item">
                                <strong>Redirect URI:</strong>
                                <span className="info-value">{debugInfo.debugInfo.config.redirectUri}</span>
                            </div>
                            <div className="info-item">
                                <strong>Base URL:</strong>
                                <span className="info-value">{debugInfo.debugInfo.config.baseUrl}</span>
                            </div>
                        </div>
                    </div>

                    <div className="debug-section">
                        <h3>🔗 URL de Autorização</h3>
                        <div className="auth-url-container">
                            <div className="auth-url">
                                <code>{debugInfo.authUrl}</code>
                            </div>
                            <div className="auth-url-actions">
                                <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => copyToClipboard(debugInfo.authUrl)}
                                >
                                    <FaCopy /> Copiar
                                </button>
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={openAuthUrl}
                                >
                                    <FaExternalLinkAlt /> Testar
                                </button>
                            </div>
                        </div>
                    </div>

                    {validation && (
                        <div className="debug-section">
                            <h3>✅ Validação</h3>
                            <div className={`validation-status ${validation.isValid ? 'valid' : 'invalid'}`}>
                                {validation.isValid ? (
                                    <div className="status-success">
                                        <FaCheckCircle className="success-icon" />
                                        <span>Configuração válida</span>
                                    </div>
                                ) : (
                                    <div className="status-error">
                                        <FaExclamationTriangle className="error-icon" />
                                        <span>Problemas encontrados</span>
                                    </div>
                                )}
                            </div>

                            {validation.errors.length > 0 && (
                                <div className="validation-errors">
                                    <h4>❌ Erros:</h4>
                                    <ul>
                                        {validation.errors.map((error: string, index: number) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {validation.suggestions.length > 0 && (
                                <div className="validation-suggestions">
                                    <h4>💡 Sugestões:</h4>
                                    <ul>
                                        {validation.suggestions.map((suggestion: string, index: number) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="debug-section">
                        <h3>📝 Instruções de Configuração</h3>
                        <div className="instructions">
                            {debugInfo.instructions.map((instruction: string, index: number) => (
                                <div key={index} className="instruction-item">
                                    <span className="instruction-number">{index + 1}</span>
                                    <span className="instruction-text">{instruction}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="debug-section">
                        <h3>✅ Checklist</h3>
                        <div className="checklist">
                            {debugInfo.checklist.map((item: string, index: number) => (
                                <div key={index} className="checklist-item">
                                    <span className="checklist-icon">
                                        {item.includes('✅') ? '✅' : '❓'}
                                    </span>
                                    <span className="checklist-text">{item.replace('✅ ', '').replace('❓ ', '')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
