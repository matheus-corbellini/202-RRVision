"use client";

import { useState, useEffect } from "react";
import {
	FaSearch,
	FaFilter,
	FaEye,
	FaEdit,
	FaTrash,
	FaDownload,
	FaPlus,
	FaUsers,
	FaIndustry,
	FaClock,
	FaGraduationCap,
	FaIdCard,
	FaExclamationTriangle,
	FaTimes,
} from "react-icons/fa";
import Button from "../../components/Button/Button";
import type { Operator, Team } from "../../types";
import type { Sector } from "../../types/sectors";
import type { User } from "../../types/user";
import {
	getAllOperatorsWithUsers,
	deleteOperatorAndUser,
} from "../../services/authService";
import "./OperatorsList.css";

interface OperatorWithUser {
	operator: Operator;
	user: User;
}

interface Filters {
	search: string;
	status: string;
	sector: string;
	team: string;
	contractType: string;
	workSchedule: string;
}

export default function OperatorsList() {
	const [operatorsWithUsers, setOperatorsWithUsers] = useState<
		OperatorWithUser[]
	>([]);
	const [filteredOperators, setFilteredOperators] = useState<
		OperatorWithUser[]
	>([]);
	const [sectors, setSectors] = useState<Sector[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [filters, setFilters] = useState<Filters>({
		search: "",
		status: "",
		sector: "",
		team: "",
		contractType: "",
		workSchedule: "",
	});
	const [showFilters, setShowFilters] = useState(false);
	const [selectedOperator, setSelectedOperator] =
		useState<OperatorWithUser | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		inactive: 0,
		suspended: 0,
		onLeave: 0,
	});

	// Mock data - Em produção, isso viria da API
	useEffect(() => {
		const mockSectors: Sector[] = [
			{
				id: "1",
				name: "Corte",
				code: "CORT",
				description: "Setor de corte e preparação de materiais",
				isActive: true,
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
				createdBy: "admin",
				updatedBy: "admin",
			},
			{
				id: "2",
				name: "Montagem",
				code: "MONT",
				description: "Setor de montagem e assemblagem",
				isActive: true,
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
				createdBy: "admin",
				updatedBy: "admin",
			},
			{
				id: "3",
				name: "Acabamento",
				code: "ACAB",
				description: "Setor de acabamento e finalização",
				isActive: true,
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
				createdBy: "admin",
				updatedBy: "admin",
			},
			{
				id: "4",
				name: "Embalagem",
				code: "EMBAL",
				description: "Setor de embalagem e expedição",
				isActive: true,
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
				createdBy: "admin",
				updatedBy: "admin",
			},
		];

		const mockTeams: Team[] = [
			{
				id: "1",
				name: "Equipe A",
				code: "EQ-A",
				isActive: true,
				createdAt: "",
				updatedAt: "",
				createdBy: "",
				updatedBy: "",
			},
			{
				id: "2",
				name: "Equipe B",
				code: "EQ-B",
				isActive: true,
				createdAt: "",
				updatedAt: "",
				createdBy: "",
				updatedBy: "",
			},
			{
				id: "3",
				name: "Equipe C",
				code: "EQ-C",
				isActive: true,
				createdAt: "",
				updatedAt: "",
				createdBy: "",
				updatedBy: "",
			},
		];

		setSectors(mockSectors);
		setTeams(mockTeams);

		loadOperators();
	}, []);

	const loadOperators = async () => {
		try {
			setLoading(true);
			console.log("Carregando operadores...");
			const operatorsData = await getAllOperatorsWithUsers();
			console.log("Operadores carregados:", operatorsData);
			console.log("Tipo de dados:", typeof operatorsData);
			console.log("É array?", Array.isArray(operatorsData));

			if (Array.isArray(operatorsData)) {
				setOperatorsWithUsers(operatorsData);
				setFilteredOperators(operatorsData);
				updateStats(operatorsData);
			} else {
				console.error("Dados retornados não são um array:", operatorsData);
				setOperatorsWithUsers([]);
				setFilteredOperators([]);
			}
		} catch (error) {
			console.error("Erro ao carregar operadores:", error);
			setOperatorsWithUsers([]);
			setFilteredOperators([]);
		} finally {
			setLoading(false);
		}
	};

	const updateStats = (operators: OperatorWithUser[]) => {
		console.log("Atualizando estatísticas com:", operators);
		const stats = {
			total: operators.length,
			active: operators.filter((op) => op.operator.status === "active").length,
			inactive: operators.filter((op) => op.operator.status === "inactive")
				.length,
			suspended: operators.filter((op) => op.operator.status === "suspended")
				.length,
			onLeave: operators.filter((op) => op.operator.status === "on_leave")
				.length,
		};
		console.log("Estatísticas calculadas:", stats);
		setStats(stats);
	};

	useEffect(() => {
		applyFilters();
	}, [filters, operatorsWithUsers]);

	const applyFilters = () => {
		console.log("Aplicando filtros:", filters);
		console.log("Operadores disponíveis:", operatorsWithUsers);

		let filtered = [...operatorsWithUsers];

		// Filtro de busca
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			filtered = filtered.filter(
				({ operator, user }) =>
					user.name?.toLowerCase().includes(searchTerm) ||
					operator.code.toLowerCase().includes(searchTerm) ||
					user.email.toLowerCase().includes(searchTerm) ||
					getSectorName(operator.primarySectorId)
						.toLowerCase()
						.includes(searchTerm)
			);
		}

		// Filtro de status
		if (filters.status) {
			filtered = filtered.filter(
				({ operator }) => operator.status === filters.status
			);
		}

		// Filtro de setor
		if (filters.sector) {
			filtered = filtered.filter(
				({ operator }) =>
					operator.primarySectorId === filters.sector ||
					operator.secondarySectorIds.includes(filters.sector)
			);
		}

		// Filtro de equipe
		if (filters.team) {
			filtered = filtered.filter(
				({ operator }) => operator.teamId === filters.team
			);
		}

		// Filtro de tipo de contrato
		if (filters.contractType) {
			filtered = filtered.filter(
				({ operator }) => operator.contractType === filters.contractType
			);
		}

		// Filtro de turno
		if (filters.workSchedule) {
			filtered = filtered.filter(
				({ operator }) => operator.workSchedule === filters.workSchedule
			);
		}

		console.log("Operadores filtrados:", filtered);
		setFilteredOperators(filtered);
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			status: "",
			sector: "",
			team: "",
			contractType: "",
			workSchedule: "",
		});
	};

	const handleDelete = async (id: string) => {
		if (
			window.confirm(
				"Tem certeza que deseja excluir este operador e seu usuário associado?"
			)
		) {
			try {
				console.log("Excluindo operador:", id);
				await deleteOperatorAndUser(id);
				console.log("Operador excluído com sucesso, recarregando lista...");
				await loadOperators();
				alert("Operador e usuário excluídos com sucesso!");
			} catch (error) {
				console.error("Erro ao excluir operador:", error);
				alert(
					`Erro ao excluir operador: ${
						error instanceof Error ? error.message : "Erro desconhecido"
					}`
				);
			}
		}
	};

	const showOperatorDetails = (operatorWithUser: OperatorWithUser) => {
		console.log("Mostrando detalhes do operador:", operatorWithUser);
		setSelectedOperator(operatorWithUser);
		setShowDetailsModal(true);
	};

	const exportToCSV = () => {
		const headers = [
			"Nome",
			"Código",
			"Email",
			"Setor Primário",
			"Status",
			"Equipe",
			"Tipo de Contrato",
			"Turno",
			"Horas Semanais",
			"Data de Admissão",
		];

		const csvContent = [
			headers.join(","),
			...filteredOperators.map(({ operator, user }) =>
				[
					user.name || "N/A",
					operator.code,
					user.email,
					getSectorName(operator.primarySectorId),
					getStatusText(operator.status),
					getTeamName(operator.teamId),
					getContractTypeText(operator.contractType),
					getWorkScheduleText(operator.workSchedule),
					operator.weeklyHours,
					operator.admissionDate,
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`operadores_${new Date().toISOString().split("T")[0]}.csv`
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const getSectorName = (sectorId: string) => {
		console.log("Buscando setor:", sectorId, "em setores:", sectors);
		const sector = sectors.find((s) => s.id === sectorId);
		console.log("Setor encontrado:", sector);
		return sector?.name || "N/A";
	};

	const getTeamName = (teamId?: string) => {
		if (!teamId) return "N/A";
		console.log("Buscando equipe:", teamId, "em equipes:", teams);
		const team = teams.find((t) => t.id === teamId);
		console.log("Equipe encontrada:", team);
		return team?.name || "N/A";
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "active":
				return "Ativo";
			case "inactive":
				return "Inativo";
			case "suspended":
				return "Suspenso";
			case "on_leave":
				return "Afastado";
			default:
				return status;
		}
	};

	const getStatusClass = (status: string) => {
		return `status-${status}`;
	};

	const getContractTypeText = (contractType: string) => {
		switch (contractType) {
			case "clt":
				return "CLT";
			case "pj":
				return "PJ";
			case "temporary":
				return "Temporário";
			case "intern":
				return "Estagiário";
			default:
				return contractType;
		}
	};

	const getWorkScheduleText = (workSchedule: string) => {
		switch (workSchedule) {
			case "day":
				return "Diurno";
			case "night":
				return "Noturno";
			case "rotating":
				return "Rotativo";
			case "flexible":
				return "Flexível";
			default:
				return workSchedule;
		}
	};

	if (loading) {
		return (
			<div className="operators-list-page">
				<div className="operators-list-container">
					<div className="loading-spinner">
						<div className="spinner"></div>
						<p>Carregando operadores...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="operators-list-page">
			<div className="operators-list-container">
				{/* Header */}
				<div className="operators-list-header">
					<div className="header-content">
						<h1>
							<FaUsers className="header-icon" />
							Lista de Operadores
						</h1>
						<p>
							Visualize e gerencie todos os operadores registrados no sistema
						</p>
					</div>
					<div className="header-actions">
						<Button
							variant="outline"
							onClick={() => setShowFilters(!showFilters)}
						>
							<FaFilter />
							{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
						</Button>
						<Button variant="outline" onClick={exportToCSV}>
							<FaDownload />
							Exportar CSV
						</Button>
						<Button
							variant="primary"
							onClick={() => (window.location.href = "/operator-registration")}
						>
							<FaPlus />
							Novo Operador
						</Button>
					</div>
				</div>

				{/* Estatísticas */}
				<div className="stats-grid">
					<div className="stat-card">
						<div className="stat-icon total">
							<FaUsers />
						</div>
						<div className="stat-content">
							<h3>{stats.total}</h3>
							<p>Total de Operadores</p>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon active">
							<FaIdCard />
						</div>
						<div className="stat-content">
							<h3>{stats.active}</h3>
							<p>Ativos</p>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon inactive">
							<FaExclamationTriangle />
						</div>
						<div className="stat-content">
							<h3>{stats.inactive}</h3>
							<p>Inativos</p>
						</div>
					</div>
					<div className="stat-card">
						<div className="stat-icon suspended">
							<FaClock />
						</div>
						<div className="stat-content">
							<h3>{stats.suspended + stats.onLeave}</h3>
							<p>Suspensos/Afastados</p>
						</div>
					</div>
				</div>

				{/* Filtros */}
				{showFilters && (
					<div className="filters-panel">
						<div className="filters-grid">
							<div className="filter-group">
								<label>Buscar</label>
								<div className="search-input">
									<FaSearch />
									<input
										type="text"
										placeholder="Nome, código, email ou setor..."
										value={filters.search}
										onChange={(e) =>
											setFilters((prev) => ({
												...prev,
												search: e.target.value,
											}))
										}
									/>
								</div>
							</div>

							<div className="filter-group">
								<label>Status</label>
								<select
									value={filters.status}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, status: e.target.value }))
									}
								>
									<option value="">Todos</option>
									<option value="active">Ativo</option>
									<option value="inactive">Inativo</option>
									<option value="suspended">Suspenso</option>
									<option value="on_leave">Afastado</option>
								</select>
							</div>

							<div className="filter-group">
								<label>Setor</label>
								<select
									value={filters.sector}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, sector: e.target.value }))
									}
								>
									<option value="">Todos</option>
									{sectors.map((sector) => (
										<option key={sector.id} value={sector.id}>
											{sector.name}
										</option>
									))}
								</select>
							</div>

							<div className="filter-group">
								<label>Equipe</label>
								<select
									value={filters.team}
									onChange={(e) =>
										setFilters((prev) => ({ ...prev, team: e.target.value }))
									}
								>
									<option value="">Todas</option>
									{teams.map((team) => (
										<option key={team.id} value={team.id}>
											{team.name}
										</option>
									))}
								</select>
							</div>

							<div className="filter-group">
								<label>Tipo de Contrato</label>
								<select
									value={filters.contractType}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											contractType: e.target.value,
										}))
									}
								>
									<option value="">Todos</option>
									<option value="clt">CLT</option>
									<option value="pj">PJ</option>
									<option value="temporary">Temporário</option>
									<option value="intern">Estagiário</option>
								</select>
							</div>

							<div className="filter-group">
								<label>Turno</label>
								<select
									value={filters.workSchedule}
									onChange={(e) =>
										setFilters((prev) => ({
											...prev,
											workSchedule: e.target.value,
										}))
									}
								>
									<option value="">Todos</option>
									<option value="day">Diurno</option>
									<option value="night">Noturno</option>
									<option value="rotating">Rotativo</option>
									<option value="flexible">Flexível</option>
								</select>
							</div>
						</div>

						<div className="filters-actions">
							<Button variant="secondary" onClick={clearFilters}>
								Limpar Filtros
							</Button>
							<span className="results-count">
								{filteredOperators.length} de {operatorsWithUsers.length}{" "}
								operadores
							</span>
						</div>
					</div>
				)}

				{/* Lista de Operadores */}
				<div className="operators-table-container">
					{filteredOperators.length === 0 ? (
						<div className="empty-state">
							<FaUsers className="empty-icon" />
							<h3>Nenhum operador encontrado</h3>
							<p>
								{filters.search ||
								filters.status ||
								filters.sector ||
								filters.team ||
								filters.contractType ||
								filters.workSchedule
									? "Tente ajustar os filtros aplicados"
									: "Não há operadores cadastrados no sistema"}
							</p>
							{!filters.search &&
								!filters.status &&
								!filters.sector &&
								!filters.team &&
								!filters.contractType &&
								!filters.workSchedule && (
									<Button
										variant="primary"
										onClick={() =>
											(window.location.href = "/operator-registration")
										}
									>
										<FaPlus />
										Cadastrar Primeiro Operador
									</Button>
								)}
						</div>
					) : (
						<div className="table-responsive">
							<table className="operators-table">
								<thead>
									<tr>
										<th>Operador</th>
										<th>Código</th>
										<th>Setor</th>
										<th>Status</th>
										<th>Equipe</th>
										<th>Contrato</th>
										<th>Turno</th>
										<th>Ações</th>
									</tr>
								</thead>
								<tbody>
									{filteredOperators.map(({ operator, user }) => (
										<tr key={operator.id} className="operator-row">
											<td className="operator-info">
												<div className="operator-avatar">
													{user.name?.charAt(0) || operator.code.charAt(0)}
												</div>
												<div className="operator-details">
													<strong>
														{user.name || `Operador ${operator.code}`}
													</strong>
													<span className="operator-email">{user.email}</span>
												</div>
											</td>
											<td>
												<span className="operator-code">{operator.code}</span>
											</td>
											<td>
												<div className="sector-info">
													<span className="primary-sector">
														{getSectorName(operator.primarySectorId)}
													</span>
													{operator.secondarySectorIds.length > 0 && (
														<span className="secondary-sectors">
															+{operator.secondarySectorIds.length}{" "}
															secundário(s)
														</span>
													)}
												</div>
											</td>
											<td>
												<span
													className={`status-badge ${getStatusClass(
														operator.status
													)}`}
												>
													{getStatusText(operator.status)}
												</span>
											</td>
											<td>
												<span className="team-info">
													{getTeamName(operator.teamId)}
												</span>
											</td>
											<td>
												<span className="contract-type">
													{getContractTypeText(operator.contractType)}
												</span>
											</td>
											<td>
												<span className="work-schedule">
													{getWorkScheduleText(operator.workSchedule)}
												</span>
											</td>
											<td>
												<div className="action-buttons">
													<button
														className="btn-icon view"
														onClick={() =>
															showOperatorDetails({ operator, user })
														}
														title="Ver Detalhes"
													>
														<FaEye />
													</button>
													<button
														className="btn-icon edit"
														onClick={() =>
															(window.location.href = `/operator-registration?edit=${operator.id}`)
														}
														title="Editar"
													>
														<FaEdit />
													</button>
													<button
														className="btn-icon delete"
														onClick={() => handleDelete(operator.id)}
														title="Excluir"
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

			{/* Modal de Detalhes */}
			{showDetailsModal && selectedOperator && (
				<div
					className="modal-overlay"
					onClick={() => setShowDetailsModal(false)}
				>
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-header">
							<h2>Detalhes do Operador</h2>
							<button
								className="modal-close"
								onClick={() => setShowDetailsModal(false)}
							>
								<FaTimes />
							</button>
						</div>

						<div className="modal-body">
							<div className="operator-profile">
								<div className="profile-avatar">
									{selectedOperator.user.name?.charAt(0) ||
										selectedOperator.operator.code.charAt(0)}
								</div>
								<div className="profile-info">
									<h3>
										{selectedOperator.user.name ||
											`Operador ${selectedOperator.operator.code}`}
									</h3>
									<p className="profile-role">Operador de Produção</p>
								</div>
							</div>

							<div className="details-grid">
								<div className="detail-section">
									<h4>
										<FaIdCard />
										Informações Básicas
									</h4>
									<div className="detail-item">
										<label>Código:</label>
										<span>{selectedOperator.operator.code}</span>
									</div>
									<div className="detail-item">
										<label>Email:</label>
										<span>{selectedOperator.user.email}</span>
									</div>
									<div className="detail-item">
										<label>Telefone:</label>
										<span>{selectedOperator.user.phone || "N/A"}</span>
									</div>
									<div className="detail-item">
										<label>Empresa:</label>
										<span>{selectedOperator.user.company || "N/A"}</span>
									</div>
								</div>

								<div className="detail-section">
									<h4>
										<FaIndustry />
										Informações Profissionais
									</h4>
									<div className="detail-item">
										<label>Setor Primário:</label>
										<span>
											{getSectorName(selectedOperator.operator.primarySectorId)}
										</span>
									</div>
									<div className="detail-item">
										<label>Setores Secundários:</label>
										<span>
											{selectedOperator.operator.secondarySectorIds.length > 0
												? selectedOperator.operator.secondarySectorIds
														.map((id) => getSectorName(id))
														.join(", ")
												: "Nenhum"}
										</span>
									</div>
									<div className="detail-item">
										<label>Equipe:</label>
										<span>{getTeamName(selectedOperator.operator.teamId)}</span>
									</div>
									<div className="detail-item">
										<label>Status:</label>
										<span
											className={`status-badge ${getStatusClass(
												selectedOperator.operator.status
											)}`}
										>
											{getStatusText(selectedOperator.operator.status)}
										</span>
									</div>
								</div>

								<div className="detail-section">
									<h4>
										<FaClock />
										Condições de Trabalho
									</h4>
									<div className="detail-item">
										<label>Tipo de Contrato:</label>
										<span>
											{getContractTypeText(
												selectedOperator.operator.contractType
											)}
										</span>
									</div>
									<div className="detail-item">
										<label>Turno:</label>
										<span>
											{getWorkScheduleText(
												selectedOperator.operator.workSchedule
											)}
										</span>
									</div>
									<div className="detail-item">
										<label>Horas Semanais:</label>
										<span>{selectedOperator.operator.weeklyHours}h</span>
									</div>
									<div className="detail-item">
										<label>Data de Admissão:</label>
										<span>{selectedOperator.operator.admissionDate}</span>
									</div>
								</div>

								<div className="detail-section">
									<h4>
										<FaGraduationCap />
										Habilidades
									</h4>
									<div className="skills-list">
										{selectedOperator.operator.skills.length > 0 ? (
											selectedOperator.operator.skills.map((skill, index) => (
												<span key={index} className="skill-tag">
													{skill}
												</span>
											))
										) : (
											<span className="no-skills">
												Nenhuma habilidade registrada
											</span>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<Button
								variant="secondary"
								onClick={() => setShowDetailsModal(false)}
							>
								Fechar
							</Button>
							<Button
								variant="primary"
								onClick={() => {
									setShowDetailsModal(false);
									window.location.href = `/operator-registration?edit=${selectedOperator.operator.id}`;
								}}
							>
								<FaEdit />
								Editar Operador
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
