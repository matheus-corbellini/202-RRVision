"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
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
	FaTimes,
	FaEye,
	FaFileAlt,
	FaDatabase,
	FaApi,
	FaClock,
	FaUser,
} from "react-icons/fa";
import "./BlingIntegration.css";

interface BlingOrder {
	id: string;
	number: string;
	customer: string;
	product: string;
	quantity: number;
	status: string;
	createdAt: string;
	importedAt?: string;
	importedBy?: string;
}

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
	apiKey: string;
	baseUrl: string;
	autoSync: boolean;
	syncInterval: number;
	lastSync?: string;
	nextSync?: string;
}

export default function BlingIntegration() {
	const { user } = useAuth();
	const {
		testConnection,
		importOrders,
		getImportHistory,
		getConfiguration,
		updateConfiguration,
	} = useBling();

	const [config, setConfig] = useState<BlingConfig>({
		apiKey: "",
		baseUrl: "https://bling.com.br/Api/v2",
		autoSync: false,
		syncInterval: 30,
	});

	const [orders, setOrders] = useState<BlingOrder[]>([]);
	const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
	const [loading, setLoading] = useState(false);
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

	const loadInitialData = async () => {
		try {
			const savedConfig = await getConfiguration();
			if (savedConfig) {
				setConfig(savedConfig);
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
		setTesting(true);
		try {
			const result = await testConnection(config);
			if (result.success) {
				setConnectionStatus("connected");
				alert("Conexão com Bling estabelecida com sucesso!");
			} else {
				setConnectionStatus("failed");
				alert(`Falha na conexão: ${result.error}`);
			}
		} catch (error) {
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
		if (!config.apiKey) {
			alert("Configure a API Key antes de importar ordens");
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
							<FaApi className="header-icon" />
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
									<label>API Key</label>
									<Input
										type="password"
										value={config.apiKey}
										onChange={(e) =>
											setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
										}
										placeholder="Digite sua API Key do Bling"
									/>
								</div>

								<div className="form-group">
									<label>URL Base</label>
									<Input
										type="text"
										value={config.baseUrl}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												baseUrl: e.target.value,
											}))
										}
										placeholder="https://bling.com.br/Api/v2"
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
											type="number"
											value={config.syncInterval}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													syncInterval: parseInt(e.target.value) || 30,
												}))
											}
											min="5"
											max="1440"
										/>
									</div>
								)}

								<div className="form-actions">
									<Button
										variant="outline"
										onClick={handleTestConnection}
										disabled={testing || !config.apiKey}
									>
										{testing ? "Testando..." : "Testar Conexão"}
									</Button>
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

							{orders.length > 0 && (
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
							)}
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
