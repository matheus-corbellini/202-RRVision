import { useState } from "react";
import { FaFileAlt, FaDownload, FaCalendarAlt, FaChartBar } from "react-icons/fa";
import Button from "../../components/Button/Button";
import "./Reports.css";

interface ReportConfig {
    type: "production" | "quality" | "maintenance" | "financial";
    period: "daily" | "weekly" | "monthly" | "custom";
    format: "pdf" | "excel" | "csv";
    dateRange?: {
        start: string;
        end: string;
    };
    includeCharts: boolean;
    includeDetails: boolean;
}

export default function Reports() {
    const [config, setConfig] = useState<ReportConfig>({
        type: "production",
        period: "weekly",
        format: "pdf",
        includeCharts: true,
        includeDetails: true,
    });
    const [generating, setGenerating] = useState(false);

    const reportTypes = [
        { value: "production", label: "Produção", icon: <FaChartBar /> },
        { value: "quality", label: "Qualidade", icon: <FaFileAlt /> },
        { value: "maintenance", label: "Manutenção", icon: <FaCalendarAlt /> },
        { value: "financial", label: "Financeiro", icon: <FaChartBar /> },
    ];

    const periods = [
        { value: "daily", label: "Diário" },
        { value: "weekly", label: "Semanal" },
        { value: "monthly", label: "Mensal" },
        { value: "custom", label: "Personalizado" },
    ];

    const formats = [
        { value: "pdf", label: "PDF", icon: <FaFileAlt /> },
        { value: "excel", label: "Excel", icon: <FaDownload /> },
        { value: "csv", label: "CSV", icon: <FaDownload /> },
    ];

    const handleGenerateReport = async () => {
        setGenerating(true);
        // Simular geração de relatório
        setTimeout(() => {
            setGenerating(false);
            alert("Relatório gerado com sucesso!");
        }, 2000);
    };

    return (
        <div className="reports-page">
            <div className="reports-container">
                <div className="reports-header">
                    <h1>
                        <FaFileAlt className="header-icon" />
                        Relatórios de Produção
                    </h1>
                    <p>Gere relatórios completos e detalhados do sistema</p>
                </div>

                <div className="reports-content">
                    <div className="config-section">
                        <h2>Configuração do Relatório</h2>

                        <div className="config-grid">
                            {/* Tipo de Relatório */}
                            <div className="config-group">
                                <label>Tipo de Relatório</label>
                                <div className="type-selector">
                                    {reportTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            className={`type-card ${config.type === type.value ? "active" : ""}`}
                                            onClick={() => setConfig(prev => ({ ...prev, type: type.value as any }))}
                                        >
                                            <div className="type-icon">{type.icon}</div>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Período */}
                            <div className="config-group">
                                <label>Período</label>
                                <div className="period-selector">
                                    {periods.map((period) => (
                                        <button
                                            key={period.value}
                                            className={`period-btn ${config.period === period.value ? "active" : ""}`}
                                            onClick={() => setConfig(prev => ({ ...prev, period: period.value as any }))}
                                        >
                                            {period.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Formato */}
                            <div className="config-group">
                                <label>Formato de Saída</label>
                                <div className="format-selector">
                                    {formats.map((format) => (
                                        <button
                                            key={format.value}
                                            className={`format-card ${config.format === format.value ? "active" : ""}`}
                                            onClick={() => setConfig(prev => ({ ...prev, format: format.value as any }))}
                                        >
                                            <div className="format-icon">{format.icon}</div>
                                            <span>{format.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Opções Adicionais */}
                            <div className="config-group">
                                <label>Opções Adicionais</label>
                                <div className="options-grid">
                                    <label className="option-item">
                                        <input
                                            type="checkbox"
                                            checked={config.includeCharts}
                                            onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                                        />
                                        <span>Incluir Gráficos</span>
                                    </label>
                                    <label className="option-item">
                                        <input
                                            type="checkbox"
                                            checked={config.includeDetails}
                                            onChange={(e) => setConfig(prev => ({ ...prev, includeDetails: e.target.checked }))}
                                        />
                                        <span>Incluir Detalhes</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="actions-section">
                            <Button
                                variant="primary"
                                onClick={handleGenerateReport}
                                disabled={generating}
                                className="generate-btn"
                            >
                                {generating ? (
                                    <>
                                        <FaDownload className="spinning" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <FaFileAlt />
                                        Gerar Relatório
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="preview-section">
                        <h2>Prévia do Relatório</h2>
                        <div className="preview-card">
                            <div className="preview-header">
                                <h3>Relatório de Produção</h3>
                                <span className="preview-period">Última Semana</span>
                            </div>
                            <div className="preview-content">
                                <div className="preview-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Pedidos Processados</span>
                                        <span className="stat-value">156</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Eficiência</span>
                                        <span className="stat-value">94.2%</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Tempo Médio</span>
                                        <span className="stat-value">2.3h</span>
                                    </div>
                                </div>
                                <div className="preview-chart">
                                    <div className="chart-placeholder">
                                        <FaChartBar />
                                        <p>Gráfico de Produção</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
