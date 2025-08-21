"use client";

import { useState, useEffect } from "react";
import {
	FaRoute,
	FaClock,
	FaTools,
	FaEdit,
	FaTrash,
	FaEye,
	FaFilter,
	FaSearch,
	FaSort,
} from "react-icons/fa";
import Button from "../../components/Button/Button";
import {
	listAllOperationalRoutes,
	deleteOperationalRoute,
	type OperationalRoute,
} from "../../services/operationalRoutesService";
import "./OperationalRoutesList.css";

export default function OperationalRoutesList() {
	const [routes, setRoutes] = useState<OperationalRoute[]>([]);
	const [filteredRoutes, setFilteredRoutes] = useState<OperationalRoute[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [sortBy, setSortBy] = useState<string>("productName");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	// Carregar roteiros do Firebase
	useEffect(() => {
		const loadRoutes = async () => {
			try {
				setLoading(true);
				const routesData = await listAllOperationalRoutes();
				setRoutes(routesData);
				setFilteredRoutes(routesData);
			} catch (error) {
				console.error("Erro ao carregar roteiros:", error);
				alert("Erro ao carregar roteiros operacionais");
			} finally {
				setLoading(false);
			}
		};

		loadRoutes();
	}, []);

	// Filtrar e ordenar roteiros
	useEffect(() => {
		let filtered = routes.filter((route) => {
			const matchesSearch = 
				route.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				route.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
				route.version.toLowerCase().includes(searchTerm.toLowerCase());
			
			const matchesStatus = statusFilter === "all" || route.status === statusFilter;
			
			return matchesSearch && matchesStatus;
		});

		// Ordenar roteiros
		filtered.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (sortBy) {
				case "productName":
					aValue = a.productName.toLowerCase();
					bValue = b.productName.toLowerCase();
					break;
				case "productCode":
					aValue = a.productCode.toLowerCase();
					bValue = b.productCode.toLowerCase();
					break;
				case "version":
					aValue = a.version;
					bValue = b.version;
					break;
				case "status":
					aValue = a.status;
					bValue = b.status;
					break;
				case "totalStandardTime":
					aValue = a.totalStandardTime;
					bValue = b.totalStandardTime;
					break;
				case "stepsCount":
					aValue = a.steps.length;
					bValue = b.steps.length;
					break;
				default:
					aValue = a.productName.toLowerCase();
					bValue = b.productName.toLowerCase();
			}

			if (sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		setFilteredRoutes(filtered);
	}, [routes, searchTerm, statusFilter, sortBy, sortOrder]);

	const handleDelete = async (id: string) => {
		if (window.confirm("Tem certeza que deseja excluir este roteiro operacional?")) {
			try {
				setLoading(true);
				await deleteOperationalRoute(id);
				setRoutes((prev) => prev.filter((route) => route.id !== id));
				alert("Roteiro operacional excluído com sucesso!");
			} catch (error) {
				console.error("Erro ao excluir roteiro:", error);
				alert(`Erro ao excluir roteiro: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
			} finally {
				setLoading(false);
			}
		}
	};

	const handleEdit = (route: OperationalRoute) => {
		// Navegar para a página de edição
		window.location.href = `/operational-routes?edit=${route.id}`;
	};

	const handleView = (route: OperationalRoute) => {
		// Navegar para a página de visualização
		window.location.href = `/operational-routes?view=${route.id}`;
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "active":
				return "Ativo";
			case "inactive":
				return "Inativo";
			case "draft":
				return "Rascunho";
			default:
				return status;
		}
	};

	const getStatusClass = (status: string) => {
		return `status-${status}`;
	};

	const formatTime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
	};

	const toggleSort = (field: string) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("asc");
		}
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setSortBy("productName");
		setSortOrder("asc");
	};

	return (
		<div className="operational-routes-list-page">
			<div className="operational-routes-list-container">
				<div className="operational-routes-list-content">
					{/* Header */}
					<div className="operational-routes-list-header">
						<div className="header-content">
							<h1>Lista de Roteiros Operacionais</h1>
							<p>Visualize e gerencie todos os roteiros de produção cadastrados</p>
						</div>
						<div className="header-actions">
							<Button 
								variant="primary" 
								onClick={() => window.location.href = "/operational-routes"}
							>
								<FaRoute /> Novo Roteiro
							</Button>
						</div>
					</div>

					{/* Filtros e Busca */}
					<div className="filters-section">
						{/* Busca Principal */}
						<div className="search-container">
							<div className="search-input-wrapper">
								<FaSearch className="search-icon" />
								<input
									type="text"
									className="search-input"
									placeholder="Buscar roteiros por produto, código ou versão..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								{searchTerm && (
									<button 
										className="clear-search-btn"
										onClick={() => setSearchTerm("")}
										title="Limpar busca"
									>
										×
									</button>
								)}
							</div>
						</div>

						{/* Filtros e Controles */}
						<div className="filters-row">
							<div className="filter-item">
								<label className="filter-label">Status</label>
								<select
									className="filter-select"
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								>
									<option value="all">Todos</option>
									<option value="active">Ativo</option>
									<option value="inactive">Inativo</option>
									<option value="draft">Rascunho</option>
								</select>
							</div>

							<div className="filter-item">
								<label className="filter-label">Ordenar por</label>
								<div className="sort-container">
									<select
										className="filter-select"
										value={sortBy}
										onChange={(e) => setSortBy(e.target.value)}
									>
										<option value="productName">Nome do Produto</option>
										<option value="productCode">Código</option>
										<option value="version">Versão</option>
										<option value="status">Status</option>
										<option value="totalStandardTime">Tempo</option>
										<option value="stepsCount">Etapas</option>
									</select>
									<button
										className="sort-btn"
										onClick={() => toggleSort(sortBy)}
										title={`Ordenar ${sortOrder === "asc" ? "decrescente" : "crescente"}`}
									>
										<FaSort className={sortOrder === "asc" ? "sort-asc" : "sort-desc"} />
									</button>
								</div>
							</div>

							<div className="filter-item">
								<Button variant="outline" onClick={clearFilters}>
									<FaFilter /> Limpar
								</Button>
							</div>
						</div>

						{/* Filtros Ativos */}
						{(searchTerm || statusFilter !== "all") && (
							<div className="active-filters-bar">
								<span className="active-filters-text">Filtros aplicados:</span>
								<div className="filter-tags">
									{searchTerm && (
										<span className="filter-tag">
											Busca: "{searchTerm}"
											<button 
												className="tag-remove-btn"
												onClick={() => setSearchTerm("")}
											>
												×
											</button>
										</span>
									)}
									{statusFilter !== "all" && (
										<span className="filter-tag">
											Status: {getStatusText(statusFilter)}
											<button 
												className="tag-remove-btn"
												onClick={() => setStatusFilter("all")}
											>
												×
											</button>
										</span>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Lista de Roteiros */}
					<div className="routes-list-section">
						{loading ? (
							<div className="loading-container">
								<div className="loading-spinner"></div>
								<p>Carregando roteiros...</p>
							</div>
						) : filteredRoutes.length === 0 ? (
							<div className="empty-state">
								<div className="empty-icon">
									<FaRoute />
								</div>
								<h3>Nenhum roteiro encontrado</h3>
								{searchTerm || statusFilter !== "all" ? (
									<>
										<p>Tente ajustar os filtros de busca ou</p>
										<Button 
											variant="primary" 
											onClick={() => window.location.href = "/operational-routes"}
										>
											criar um novo roteiro
										</Button>
									</>
								) : (
									<>
										<p>Nenhum roteiro operacional cadastrado ainda.</p>
										<Button 
											variant="primary" 
											onClick={() => window.location.href = "/operational-routes"}
										>
											Criar Primeiro Roteiro
										</Button>
									</>
								)}
							</div>
						) : (
							<div className="routes-table-container">
								<table className="routes-table">
									<thead>
										<tr>
											<th>Produto</th>
											<th>Versão</th>
											<th>Status</th>
											<th>Etapas</th>
											<th>Tempo Total</th>
											<th>Setup Total</th>
											<th>Ações</th>
										</tr>
									</thead>
									<tbody>
										{filteredRoutes.map((route) => (
											<tr key={route.id} className="route-row">
												<td className="product-cell">
													<div className="product-info">
														<h4>{route.productName}</h4>
														<span className="product-code">{route.productCode}</span>
													</div>
												</td>
												<td className="version-cell">
													<span className="version-badge">{route.version}</span>
												</td>
												<td className="status-cell">
													<span className={`status-badge ${getStatusClass(route.status)}`}>
														{getStatusText(route.status)}
													</span>
												</td>
												<td className="steps-cell">
													<div className="steps-info">
														<span className="steps-count">{route.steps.length}</span>
														<span className="steps-label">etapas</span>
													</div>
												</td>
												<td className="time-cell">
													<div className="time-info">
														<FaClock className="time-icon" />
														<span>{formatTime(route.totalStandardTime)}</span>
													</div>
												</td>
												<td className="setup-cell">
													<div className="setup-info">
														<FaTools className="setup-icon" />
														<span>{formatTime(route.totalSetupTime)}</span>
													</div>
												</td>
												<td className="actions-cell">
													<div className="action-buttons">
														<button
															className="action-btn view-btn"
															title="Visualizar"
															onClick={() => handleView(route)}
														>
															<FaEye />
														</button>
														<button
															className="action-btn edit-btn"
															title="Editar"
															onClick={() => handleEdit(route)}
														>
															<FaEdit />
														</button>
														<button
															className="action-btn delete-btn"
															title="Excluir"
															onClick={() => handleDelete(route.id)}
														>
															<FaTrash />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
