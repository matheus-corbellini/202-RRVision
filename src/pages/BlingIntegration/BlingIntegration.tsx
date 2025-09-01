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
	accessToken: string; // Token OAuth direto
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
		clientId: import.meta.env.VITE_BLING_CLIENT_ID || "",
		clientSecret: import.meta.env.VITE_BLING_CLIENT_SECRET || "",
		baseUrl: "https://api.bling.com.br/Api/v3", // URL correta da API v3
		accessToken: import.meta.env.VITE_BLING_ACCESS_TOKEN || "",
		autoSync: import.meta.env.VITE_BLING_AUTO_SYNC === "true",
		syncInterval: parseInt(import.meta.env.VITE_BLING_SYNC_INTERVAL || "30"),
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
		console.log("Botão desabilitado:", !config.accessToken);
		console.log("Access Token:", config.accessToken ? "Configurado" : "Não configurado");
	}, [config]);

	const loadInitialData = async () => {
		try {
			console.log("Carregando dados iniciais...");
			console.log("Configuração atual:", config);
			console.log("Access Token inicial:", config.accessToken);
			
			const savedConfig = await getConfiguration();
			console.log("Configuração salva:", savedConfig);
			console.log("Access Token na configuração salva:", savedConfig?.accessToken);
			
			if (savedConfig) {
				// Mesclar configuração salva com valores padrão para garantir que as credenciais não sejam perdidas
				const newConfig = {
					...config,
					...savedConfig,
					// Manter as credenciais padrão se não estiverem na configuração salva
					clientId: savedConfig.clientId || config.clientId,
					clientSecret: savedConfig.clientSecret || config.clientSecret,
					accessToken: savedConfig.accessToken || config.accessToken,
				};
				
				console.log("Nova configuração mesclada:", newConfig);
				console.log("Access Token na nova configuração:", newConfig.accessToken);
				
				setConfig(newConfig);
			} else {
				console.log("Nenhuma configuração salva encontrada, usando valores padrão");
				console.log("Access Token padrão:", config.accessToken);
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
		console.log("Access Token válido:", !!config.accessToken);
		console.log("Access Token valor:", config.accessToken);
		
		if (!config.accessToken) {
			alert("Configure o Access Token antes de testar a conexão");
			return;
		}
		
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
			console.log("Salvando configuração:", config);
			console.log("Access Token sendo salvo:", config.accessToken);
			
			await updateConfiguration(config);
			alert("Configuração salva com sucesso!");
		} catch (error) {
			console.error("Erro ao salvar configuração:", error);
			alert("Erro ao salvar configuração");
		}
	};

	const handleImportOrders = async () => {
		console.log("Tentando importar ordens...");
		console.log("Access Token disponível:", !!config.accessToken);
		console.log("Access Token valor:", config.accessToken);
		
		if (!config.accessToken) {
			alert("Configure o Access Token antes de importar ordens");
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
									<label>Access Token OAuth</label>
									<Input
										name="accessToken"
										type="password"
										value={config.accessToken}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, accessToken: e.target.value }))
										}
										placeholder="Digite seu Access Token OAuth do Bling"
									/>
									<div style={{ fontSize: '0.8rem', color: config.accessToken ? '#48bb78' : '#e53e3e', marginTop: '0.25rem' }}>
										{config.accessToken ? '✅ Access Token configurado' : '❌ Access Token necessário'}
									</div>
									<div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem' }}>
										ℹ️ Obtenha seu Access Token através do fluxo OAuth 2.0 no painel do Bling
									</div>
								</div>

								<div className="form-group">
									<label>Client ID (Opcional)</label>
									<Input
										name="clientId"
										type="text"
										value={config.clientId}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, clientId: e.target.value }))
										}
										placeholder="Digite seu Client ID do Bling (opcional)"
									/>
									<div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
										ℹ️ Client ID é opcional para API v3 com Bearer tokens
									</div>
								</div>

								<div className="form-group">
									<label>Client Secret (Opcional)</label>
									<Input
										name="clientSecret"
										type="password"
										value={config.clientSecret}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, clientSecret: e.target.value }))
										}
										placeholder="Digite seu Client Secret do Bling (opcional)"
									/>
									<div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
										ℹ️ Client Secret é opcional para API v3 com Bearer tokens
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
										placeholder="https://api.bling.com.br/Api/v3"
									/>
									<div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>
										ℹ️ URL padrão da API v3 do Bling
									</div>
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
										disabled={testing || !config.accessToken}
										style={{
											padding: '0.75rem 1.5rem',
											border: '1px solid #e2e8f0',
											borderRadius: '8px',
											background: (testing || !config.accessToken) ? '#f7fafc' : 'white',
											color: (testing || !config.accessToken) ? '#a0aec0' : '#4a5568',
											cursor: (testing || !config.accessToken) ? 'not-allowed' : 'pointer',
											fontSize: '1rem',
											fontWeight: '500'
										}}
									>
										{testing ? "Testando..." : "Testar Conexão"}
									</button>
									<div style={{ fontSize: '0.8rem', color: '#4a5568', marginTop: '0.5rem' }}>
										{testing ? '⏳ Testando conexão...' : 
										 (!config.accessToken) ? '❌ Configure o Access Token' : 
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