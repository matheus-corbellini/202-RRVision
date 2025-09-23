import { FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import BlingSetupInstructions from "../BlingSetupInstructions/BlingSetupInstructions";
import "./BlingIntegrationStatus.css";

interface BlingIntegrationStatusProps {
    hasToken: boolean;
    lastSync?: Date | null;
    error?: string | null;
    onConfigure?: () => void;
}

export default function BlingIntegrationStatus({
    hasToken,
    lastSync,
    error,
    onConfigure
}: BlingIntegrationStatusProps) {
    if (!hasToken) {
        return (
            <BlingSetupInstructions onConfigure={onConfigure || (() => { })} />
        );
    }

    if (error) {
        return (
            <div className="bling-integration-status error">
                <div className="status-icon">
                    <FaExclamationTriangle />
                </div>
                <div className="status-content">
                    <h3>Erro na integração com Bling</h3>
                    <p>{error}</p>
                    <p className="last-sync">
                        Última sincronização: {lastSync ? lastSync.toLocaleString() : 'Nunca'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bling-integration-status success">
            <div className="status-icon">
                <FaCheckCircle />
            </div>
            <div className="status-content">
                <h3>Integração com Bling ativa</h3>
                <p>Dados sendo sincronizados automaticamente</p>
                <p className="last-sync">
                    Última sincronização: {lastSync ? lastSync.toLocaleString() : 'Nunca'}
                </p>
            </div>
        </div>
    );
}
