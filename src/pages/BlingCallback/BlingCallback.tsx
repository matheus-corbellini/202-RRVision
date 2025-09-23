import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { blingService } from "../../services/blingService";
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import "./BlingCallback.css";

export default function BlingCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Processando autorização...");
    const [processedCodes, setProcessedCodes] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Debug: Log all URL parameters
                console.log("URL completa:", window.location.href);
                console.log("Parâmetros da URL:", Object.fromEntries(searchParams.entries()));

                const code = searchParams.get("code");
                const error = searchParams.get("error");
                const state = searchParams.get("state");
                const errorDescription = searchParams.get("error_description");

                // Log para debug
                console.log("Parâmetros encontrados:", { code, error, state, errorDescription });

                if (error) {
                    setStatus("error");
                    const errorMsg = errorDescription || error;
                    setMessage(`Erro na autorização: ${errorMsg}`);
                    console.error("Erro OAuth:", error, errorDescription);
                    return;
                }

                if (!code) {
                    setStatus("error");
                    setMessage("Código de autorização não encontrado. Isso geralmente indica que a aplicação não está configurada corretamente no painel do Bling.");
                    console.error("Código de autorização não encontrado. URL:", window.location.href);
                    console.error("Possíveis causas:");
                    console.error("1. Aplicação não registrada no Bling");
                    console.error("2. URL de callback não configurada no Bling");
                    console.error("3. Client ID incorreto");
                    console.error("4. Permissões OAuth não habilitadas");
                    return;
                }

                // Verificar se o código já foi processado
                if (processedCodes.has(code)) {
                    console.log("Código já foi processado anteriormente:", code.substring(0, 10) + "...");
                    setStatus("success");
                    setMessage("Autorização já foi processada com sucesso! Redirecionando...");
                    setTimeout(() => {
                        navigate("/bling-integration");
                    }, 1000);
                    return;
                }

                // Marcar código como processado
                setProcessedCodes(prev => new Set(prev).add(code));

                setMessage("Processando código de autorização...");

                // Trocar código por token
                await blingService.exchangeCodeForToken(code);

                setStatus("success");
                setMessage("Autorização realizada com sucesso! Redirecionando...");

                // Redirecionar para a página de integração após 2 segundos
                setTimeout(() => {
                    navigate("/bling-integration");
                }, 2000);

            } catch (error) {
                console.error("Erro no callback:", error);
                setStatus("error");
                setMessage(`Erro ao processar autorização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    const getStatusIcon = () => {
        switch (status) {
            case "loading":
                return <FaSpinner className="spinning" />;
            case "success":
                return <FaCheckCircle className="success" />;
            case "error":
                return <FaExclamationTriangle className="error" />;
        }
    };

    const getStatusClass = () => {
        switch (status) {
            case "loading":
                return "loading";
            case "success":
                return "success";
            case "error":
                return "error";
        }
    };

    return (
        <div className="bling-callback-page">
            <div className="bling-callback-container">
                <div className={`callback-status ${getStatusClass()}`}>
                    <div className="status-icon">
                        {getStatusIcon()}
                    </div>
                    <h1>Autorização Bling</h1>
                    <p className="status-message">{message}</p>

                    {status === "error" && (
                        <div className="error-actions">
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/bling-integration")}
                            >
                                Voltar para Configuração
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
