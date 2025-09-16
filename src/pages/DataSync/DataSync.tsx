import { useState, useEffect } from "react";
import { FaSync, FaCheckCircle, FaExclamationTriangle, FaClock, FaDatabase, FaDownload, FaUpload, FaCog } from "react-icons/fa";
import Button from "../../components/Button/Button";
import "./DataSync.css";

interface SyncJob {
    id: string;
    name: string;
    type: "import" | "export" | "sync";
    status: "pending" | "running" | "completed" | "failed";
    progress: number;
    startTime?: string;
    endTime?: string;
    recordsProcessed: number;
    recordsTotal: number;
    error?: string;
}

interface SyncConfig {
    autoSync: boolean;
    syncInterval: number;
    retryAttempts: number;
    timeout: number;
    enabledSources: string[];
}

export default function DataSync() {
    const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
    const [config, setConfig] = useState<SyncConfig>({
        autoSync: true,
        syncInterval: 30,
        retryAttempts: 3,
        timeout: 300,
        enabledSources: ["bling", "erp", "crm"],
    });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadSyncData();
    }, []);

    const loadSyncData = async () => {
        setLoading(true);

        // Simular carregamento de dados
        setTimeout(() => {
            const mockJobs: SyncJob[] = [
                {
                    id: "1",
                    name: "Sincronização Bling - Pedidos",
                    type: "import",
                    status: "completed",
                    progress: 100,
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    endTime: new Date(Date.now() - 3500000).toISOString(),
                    recordsProcessed: 156,
                    recordsTotal: 156,
                },
                {
                    id: "2",
                    name: "Exportação ERP - Produtos",
                    type: "export",
                    status: "running",
                    progress: 65,
                    startTime: new Date(Date.now() - 300000).toISOString(),
                    recordsProcessed: 89,
                    recordsTotal: 137,
                },
                {
                    id: "3",
                    name: "Sincronização CRM - Clientes",
                    type: "sync",
                    status: "failed",
                    progress: 0,
                    startTime: new Date(Date.now() - 1800000).toISOString(),
                    endTime: new Date(Date.now() - 1700000).toISOString(),
                    recordsProcessed: 0,
                    recordsTotal: 45,
                    error: "Timeout na conexão com o servidor",
                },
            ];

            setSyncJobs(mockJobs);
            setLoading(false);
        }, 1000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <FaCheckCircle className="status-icon completed" />;
            case "running":
                return <FaSync className="status-icon running spinning" />;
            case "failed":
                return <FaExclamationTriangle className="status-icon failed" />;
            default:
                return <FaClock className="status-icon pending" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: "Pendente", class: "status-pending" },
            running: { label: "Executando", class: "status-running" },
            completed: { label: "Concluído", class: "status-completed" },
            failed: { label: "Falhou", class: "status-failed" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] ||
            { label: status, class: "status-default" };

        return (
            <span className={`status-badge ${config.class}`}>
                {config.label}
            </span>
        );
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "import":
                return <FaDownload className="type-icon import" />;
            case "export":
                return <FaUpload className="type-icon export" />;
            case "sync":
                return <FaSync className="type-icon sync" />;
            default:
                return <FaDatabase className="type-icon default" />;
        }
    };

    const handleStartSync = async () => {
        setSyncing(true);

        // Simular sincronização
        setTimeout(() => {
            const newJob: SyncJob = {
                id: Date.now().toString(),
                name: "Sincronização Manual",
                type: "sync",
                status: "running",
                progress: 0,
                startTime: new Date().toISOString(),
                recordsProcessed: 0,
                recordsTotal: 100,
            };

            setSyncJobs(prev => [newJob, ...prev]);
            setSyncing(false);
        }, 1000);
    };

    const handleRetryJob = (jobId: string) => {
        setSyncJobs(prev => prev.map(job =>
            job.id === jobId
                ? { ...job, status: "running", progress: 0, startTime: new Date().toISOString() }
                : job
        ));
    };

    const formatDuration = (startTime: string, endTime?: string) => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        const duration = end.getTime() - start.getTime();
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    };

    if (loading) {
        return (
            <div className="data-sync-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Carregando dados de sincronização...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="data-sync-page">
            <div className="data-sync-container">
                <div className="sync-header">
                    <h1>
                        <FaSync className="header-icon" />
                        Sincronização de Dados
                    </h1>
                    <p>Sincronize dados com sistemas externos e ERPs</p>
                </div>

                {/* Estatísticas */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaDatabase />
                        </div>
                        <div className="stat-content">
                            <h3>{syncJobs.length}</h3>
                            <p>Total de Jobs</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaCheckCircle />
                        </div>
                        <div className="stat-content">
                            <h3>{syncJobs.filter(job => job.status === "completed").length}</h3>
                            <p>Concluídos</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaSync />
                        </div>
                        <div className="stat-content">
                            <h3>{syncJobs.filter(job => job.status === "running").length}</h3>
                            <p>Em Execução</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-content">
                            <h3>{syncJobs.filter(job => job.status === "failed").length}</h3>
                            <p>Com Falha</p>
                        </div>
                    </div>
                </div>

                {/* Controles */}
                <div className="controls-section">
                    <div className="sync-controls">
                        <Button
                            variant="primary"
                            onClick={handleStartSync}
                            disabled={syncing}
                            className="sync-btn"
                        >
                            {syncing ? (
                                <>
                                    <FaSync className="spinning" />
                                    Sincronizando...
                                </>
                            ) : (
                                <>
                                    <FaSync />
                                    Iniciar Sincronização
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => setConfig(prev => ({ ...prev, autoSync: !prev.autoSync }))}
                            className="auto-sync-btn"
                        >
                            <FaCog />
                            {config.autoSync ? "Desativar" : "Ativar"} Auto Sync
                        </Button>
                    </div>

                    <div className="config-info">
                        <div className="config-item">
                            <span className="config-label">Intervalo:</span>
                            <span className="config-value">{config.syncInterval} min</span>
                        </div>
                        <div className="config-item">
                            <span className="config-label">Tentativas:</span>
                            <span className="config-value">{config.retryAttempts}</span>
                        </div>
                        <div className="config-item">
                            <span className="config-label">Timeout:</span>
                            <span className="config-value">{config.timeout}s</span>
                        </div>
                    </div>
                </div>

                {/* Jobs de Sincronização */}
                <div className="jobs-section">
                    <h2>Jobs de Sincronização</h2>
                    <div className="jobs-list">
                        {syncJobs.map(job => (
                            <div key={job.id} className="job-card">
                                <div className="job-header">
                                    <div className="job-info">
                                        <div className="job-icon">
                                            {getTypeIcon(job.type)}
                                        </div>
                                        <div className="job-details">
                                            <h3>{job.name}</h3>
                                            <div className="job-meta">
                                                <span className="job-type">{job.type.toUpperCase()}</span>
                                                <span className="job-time">
                                                    {job.startTime && formatDuration(job.startTime, job.endTime)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="job-status">
                                        {getStatusIcon(job.status)}
                                        {getStatusBadge(job.status)}
                                    </div>
                                </div>

                                <div className="job-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${job.progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="progress-text">
                                        {job.recordsProcessed} / {job.recordsTotal} registros ({job.progress}%)
                                    </div>
                                </div>

                                {job.error && (
                                    <div className="job-error">
                                        <FaExclamationTriangle />
                                        <span>{job.error}</span>
                                    </div>
                                )}

                                <div className="job-actions">
                                    {job.status === "failed" && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleRetryJob(job.id)}
                                            className="retry-btn"
                                        >
                                            <FaSync />
                                            Tentar Novamente
                                        </Button>
                                    )}

                                    {job.status === "running" && (
                                        <Button
                                            variant="outline"
                                            disabled
                                            className="cancel-btn"
                                        >
                                            <FaExclamationTriangle />
                                            Cancelar
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Configurações */}
                <div className="config-section">
                    <h2>Configurações de Sincronização</h2>
                    <div className="config-grid">
                        <div className="config-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.autoSync}
                                    onChange={(e) => setConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
                                />
                                Sincronização Automática
                            </label>
                        </div>

                        <div className="config-group">
                            <label>Intervalo de Sincronização (minutos)</label>
                            <input
                                type="number"
                                value={config.syncInterval}
                                onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
                                min="5"
                                max="1440"
                            />
                        </div>

                        <div className="config-group">
                            <label>Tentativas de Retry</label>
                            <input
                                type="number"
                                value={config.retryAttempts}
                                onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className="config-group">
                            <label>Timeout (segundos)</label>
                            <input
                                type="number"
                                value={config.timeout}
                                onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                                min="30"
                                max="600"
                            />
                        </div>
                    </div>

                    <div className="config-actions">
                        <Button variant="primary">Salvar Configurações</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
