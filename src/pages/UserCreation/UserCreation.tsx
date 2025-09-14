"use client";

import { useState, useEffect } from "react";
import { 
	createUser, 
	listAllUsers, 
	deleteUser, 
	updateUser,
	isEmailAlreadyUsed,
	type CreateUserData,
	type UpdateUserData 
} from "../../services/userCreationService";
import { 
	isCodeAlreadyUsed
} from "../../services/authService";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { 
	FaUserPlus, 
	FaSave, 
	FaTimes, 
	FaEdit, 
	FaTrash, 
	FaSearch,
	FaUsers,
	FaEnvelope,
	FaBuilding,
	FaPhone,
	FaUserTag,
	FaPlus
} from "react-icons/fa";
import type { User, UserRole } from "../../types";
import "./UserCreation.css";

// Interface para setor - comentada para uso futuro
// interface Sector {
// 	id: string;
// 	name: string;
// 	code: string;
// 	description: string;
// 	isActive: boolean;
// 	createdAt: string;
// 	updatedAt: string;
// 	createdBy: string;
// 	updatedBy: string;
// }

// Interface para equipe - comentada para uso futuro
// interface Team {
// 	id: string;
// 	name: string;
// 	code: string;
// 	isActive: boolean;
// 	createdAt: string;
// 	updatedAt: string;
// 	createdBy: string;
// 	updatedBy: string;
// }

interface UserFormData {
	email: string;
	name: string;
	displayName: string;
	company: string;
	phone: string;
	password: string;
	confirmPassword: string;
	userType: string;
	role: UserRole;
	// Campos específicos de operador
	code?: string;
	primarySectorId?: string;
	secondarySectorIds?: string[];
	skills?: string[];
	admissionDate?: string;
	contractType?: string;
	workSchedule?: string;
	weeklyHours?: number;
	supervisorId?: string;
	teamId?: string;
	status?: string;
	lastTrainingDate?: string;
	nextTrainingDate?: string;
	newSkill?: string;
}

export default function UserCreation() {
	const [users, setUsers] = useState<User[]>([]);
	const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [formData, setFormData] = useState<UserFormData>({
		email: "",
		name: "",
		displayName: "",
		company: "",
		phone: "",
		password: "",
		confirmPassword: "",
		userType: "operator",
		role: "operator",
		// Campos específicos de operador
		code: "",
		primarySectorId: "",
		secondarySectorIds: [],
		skills: [],
		admissionDate: "",
		contractType: "clt",
		workSchedule: "day",
		weeklyHours: 40,
		supervisorId: "",
		teamId: "",
		status: "active",
		lastTrainingDate: "",
		nextTrainingDate: "",
		newSkill: "",
	});
	const [formLoading, setFormLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	// const [sectors] = useState<Sector[]>([]);
	// const [teams] = useState<Team[]>([]);
	// const [newSkill, setNewSkill] = useState("");

	// Carregar usuários
	useEffect(() => {
		loadUsers();
		// loadSectorsAndTeams();
	}, []);

	// Carregar setores e equipes (mock data) - comentado para uso futuro
	// const loadSectorsAndTeams = () => {
	// 	const mockSectors: Sector[] = [
	// 		{
	// 			id: "1",
	// 			name: "Corte",
	// 			code: "CORT",
	// 			description: "Setor de corte e preparação de materiais",
	// 			isActive: true,
	// 			createdAt: "2023-01-01",
	// 			updatedAt: "2023-01-01",
	// 			createdBy: "admin",
	// 			updatedBy: "admin",
	// 		},
	// 		{
	// 			id: "2",
	// 			name: "Montagem",
	// 			code: "MONT",
	// 			description: "Setor de montagem e assemblagem",
	// 			isActive: true,
	// 			createdAt: "2023-01-01",
	// 			updatedAt: "2023-01-01",
	// 			createdBy: "admin",
	// 			updatedBy: "admin",
	// 		},
	// 		{
	// 			id: "3",
	// 			name: "Acabamento",
	// 			code: "ACAB",
	// 			description: "Setor de acabamento e finalização",
	// 			isActive: true,
	// 			createdAt: "2023-01-01",
	// 			updatedAt: "2023-01-01",
	// 			createdBy: "admin",
	// 			updatedBy: "admin",
	// 		},
	// 		{
	// 			id: "4",
	// 			name: "Embalagem",
	// 			code: "EMBAL",
	// 			description: "Setor de embalagem e expedição",
	// 			isActive: true,
	// 			createdAt: "2023-01-01",
	// 			updatedAt: "2023-01-01",
	// 			createdBy: "admin",
	// 			updatedBy: "admin",
	// 		},
	// 	];

	// 	const mockTeams: Team[] = [
	// 		{
	// 			id: "1",
	// 			name: "Equipe A",
	// 			code: "EQ-A",
	// 			isActive: true,
	// 			createdAt: "",
	// 			updatedAt: "",
	// 			createdBy: "",
	// 			updatedBy: "",
	// 		},
	// 		{
	// 			id: "2",
	// 			name: "Equipe B",
	// 			code: "EQ-B",
	// 			isActive: true,
	// 			createdAt: "",
	// 			updatedAt: "",
	// 			createdBy: "",
	// 			updatedBy: "",
	// 		},
	// 		{
	// 			id: "3",
	// 			name: "Equipe C",
	// 			code: "EQ-C",
	// 			isActive: true,
	// 			createdAt: "",
	// 			updatedAt: "",
	// 			createdBy: "",
	// 			updatedBy: "",
	// 		},
	// 	];

	// 	// setSectors(mockSectors);
	// 	// setTeams(mockTeams);
	// };

	// Filtrar usuários
	useEffect(() => {
		let filtered = users;

		// Filtrar por tipo de usuário (baseado apenas no userType)
		if (userTypeFilter !== "all") {
			filtered = filtered.filter((u) => u.userType === userTypeFilter);
		}

		// Filtrar por termo de busca
		if (searchTerm.trim()) {
			filtered = filtered.filter(
				(u) =>
					u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
					(u.company || "").toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		setFilteredUsers(filtered);
	}, [users, searchTerm, userTypeFilter]);

	const loadUsers = async () => {
		try {
			setLoading(true);
			const usersList = await listAllUsers();
			setUsers(usersList);
		} catch (err) {
			console.error("Erro ao carregar usuários:", err);
			setError("Erro ao carregar lista de usuários");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (error) setError(null);
	};

	// Função para formatar telefone
	const formatPhone = (value: string): string => {
		// Remove todos os caracteres não numéricos
		const numbers = value.replace(/\D/g, '');
		
		// Aplica a formatação baseada no tamanho
		if (numbers.length <= 2) {
			return numbers;
		} else if (numbers.length <= 7) {
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
		} else if (numbers.length <= 11) {
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
		} else {
			// Limita a 11 dígitos
			return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const formattedPhone = formatPhone(value);
		setFormData((prev) => ({ ...prev, phone: formattedPhone }));
		if (error) setError(null);
	};

	const validateForm = async (): Promise<boolean> => {
		if (!formData.email || !formData.name) {
			setError("E-mail e nome são obrigatórios");
			return false;
		}

		if (!editingUser && !formData.password) {
			setError("Senha é obrigatória para novos usuários");
			return false;
		}

		if (formData.password && formData.password !== formData.confirmPassword) {
			setError("As senhas não coincidem");
			return false;
		}

		if (formData.password && formData.password.length < 6) {
			setError("A senha deve ter pelo menos 6 caracteres");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setError("E-mail inválido");
			return false;
		}

		// Verificar se email já existe (apenas para novos usuários)
		if (!editingUser) {
			try {
				const emailExists = await isEmailAlreadyUsed(formData.email);
				if (emailExists) {
					setError("E-mail já está em uso");
					return false;
				}
			} catch (err) {
				setError("Erro ao verificar disponibilidade do email");
				return false;
			}
		}

		// Validações específicas para operadores
		if (formData.userType === "operator") {
			if (!formData.code || !formData.code.trim()) {
				setError("Código/Matrícula é obrigatório para operadores");
				return false;
			}

			// Verificar se código já existe (apenas para novos usuários)
			if (!editingUser) {
				try {
					const codeExists = await isCodeAlreadyUsed(formData.code);
					if (codeExists) {
						setError("Código/Matrícula já está em uso");
						return false;
					}
				} catch (err) {
					setError("Erro ao verificar disponibilidade do código");
					return false;
				}
			}

			if (!formData.primarySectorId) {
				setError("Setor primário é obrigatório para operadores");
				return false;
			}

			if (!formData.admissionDate) {
				setError("Data de admissão é obrigatória para operadores");
				return false;
			}

			if (!formData.weeklyHours || formData.weeklyHours <= 0) {
				setError("Horas semanais devem ser maiores que 0");
				return false;
			}
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		const isValid = await validateForm();
		if (!isValid) return;

		setFormLoading(true);
		setError(null);

		try {
			if (editingUser) {
				// Atualizar usuário existente
				const updateData: UpdateUserData = {
					name: formData.name,
					displayName: formData.displayName || formData.name,
					company: formData.company,
					phone: formData.phone,
					userType: formData.userType,
					role: formData.role,
				};

				const result = await updateUser(editingUser.id, updateData);
				
				if (result.success) {
					setSuccess(true);
					resetForm();
					await loadUsers();
				} else {
					setError(result.error || "Erro ao atualizar usuário");
				}
			} else {
				// Criar novo usuário
				const createData: CreateUserData = {
					email: formData.email,
					name: formData.name,
					displayName: formData.displayName || formData.name,
					company: formData.company,
					phone: formData.phone,
					password: formData.password,
					userType: formData.userType,
					role: formData.role,
				};

				const result = await createUser(createData);
				
				if (result.success) {
					setSuccess(true);
					resetForm();
					await loadUsers();
				} else {
					setError(result.error || "Erro ao criar usuário");
				}
			}
		} catch (err) {
			console.error("Erro ao salvar usuário:", err);
			setError("Erro ao salvar usuário. Tente novamente.");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (userId: string) => {
		if (!confirm("Tem certeza que deseja remover este usuário?")) return;
		
		try {
			const result = await deleteUser(userId);
			
			if (result.success) {
				await loadUsers();
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
			} else {
				setError(result.error || "Erro ao remover usuário");
			}
		} catch (err) {
			console.error("Erro ao remover usuário:", err);
			setError("Erro ao remover usuário");
		}
	};

	const handleEdit = (userToEdit: User) => {
		setEditingUser(userToEdit);
		setFormData({
			email: userToEdit.email,
			name: userToEdit.name,
			displayName: userToEdit.displayName || "",
			company: userToEdit.company || "",
			phone: userToEdit.phone || "",
			password: "",
			confirmPassword: "",
			userType: userToEdit.userType,
			role: userToEdit.role as UserRole,
			// Campos específicos de operador
			code: userToEdit.operatorData?.code || "",
			primarySectorId: userToEdit.operatorData?.primarySectorId || "",
			secondarySectorIds: userToEdit.operatorData?.secondarySectorIds || [],
			skills: userToEdit.operatorData?.skills || [],
			admissionDate: userToEdit.operatorData?.admissionDate || "",
			contractType: userToEdit.operatorData?.contractType || "clt",
			workSchedule: userToEdit.operatorData?.workSchedule || "day",
			weeklyHours: userToEdit.operatorData?.weeklyHours || 40,
			supervisorId: userToEdit.operatorData?.supervisorId || "",
			teamId: userToEdit.operatorData?.teamId || "",
			status: userToEdit.operatorData?.status || "active",
			lastTrainingDate: userToEdit.operatorData?.lastTrainingDate || "",
			nextTrainingDate: userToEdit.operatorData?.nextTrainingDate || "",
			newSkill: "",
		});
		setModalOpen(true);
	};

	const resetForm = () => {
		setFormData({
			email: "",
			name: "",
			displayName: "",
			company: "",
			phone: "",
			password: "",
			confirmPassword: "",
			userType: "operator",
			role: "operator",
			// Campos específicos de operador
			code: "",
			primarySectorId: "",
			secondarySectorIds: [],
			skills: [],
			admissionDate: "",
			contractType: "clt",
			workSchedule: "day",
			weeklyHours: 40,
			supervisorId: "",
			teamId: "",
			status: "active",
			lastTrainingDate: "",
			nextTrainingDate: "",
			newSkill: "",
		});
		setEditingUser(null);
		setError(null);
		// setNewSkill("");
		setTimeout(() => setSuccess(false), 3000);
	};

	const handleCancel = () => {
		resetForm();
		setModalOpen(false);
	};

	const openCreateModal = () => {
		resetForm();
		setModalOpen(true);
	};

	// Funções para gerenciar habilidades
	const addSkill = () => {
		if (formData.newSkill?.trim() && !formData.skills?.includes(formData.newSkill.trim())) {
			setFormData((prev) => ({
				...prev,
				skills: [...(prev.skills || []), prev.newSkill?.trim() || ""],
				newSkill: "",
			}));
		}
	};

	const removeSkill = (skillToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			skills: (prev.skills || []).filter((skill) => skill !== skillToRemove),
		}));
	};

	const getRoleBadgeClass = (userType: string) => {
		switch (userType) {
			case "admin": return "role-admin";
			case "operator": return "role-operator";
			case "user": return "role-user";
			default: return "role-user";
		}
	};

	const getRoleText = (userType: string) => {
		// Baseado apenas no userType
		switch (userType) {
			case "admin": return "Administrador";
			case "operator": return "Operador";
			case "user": return "Usuário";
			default: return "Usuário";
		}
	};

	return (
		<div className="user-creation-page">
			<div className="user-creation-container">
				<div className="user-creation-header">
					<div className="header-content">
						<h1>
							<FaUsers className="header-icon" />
							Gerenciar Usuários
						</h1>
						<p>
							Visualize, crie, edite e remova usuários do sistema
						</p>
					</div>
				</div>

				{error && (
					<div className="error-message">
						<FaTimes />
						{error}
					</div>
				)}

				{success && (
					<div className="success-message">
						<FaSave />
						Operação realizada com sucesso!
					</div>
				)}

				<div className="users-section">
					<div className="search-container">
						<div className="search-input-wrapper">
							<FaSearch className="search-icon" />
							<input
								type="text"
								placeholder="Buscar por nome, e-mail ou empresa..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="search-input"
							/>
						</div>
						<div className="filter-wrapper">
							<select
								value={userTypeFilter}
								onChange={(e) => setUserTypeFilter(e.target.value)}
								className="user-type-filter"
							>
								<option value="all">Todos os tipos</option>
								<option value="admin">Administradores</option>
								<option value="operator">Operadores</option>
								<option value="user">Usuários</option>
							</select>
						</div>
						<div className="search-actions">
							<Button onClick={openCreateModal}>
								<FaUserPlus />
								Criar Usuário
							</Button>
						</div>
					</div>

					{loading ? (
						<div className="loading-container">
							<div className="spinner"></div>
							<p>Carregando usuários...</p>
						</div>
					) : (
						<div className="users-table">
							<div className="table-header">
								<div>Nome</div>
								<div>E-mail</div>
								<div>Empresa</div>
								<div>Telefone</div>
								<div>Papel</div>
								<div>Ações</div>
							</div>

							{filteredUsers.length === 0 ? (
								<div className="empty-state">
									<FaUsers />
									<p>Nenhum usuário encontrado</p>
								</div>
							) : (
								filteredUsers.map((u) => (
									<div key={u.id} className="table-row">
										<div className="user-info">
											<div className="user-avatar">
												{u.name?.charAt(0)?.toUpperCase() || "U"}
											</div>
											<div>
												<div className="user-name">{u.name || u.displayName || "—"}</div>
												<div className="user-type">{u.userType}</div>
											</div>
										</div>
										<div className="email-cell">
											<FaEnvelope />
											{u.email}
										</div>
										<div className="company-cell">
											<FaBuilding />
											{u.company || "—"}
										</div>
										<div className="phone-cell">
											<FaPhone />
											{u.phone || "—"}
										</div>
										<div className="role-cell">
											<span className={`role-badge ${getRoleBadgeClass(u.userType)}`}>
												<FaUserTag />
												{getRoleText(u.userType)}
											</span>
										</div>
										<div className="actions-cell">
											<button
												className="action-btn edit-btn"
												onClick={() => handleEdit(u)}
												title="Editar usuário"
											>
												<FaEdit />
											</button>
											<button
												className="action-btn delete-btn"
												onClick={() => handleDelete(u.id)}
												title="Remover usuário"
											>
												<FaTrash />
											</button>
										</div>
									</div>
								))
							)}
						</div>
					)}
				</div>

				{/* Modal de Criação/Edição */}
				{modalOpen && (
					<div className="modal-overlay">
						<div className="modal">
							<div className="modal-header">
								<h2>
									{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}
								</h2>
								<button className="close-btn" onClick={handleCancel}>
									<FaTimes />
								</button>
							</div>
							<div className="modal-body">
								<form onSubmit={handleSubmit} className="user-form">
									<div className="form-section">
										<h3>Informações Pessoais</h3>
										<div className="form-grid">
											<div className="form-group">
												<label>Nome Completo *</label>
												<Input
													type="text"
													name="name"
													value={formData.name}
													onChange={handleChange}
													placeholder="Digite o nome completo"
													required
													disabled={formLoading}
												/>
											</div>

											<div className="form-group">
												<label>Nome de Exibição</label>
												<Input
													type="text"
													name="displayName"
													value={formData.displayName}
													onChange={handleChange}
													placeholder="Nome para exibição (opcional)"
													disabled={formLoading}
												/>
											</div>

											<div className="form-group">
												<label>E-mail *</label>
												<Input
													type="email"
													name="email"
													value={formData.email}
													onChange={handleChange}
													placeholder="Digite o e-mail"
													required
													disabled={formLoading}
												/>
											</div>

											<div className="form-group">
												<label>Telefone</label>
												<Input
													type="tel"
													name="phone"
													value={formData.phone}
													onChange={handlePhoneChange}
													placeholder="(11) 99999-9999"
													disabled={formLoading}
												/>
											</div>

											<div className="form-group">
												<label>Empresa</label>
												<Input
													type="text"
													name="company"
													value={formData.company}
													onChange={handleChange}
													placeholder="Nome da empresa"
													disabled={formLoading}
												/>
											</div>
										</div>
									</div>

									<div className="form-section">
										<h3>Configurações de Acesso</h3>
										<div className="form-grid">
											<div className="form-group">
												<label>Tipo de Usuário</label>
												<select
													name="userType"
													value={formData.userType}
													onChange={handleChange}
													disabled={formLoading}
												>
													<option value="user">Usuário Padrão</option>
													<option value="operator">Operador</option>
													<option value="admin">Administrador</option>
												</select>
											</div>

											<div className="form-group">
												<label>Papel/Função</label>
												<select
													name="role"
													value={formData.role}
													onChange={handleChange}
													disabled={formLoading}
												>
													<option value="operator">Operador</option>
													<option value="admin">Administrador</option>
												</select>
											</div>

											{!editingUser && (
												<>
													<div className="form-group">
														<label>Senha *</label>
														<Input
															type="password"
															name="password"
															value={formData.password}
															onChange={handleChange}
															placeholder="Mínimo 6 caracteres"
															required={!editingUser}
															disabled={formLoading}
														/>
													</div>

													<div className="form-group">
														<label>Confirmar Senha *</label>
														<Input
															type="password"
															name="confirmPassword"
															value={formData.confirmPassword}
															onChange={handleChange}
															placeholder="Digite a senha novamente"
															required={!editingUser}
															disabled={formLoading}
														/>
													</div>
												</>
											)}
										</div>
									</div>

									{/* Campos específicos para operadores */}
									{formData.role === "operator" && (
										<div className="form-section">
											<h3>Dados do Operador</h3>
											<div className="form-grid">
												<div className="form-group">
													<label>Código/Matrícula *</label>
													<Input
														type="text"
														name="code"
														value={formData.code || ""}
														onChange={handleChange}
														placeholder="Ex: OP001"
														required
														disabled={formLoading}
													/>
												</div>

												<div className="form-group">
													<label>Data de Admissão *</label>
													<Input
														type="date"
														name="admissionDate"
														value={formData.admissionDate || ""}
														onChange={handleChange}
														placeholder=""
														required
														disabled={formLoading}
													/>
												</div>

												<div className="form-group">
													<label>Setor Primário *</label>
													<select
														name="primarySectorId"
														value={formData.primarySectorId || ""}
														onChange={handleChange}
														required
														disabled={formLoading}
													>
														<option value="">Selecione um setor</option>
														<option value="corte">Corte</option>
														<option value="montagem">Montagem</option>
														<option value="acabamento">Acabamento</option>
														<option value="embalagem">Embalagem</option>
													</select>
												</div>

												<div className="form-group">
													<label>Status *</label>
													<select
														name="status"
														value={formData.status || "active"}
														onChange={handleChange}
														required
														disabled={formLoading}
													>
														<option value="active">Ativo</option>
														<option value="inactive">Inativo</option>
														<option value="suspended">Suspenso</option>
														<option value="on_leave">Afastado</option>
													</select>
												</div>

												<div className="form-group">
													<label>Tipo de Contrato *</label>
													<select
														name="contractType"
														value={formData.contractType || "clt"}
														onChange={handleChange}
														required
														disabled={formLoading}
													>
														<option value="clt">CLT</option>
														<option value="pj">PJ</option>
														<option value="temporary">Temporário</option>
														<option value="intern">Estagiário</option>
													</select>
												</div>

												<div className="form-group">
													<label>Turno de Trabalho *</label>
													<select
														name="workSchedule"
														value={formData.workSchedule || "day"}
														onChange={handleChange}
														required
														disabled={formLoading}
													>
														<option value="day">Diurno</option>
														<option value="night">Noturno</option>
														<option value="rotating">Rotativo</option>
														<option value="flexible">Flexível</option>
													</select>
												</div>

												<div className="form-group">
													<label>Horas Semanais *</label>
													<Input
														type="number"
														name="weeklyHours"
														value={String(formData.weeklyHours || 40)}
														onChange={handleChange}
														placeholder="40"
														required
														disabled={formLoading}
													/>
												</div>

												<div className="form-group">
													<label>Data do Último Treinamento</label>
													<Input
														type="date"
														name="lastTrainingDate"
														value={formData.lastTrainingDate || ""}
														onChange={handleChange}
														placeholder=""
														disabled={formLoading}
													/>
												</div>

												<div className="form-group">
													<label>Próximo Treinamento</label>
													<Input
														type="date"
														name="nextTrainingDate"
														value={formData.nextTrainingDate || ""}
														onChange={handleChange}
														placeholder=""
														disabled={formLoading}
													/>
												</div>
											</div>

											<div className="form-group">
												<label>Habilidades/Competências</label>
												<div className="skills-container">
													<div className="skills-input">
														<Input
															type="text"
															name="newSkill"
															placeholder="Digite uma habilidade"
															value={formData.newSkill || ""}
															onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
															disabled={formLoading}
														/>
														<Button
															type="button"
															onClick={addSkill}
															disabled={formLoading || !formData.newSkill?.trim()}
														>
															<FaPlus />
															Adicionar
														</Button>
													</div>
													{formData.skills && formData.skills.length > 0 && (
														<div className="skills-list">
															{formData.skills.map((skill, index) => (
																<span key={index} className="skill-tag">
																	{skill}
																	<button
																		type="button"
																		onClick={() => removeSkill(skill)}
																		className="remove-skill"
																	>
																		<FaTimes />
																	</button>
																</span>
															))}
														</div>
													)}
												</div>
											</div>
										</div>
									)}

									<div className="form-actions">
										<Button
											type="button"
											variant="outline"
											onClick={handleCancel}
											disabled={formLoading}
										>
											<FaTimes />
											Cancelar
										</Button>
										<Button
											type="submit"
											disabled={formLoading}
										>
											<FaSave />
											{formLoading ? "Salvando..." : editingUser ? "Salvar" : "Criar Usuário"}
										</Button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
