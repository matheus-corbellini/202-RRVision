"use client";

import { useState, useEffect } from "react";
import { useBling } from "../../hooks/useBling";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import {
	FaCog,
	FaDownload,
	FaHistory,
	FaSync,
	FaCheckCircle,
	FaExclamationTriangle,
	FaFileAlt,
	FaDatabase,
	FaPlug,
	FaClock,
} from "react-icons/fa";
import "./BlingIntegration.css";



interface ImportLog {
	id: string;
	timestamp: string;
	type: "success" | "error" | "warning";
	message: string;
	details?: string;
	ordersCount?: number;
	errorsCount?: number;
}

interface BlingConfig {
	clientId: string;
	clientSecret: string;
	baseUrl: string;
	autoSync: boolean;
	syncInterval: number;
	lastSync?: string;
	nextSync?: string;
}

export default function BlingIntegration() {
	const {
		testConnection,
		importOrders,
		getImportHistory,
		getConfiguration,
		updateConfiguration,
	} = useBling();

	const [config, setConfig] = useState<BlingConfig>({
		clientId: "bb038bbf8baa2108a9e5c31b409338ef03cc93a0",
		clientSecret: "5602db5f1ddfccf5894336d514cdfae102111c9cb4cbfc788c8bc4d771f6",
		baseUrl: "https://www.bling.com.br/Api/v2",
		autoSync: false,
		syncInterval: 30,
	});

	const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
	const [testing, setTesting] = useState(false);
	const [importing, setImporting] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"config" | "import" | "history" | "logs"
	>("config");
	const [connectionStatus, setConnectionStatus] = useState<
		"unknown" | "connected" | "failed"
	>("unknown");

	// Carregar configuração e histórico ao montar o componente
	useEffect(() => {
		loadInitialData();
	}, []);

	// Monitorar mudanças na configuração para debug
	useEffect(() => {
		console.log("Configuração atualizada:", config);
		console.log("Botão desabilitado:", !config.clientId || !config.clientSecret);
		console.log("Client ID:", config.clientId);
		console.log("Client Secret:", config.clientSecret);
	}, [config]);

	const loadInitialData = async () => {
		try {
			console.log("Carregando dados iniciais...");
			console.log("Configuração atual:", config);
			
			const savedConfig = await getConfiguration();
			console.log("Configuração salva:", savedConfig);
			
			if (savedConfig) {
				// Mesclar configuração salva com valores padrão para garantir que as credenciais não sejam perdidas
				setConfig(prev => ({
					...prev,
					...savedConfig,
					// Manter as credenciais padrão se não estiverem na configuração salva
					clientId: savedConfig.clientId || prev.clientId,
					clientSecret: savedConfig.clientSecret || prev.clientSecret,
				}));
			}

			const history = await getImportHistory();
			if (history) {
				setImportLogs(history);
			}
		} catch (error) {
			console.error("Erro ao carregar dados iniciais:", error);
		}
	};

	const handleTestConnection = async () => {
		console.log("Botão clicado! Função handleTestConnection chamada");
		console.log("Estado atual - testing:", testing);
		console.log("Estado atual - config:", config);
		console.log("Client ID válido:", !!config.clientId);
		console.log("Client Secret válido:", !!config.clientSecret);
		
		setTesting(true);
		try {
			const result = await testConnection(config);
			console.log("Resultado do teste:", result);
			if (result.success) {
				setConnectionStatus("connected");
				alert("Conexão com Bling estabelecida com sucesso!");
			} else {
				setConnectionStatus("failed");
				alert(`Falha na conexão: ${result.error}`);
			}
		} catch (error) {
			console.error("Erro no teste de conexão:", error);
			setConnectionStatus("failed");
			alert("Erro ao testar conexão");
		} finally {
			setTesting(false);
		}
	};

	const handleSaveConfig = async () => {
		try {
			await updateConfiguration(config);
			alert("Configuração salva com sucesso!");
		} catch (error) {
			alert("Erro ao salvar configuração");
		}
	};

	const handleImportOrders = async () => {
		if (!config.clientId || !config.clientSecret) {
			alert("Configure o Client ID e Client Secret antes de importar ordens");
			return;
		}

		setImporting(true);
		try {
			const result = await importOrders(config);

			if (result.success) {
				const newLog: ImportLog = {
					id: Date.now().toString(),
					timestamp: new Date().toISOString(),
					type: "success",
					message: `Importação realizada com sucesso`,
					details: `${result.importedCount} ordens importadas`,
					ordersCount: result.importedCount,
					errorsCount: result.errorCount || 0,
				};

				setImportLogs((prev) => [newLog, ...prev]);
				alert(
					`Importação concluída! ${result.importedCount} ordens importadas.`
				);
			} else {
				const errorLog: ImportLog = {
					id: Date.now().toString(),
					timestamp: new Date().toISOString(),
					type: "error",
					message: "Falha na importação",
					details: result.error || "Erro desconhecido",
				};

				setImportLogs((prev) => [errorLog, ...prev]);
				alert(`Erro na importação: ${result.error}`);
			}
		} catch (error) {
			const errorLog: ImportLog = {
				id: Date.now().toString(),
				timestamp: new Date().toISOString(),
				type: "error",
				message: "Erro na importação",
				details: "Erro inesperado durante a importação",
			};

			setImportLogs((prev) => [errorLog, ...prev]);
			alert("Erro inesperado durante a importação");
		} finally {
			setImporting(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <FaCheckCircle className="status-icon success" />;
			case "error":
				return <FaExclamationTriangle className="status-icon error" />;
			case "warning":
				return <FaExclamationTriangle className="status-icon warning" />;
			default:
				return <FaClock className="status-icon info" />;
		}
	};

	const getStatusClass = (status: string) => {
		switch (status) {
			case "success":
				return "success";
			case "error":
				return "error";
			case "warning":
				return "warning";
			default:
				return "info";
		}
	};

	return (
		<div className="bling-integration-page">
			<div className="bling-integration-container">
				{/* Header */}
				<div className="bling-header">
					<div className="header-content">
						<h1>
							<FaPlug className="header-icon" />
							Integração Bling
						</h1>
						<p>
							Configure e gerencie a integração com a API do Bling para
							importação de ordens de produção
						</p>
					</div>
					<div className="header-status">
						<div className={`connection-status ${connectionStatus}`}>
							{connectionStatus === "connected" && <FaCheckCircle />}
							{connectionStatus === "failed" && <FaExclamationTriangle />}
							{connectionStatus === "unknown" && <FaClock />}
							<span>
								{connectionStatus === "connected" && "Conectado"}
								{connectionStatus === "failed" && "Falha na Conexão"}
								{connectionStatus === "unknown" && "Não Testado"}
							</span>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bling-tabs">
					<button
						className={`tab-button ${activeTab === "config" ? "active" : ""}`}
						onClick={() => setActiveTab("config")}
					>
						<FaCog />
						Configuração
					</button>
					<button
						className={`tab-button ${activeTab === "import" ? "active" : ""}`}
						onClick={() => setActiveTab("import")}
					>
						<FaDownload />
						Importação
					</button>
					<button
						className={`tab-button ${activeTab === "history" ? "active" : ""}`}
						onClick={() => setActiveTab("history")}
					>
						<FaHistory />
						Histórico
					</button>
					<button
						className={`tab-button ${activeTab === "logs" ? "active" : ""}`}
						onClick={() => setActiveTab("logs")}
					>
						<FaFileAlt />
						Logs
					</button>
				</div>

				{/* Tab Content */}
				<div className="tab-content">
					{/* Configuração */}
					{activeTab === "config" && (
						<div className="config-section">
							<div className="section-header">
								<h2>Configuração da API</h2>
								<p>Configure os parâmetros de conexão com a API do Bling</p>
							</div>

							<div className="config-form">
								<div className="form-group">
									<label>Client ID</label>
									<Input
										name="clientId"
										type="text"
										value={config.clientId}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, clientId: e.target.value }))
										}
										placeholder="Digite seu Client ID do Bling"
									/>
									<div style={{ fontSize: '0.8rem', color: config.clientId ? '#48bb78' : '#e53e3e', marginTop: '0.25rem' }}>
										{config.clientId ? '✅ Client ID configurado' : '❌ Client ID necessário'}
									</div>
								</div>

								<div className="form-group">
									<label>Client Secret</label>
									<Input
										name="clientSecret"
										type="password"
										value={config.clientSecret}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, clientSecret: e.target.value }))
										}
										placeholder="Digite seu Client Secret do Bling"
									/>
									<div style={{ fontSize: '0.8rem', color: config.clientSecret ? '#48bb78' : '#e53e3e', marginTop: '0.25rem' }}>
										{config.clientSecret ? '✅ Client Secret configurado' : '❌ Client Secret necessário'}
									</div>
								</div>

								<div className="form-group">
									<label>URL Base</label>
									<Input
										name="baseUrl"
										type="text"
										value={config.baseUrl}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												baseUrl: e.target.value,
											}))
										}
										placeholder="https://www.bling.com.br/Api/v2"
									/>
								</div>

								<div className="form-group">
									<label>
										<input
											type="checkbox"
											checked={config.autoSync}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													autoSync: e.target.checked,
												}))
											}
										/>
										Sincronização Automática
									</label>
								</div>

								{config.autoSync && (
									<div className="form-group">
										<label>Intervalo de Sincronização (minutos)</label>
										<Input
											name="syncInterval"
											type="number"
											value={config.syncInterval.toString()}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													syncInterval: parseInt(e.target.value) || 30,
												}))
											}
											placeholder="30"
										/>
									</div>
								)}

								<div className="form-actions">
									<button
										type="button"
										className="btn btn-outline"
										onClick={handleTestConnection}
										disabled={testing || !config.clientId || !config.clientSecret}
										style={{
											padding: '0.75rem 1.5rem',
											border: '1px solid #e2e8f0',
											borderRadius: '8px',
											background: (testing || !config.clientId || !config.clientSecret) ? '#f7fafc' : 'white',
											color: (testing || !config.clientId || !config.clientSecret) ? '#a0aec0' : '#4a5568',
											cursor: (testing || !config.clientId || !config.clientSecret) ? 'not-allowed' : 'pointer',
											fontSize: '1rem',
											fontWeight: '500'
										}}
									>
										{testing ? "Testando..." : "Testar Conexão"}
									</button>
									<div style={{ fontSize: '0.8rem', color: '#4a5568', marginTop: '0.5rem' }}>
										{testing ? '⏳ Testando conexão...' : 
										 (!config.clientId || !config.clientSecret) ? '❌ Configure Client ID e Client Secret' : 
										 '✅ Pronto para testar'}
									</div>
									<Button onClick={handleSaveConfig}>
										Salvar Configuração
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Importação */}
					{activeTab === "import" && (
						<div className="import-section">
							<div className="section-header">
								<h2>Importação de Ordens</h2>
								<p>Importe ordens de produção do Bling para o sistema</p>
							</div>

							<div className="import-actions">
								<div className="import-info">
									<div className="info-card">
										<FaDatabase className="info-icon" />
										<div>
											<h3>Última Importação</h3>
											<p>
												{config.lastSync
													? new Date(config.lastSync).toLocaleString("pt-BR")
													: "Nunca"}
											</p>
										</div>
									</div>
									<div className="info-card">
										<FaClock className="info-icon" />
										<div>
											<h3>Próxima Sincronização</h3>
											<p>
												{config.nextSync
													? new Date(config.nextSync).toLocaleString("pt-BR")
													: "Não agendada"}
											</p>
										</div>
									</div>
								</div>

								<div className="import-controls">
									<Button
										variant="primary"
										onClick={handleImportOrders}
										disabled={importing || connectionStatus !== "connected"}
									>
										{importing ? (
											<FaSync className="spinning" />
										) : (
											<FaDownload />
										)}
										{importing ? "Importando..." : "Importar Ordens"}
									</Button>
								</div>
							</div>

							{/* orders.length > 0 && (
								<div className="orders-preview">
									<h3>Últimas Ordens Importadas</h3>
									<div className="orders-table">
										<div className="table-header">
											<div>Número</div>
											<div>Cliente</div>
											<div>Produto</div>
											<div>Quantidade</div>
											<div>Status</div>
											<div>Data</div>
										</div>
										{orders.slice(0, 10).map((order) => (
											<div key={order.id} className="table-row">
												<div>{order.number}</div>
												<div>{order.customer}</div>
												<div>{order.product}</div>
												<div>{order.quantity}</div>
												<div className={`status-badge ${order.status}`}>
													{order.status}
												</div>
												<div>
													{new Date(order.createdAt).toLocaleDateString(
														"pt-BR"
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							) */}
						</div>
					)}

					{/* Histórico */}
					{activeTab === "history" && (
						<div className="history-section">
							<div className="section-header">
								<h2>Histórico de Importações</h2>
								<p>Visualize o histórico completo de importações realizadas</p>
							</div>

							<div className="history-table">
								<div className="table-header">
									<div>Data/Hora</div>
									<div>Tipo</div>
									<div>Mensagem</div>
									<div>Detalhes</div>
									<div>Ordens</div>
									<div>Erros</div>
								</div>
								{importLogs.map((log) => (
									<div
										key={log.id}
										className={`table-row ${getStatusClass(log.type)}`}
									>
										<div>{new Date(log.timestamp).toLocaleString("pt-BR")}</div>
										<div className="log-type">
											{getStatusIcon(log.type)}
											<span>{log.type}</span>
										</div>
										<div>{log.message}</div>
										<div>{log.details || "—"}</div>
										<div>{log.ordersCount || "—"}</div>
										<div>{log.errorsCount || "—"}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Logs */}
					{activeTab === "logs" && (
						<div className="logs-section">
							<div className="section-header">
								<h2>Logs do Sistema</h2>
								<p>Monitore os logs detalhados de todas as operações</p>
							</div>

							<div className="logs-filters">
								<div className="filter-group">
									<label>Tipo:</label>
									<select>
										<option value="">Todos</option>
										<option value="success">Sucesso</option>
										<option value="error">Erro</option>
										<option value="warning">Aviso</option>
									</select>
								</div>
								<div className="filter-group">
									<label>Data:</label>
									<input type="date" />
								</div>
								<Button variant="outline">Filtrar</Button>
							</div>

							<div className="logs-list">
								{importLogs.map((log) => (
									<div
										key={log.id}
										className={`log-item ${getStatusClass(log.type)}`}
									>
										<div className="log-header">
											<div className="log-timestamp">
												{new Date(log.timestamp).toLocaleString("pt-BR")}
											</div>
											<div className="log-type-badge">
												{getStatusIcon(log.type)}
												{log.type}
											</div>
										</div>
										<div className="log-message">{log.message}</div>
										{log.details && (
											<div className="log-details">
												<strong>Detalhes:</strong> {log.details}
											</div>
										)}
										<div className="log-metrics">
											{log.ordersCount !== undefined && (
												<span className="metric">
													<FaDownload /> {log.ordersCount} ordens
												</span>
											)}
											{log.errorsCount !== undefined && (
												<span className="metric error">
													<FaExclamationTriangle /> {log.errorsCount} erros
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}