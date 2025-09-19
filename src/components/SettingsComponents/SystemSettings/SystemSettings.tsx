"use client";

import "./SystemSettings.css";

interface SystemSettingsProps {
    config: {
        language: "pt" | "en" | "es";
        timezone: string;
        dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
        currency: "BRL" | "USD" | "EUR";
        autoSave: boolean;
        debugMode: boolean;
        logLevel: "error" | "warn" | "info" | "debug";
    };
    onConfigChange: (key: string, value: any) => void;
}

export default function SystemSettings({
    config,
    onConfigChange,
}: SystemSettingsProps) {
    return (
        <div className="system-settings">
            <h2>Configurações do Sistema</h2>

            <div className="form-group">
                <label>Idioma</label>
                <select
                    value={config.language}
                    onChange={(e) => onConfigChange("language", e.target.value)}
                >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                </select>
            </div>

            <div className="form-group">
                <label>Fuso Horário</label>
                <select
                    value={config.timezone}
                    onChange={(e) => onConfigChange("timezone", e.target.value)}
                >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                    <option value="Europe/Madrid">Madrid (GMT+1)</option>
                </select>
            </div>

            <div className="form-group">
                <label>Formato de Data</label>
                <select
                    value={config.dateFormat}
                    onChange={(e) => onConfigChange("dateFormat", e.target.value)}
                >
                    <option value="dd/mm/yyyy">DD/MM/AAAA</option>
                    <option value="mm/dd/yyyy">MM/DD/AAAA</option>
                    <option value="yyyy-mm-dd">AAAA-MM-DD</option>
                </select>
            </div>

            <div className="form-group">
                <label>Moeda</label>
                <select
                    value={config.currency}
                    onChange={(e) => onConfigChange("currency", e.target.value)}
                >
                    <option value="BRL">Real (R$)</option>
                    <option value="USD">Dólar ($)</option>
                    <option value="EUR">Euro (€)</option>
                </select>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={config.autoSave}
                        onChange={(e) => onConfigChange("autoSave", e.target.checked)}
                    />
                    Salvar automaticamente
                </label>
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={config.debugMode}
                        onChange={(e) => onConfigChange("debugMode", e.target.checked)}
                    />
                    Modo de depuração
                </label>
            </div>

            <div className="form-group">
                <label>Nível de Log</label>
                <select
                    value={config.logLevel}
                    onChange={(e) => onConfigChange("logLevel", e.target.value)}
                >
                    <option value="error">Apenas Erros</option>
                    <option value="warn">Avisos e Erros</option>
                    <option value="info">Informações</option>
                    <option value="debug">Depuração Completa</option>
                </select>
            </div>
        </div>
    );
}
