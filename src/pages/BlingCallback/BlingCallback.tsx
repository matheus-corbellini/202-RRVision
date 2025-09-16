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

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get("code");
                const error = searchParams.get("error");
                const state = searchParams.get("state");

                if (error) {
                    setStatus("error");
                    setMessage(`Erro na autorização: ${error}`);
                    return;
                }

                if (!code) {
                    setStatus("error");
                    setMessage("Código de autorização não encontrado");
                    return;
                }

                // Trocar código por token
                const authResponse = await blingService.exchangeCodeForToken(code);

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
