"use client";

import { useState, useEffect } from "react";
import {
	FaUserPlus,
	FaIdCard,
	FaIndustry,
	FaGraduationCap,
	FaClock,
	FaUsers,
	FaEdit,
	FaTrash,
	FaPlus,
	FaTimes,
} from "react-icons/fa";
import Button from "../../components/Button/Button";
import {
	createOperatorWithUser,
	isCodeAlreadyUsed,
	isEmailAlreadyUsed,
	getAllOperatorsWithUsers,
	updateOperator,
	deleteOperatorAndUser,
	getUserByOperatorId,
	type OperatorRegistrationData,
	type Operator,
	type User,
} from "../../services/authService";
import "./OperatorRegistration.css";

// Interface simplificada para o formulário
interface OperatorFormData extends OperatorRegistrationData {
	notes?: string;
}

// Interface para setor
interface Sector {
	id: string;
	name: string;
	code: string;
	description: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

// Interface para equipe
interface Team {
	id: string;
	name: string;
	code: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export default function OperatorRegistration() {
	const [formData, setFormData] = useState<OperatorFormData>({
		// Dados do usuário
		email: "",
		name: "",
		displayName: "",
		company: "",
		phone: "",
		password: "",

		// Dados específicos do operador
		code: "",
		primarySectorId: "",
		secondarySectorIds: [],
		skills: [],
		status: "active",
		admissionDate: "",
		lastTrainingDate: "",
		nextTrainingDate: "",
		contractType: "clt",
		workSchedule: "day",
		weeklyHours: 40,
		supervisorId: "",
		teamId: "",
		notes: "",
	});

	const [operators, setOperators] = useState<Operator[]>([]);
	const [operatorsWithUsers, setOperatorsWithUsers] = useState<
		Array<{ operator: Operator; user: User }>
	>([]);
	const [sectors, setSectors] = useState<Sector[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [newSkill, setNewSkill] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

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

		// Carregar setores e equipes
		setSectors(mockSectors);
		setTeams(mockTeams);

		// Carregar operadores existentes usando o serviço
		const loadOperators = async () => {
			try {
				const operatorsWithUsersData = await getAllOperatorsWithUsers();
				setOperatorsWithUsers(operatorsWithUsersData);
				setOperators(operatorsWithUsersData.map((item) => item.operator));
			} catch (error) {
				console.log("Nenhum operador encontrado, iniciando com lista vazia");
				setOperators([]);
				setOperatorsWithUsers([]);
			}
		};

		loadOperators();
	}, []);

	const validateForm = async (): Promise<boolean> => {
		const newErrors: Record<string, string> = {};

		// Validações do usuário
		if (!formData.name.trim()) {
			newErrors.name = "Nome é obrigatório";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email é obrigatório";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Email inválido";
		} else {
			// Verificar se email já existe (apenas para novos registros)
			if (!isEditing) {
				const emailExists = await isEmailAlreadyUsed(formData.email);
				if (emailExists) {
					newErrors.email = "Este email já está em uso";
				}
			}
		}

		// Validações do operador
		if (!formData.code.trim()) {
			newErrors.code = "Código é obrigatório";
		} else {
			// Verificar se código já existe (apenas para novos registros)
			if (!isEditing) {
				const codeExists = await isCodeAlreadyUsed(formData.code);
				if (codeExists) {
					newErrors.code = "Este código já está em uso";
				}
			}
		}

		if (!formData.primarySectorId) {
			newErrors.primarySectorId = "Setor primário é obrigatório";
		}

		if (!formData.admissionDate) {
			newErrors.admissionDate = "Data de admissão é obrigatória";
		}

		if (formData.weeklyHours <= 0) {
			newErrors.weeklyHours = "Horas semanais devem ser maiores que 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!(await validateForm())) {
			return;
		}

		if (isEditing && editingId) {
			// Editar operador existente
			setOperators((prev) =>
				prev.map((op) =>
					op.id === editingId
						? { ...op, ...formData, updatedAt: new Date().toISOString() }
						: op
				)
			);
			setIsEditing(false);
			setEditingId(null);
		} else {
			try {
				// Criar novo usuário e operador seguindo a relação 1:1
				const { user, operator } = await createOperatorWithUser({
					...formData,
					password: formData.password || "senha123", // Usar senha do formulário ou padrão
				});

				setOperators((prev) => [...prev, operator]);
				setOperatorsWithUsers((prev) => [...prev, { operator, user }]);

				// Mostrar mensagem de sucesso
				alert(
					`Operador criado com sucesso!\n\nUsuário: ${user.email}\nSenha: ${
						formData.password || "senha123"
					}\n\nO operador pode usar essas credenciais para fazer login no sistema!`
				);
			} catch (error) {
				console.error("Erro ao criar operador:", error);
				alert(
					`Erro ao criar operador: ${
						error instanceof Error ? error.message : "Erro desconhecido"
					}`
				);
				return;
			}
		}

		// Limpar formulário
		setFormData({
			// Dados do usuário
			email: "",
			name: "",
			displayName: "",
			company: "",
			phone: "",
			password: "",

			// Dados específicos do operador
			code: "",
			primarySectorId: "",
			secondarySectorIds: [],
			skills: [],
			status: "active",
			admissionDate: "",
			lastTrainingDate: "",
			nextTrainingDate: "",
			contractType: "clt",
			workSchedule: "day",
			weeklyHours: 40,
			supervisorId: "",
			teamId: "",
			notes: "",
		});
	};

	const handleEdit = async (operator: Operator) => {
		try {
			// Buscar informações do usuário
			const user = await getUserByOperatorId(operator.id);

			setIsEditing(true);
			setEditingId(operator.id);
			setFormData({
				// Dados do usuário reais
				email: user?.email || "",
				name: user?.name || "",
				displayName: user?.displayName || "",
				company: user?.company || "",
				phone: user?.phone || "",
				password: "",

				// Dados específicos do operador
				code: operator.code,
				primarySectorId: operator.primarySectorId,
				secondarySectorIds: operator.secondarySectorIds,
				skills: operator.skills,
				status: operator.status as
					| "active"
					| "inactive"
					| "suspended"
					| "on_leave",
				admissionDate: operator.admissionDate,
				lastTrainingDate: operator.lastTrainingDate || "",
				nextTrainingDate: operator.nextTrainingDate || "",
				contractType: operator.contractType as
					| "clt"
					| "pj"
					| "temporary"
					| "intern",
				workSchedule: operator.workSchedule as
					| "day"
					| "night"
					| "rotating"
					| "flexible",
				weeklyHours: operator.weeklyHours,
				supervisorId: operator.supervisorId || "",
				teamId: operator.teamId || "",
				notes: "",
			});
		} catch (error) {
			console.error("Erro ao carregar dados para edição:", error);
			alert("Erro ao carregar dados para edição");
		}
	};

	const handleDelete = async (id: string) => {
		if (
			window.confirm(
				"Tem certeza que deseja excluir este operador e seu usuário associado?"
			)
		) {
			try {
				await deleteOperatorAndUser(id);
				setOperators((prev) => prev.filter((op) => op.id !== id));
				setOperatorsWithUsers((prev) =>
					prev.filter((item) => item.operator.id !== id)
				);
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

	const addSkill = () => {
		if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
			setFormData((prev) => ({
				...prev,
				skills: [...prev.skills, newSkill.trim()],
			}));
			setNewSkill("");
		}
	};

	const removeSkill = (skillToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			skills: prev.skills.filter((skill) => skill !== skillToRemove),
		}));
	};

	const getSectorName = (sectorId: string) => {
		return sectors.find((s) => s.id === sectorId)?.name || "N/A";
	};

	const getTeamName = (teamId?: string) => {
		if (!teamId) return "N/A";
		return teams.find((t) => t.id === teamId)?.name || "N/A";
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

	return (
		<div className="operator-registration-page">
			<div className="operator-registration-container">
				<div className="operator-registration-header">
					<div className="header-content">
						<h1>Cadastro de Operadores</h1>
						<p>Gerencie os operadores da produção e suas habilidades</p>
					</div>
				</div>

				<form className="registration-form" onSubmit={handleSubmit}>
					{/* Informações do Usuário */}
					<div className="form-section">
						<h3 className="section-title">
							<FaUserPlus className="section-icon" />
							Informações do Usuário
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Nome Completo *</label>
								<input
									type="text"
									className={`form-input ${errors.name ? "error" : ""}`}
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="Nome completo do operador"
								/>
								{errors.name && (
									<span className="form-error">{errors.name}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Email *</label>
								<input
									type="email"
									className={`form-input ${errors.email ? "error" : ""}`}
									value={formData.email}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, email: e.target.value }))
									}
									placeholder="email@empresa.com"
								/>
								{errors.email && (
									<span className="form-error">{errors.email}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Senha *</label>
								<input
									type="password"
									className="form-input"
									value={formData.password}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											password: e.target.value,
										}))
									}
									placeholder="Senha para login"
									required
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Nome de Exibição</label>
								<input
									type="text"
									className="form-input"
									value={formData.displayName}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											displayName: e.target.value,
										}))
									}
									placeholder="Nome para exibição"
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Empresa</label>
								<input
									type="text"
									className="form-input"
									value={formData.company}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											company: e.target.value,
										}))
									}
									placeholder="Nome da empresa"
								/>
							</div>

							<div className="form-group">
								<label className="form-label">Telefone</label>
								<input
									type="tel"
									className="form-input"
									value={formData.phone}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, phone: e.target.value }))
									}
									placeholder="(11) 99999-9999"
								/>
							</div>
						</div>
					</div>

					{/* Informações Básicas */}
					<div className="form-section">
						<h3 className="section-title">
							<FaIdCard className="section-icon" />
							Informações Básicas
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Código/Matrícula *</label>
								<input
									type="text"
									className={`form-input ${errors.code ? "error" : ""}`}
									value={formData.code}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, code: e.target.value }))
									}
									placeholder="Ex: OP001"
								/>
								{errors.code && (
									<span className="form-error">{errors.code}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Setor Primário *</label>
								<select
									className={`form-select ${
										errors.primarySectorId ? "error" : ""
									}`}
									value={formData.primarySectorId}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											primarySectorId: e.target.value,
										}))
									}
								>
									<option value="">Selecione um setor</option>
									{sectors.map((sector) => (
										<option key={sector.id} value={sector.id}>
											{sector.name}
										</option>
									))}
								</select>
								{errors.primarySectorId && (
									<span className="form-error">{errors.primarySectorId}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Setores Secundários</label>
								<select
									className="form-select"
									multiple
									value={formData.secondarySectorIds}
									onChange={(e) => {
										const selectedOptions = Array.from(
											e.target.selectedOptions,
											(option) => option.value
										);
										setFormData((prev) => ({
											...prev,
											secondarySectorIds: selectedOptions,
										}));
									}}
								>
									{sectors.map((sector) => (
										<option key={sector.id} value={sector.id}>
											{sector.name}
										</option>
									))}
								</select>
								<span className="form-help">
									Pressione Ctrl para selecionar múltiplos setores
								</span>
							</div>

							<div className="form-group">
								<label className="form-label">Data de Admissão *</label>
								<input
									type="date"
									className={`form-input ${
										errors.admissionDate ? "error" : ""
									}`}
									value={formData.admissionDate}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											admissionDate: e.target.value,
										}))
									}
								/>
								{errors.admissionDate && (
									<span className="form-error">{errors.admissionDate}</span>
								)}
							</div>
						</div>
					</div>

					{/* Habilidades e Treinamentos */}
					<div className="form-section">
						<h3 className="section-title">
							<FaGraduationCap className="section-icon" />
							Habilidades e Treinamentos
						</h3>
						<div className="form-group full-width">
							<label className="form-label">Habilidades</label>
							<div className="skills-container">
								{formData.skills.map((skill, index) => (
									<span key={index} className="skill-tag">
										{skill}
										<button type="button" onClick={() => removeSkill(skill)}>
											<FaTimes />
										</button>
									</span>
								))}
							</div>
							<div className="skill-input-group">
								<input
									type="text"
									className="form-input skill-input"
									value={newSkill}
									onChange={(e) => setNewSkill(e.target.value)}
									placeholder="Digite uma nova habilidade"
									onKeyPress={(e) =>
										e.key === "Enter" && (e.preventDefault(), addSkill())
									}
								/>
								<Button type="button" variant="outline" onClick={addSkill}>
									<FaPlus />
								</Button>
							</div>
						</div>
					</div>

					{/* Condições de Trabalho */}
					<div className="form-section">
						<h3 className="section-title">
							<FaClock className="section-icon" />
							Condições de Trabalho
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Tipo de Contrato</label>
								<select
									className="form-select"
									value={formData.contractType}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											contractType: e.target.value as
												| "clt"
												| "pj"
												| "temporary"
												| "intern",
										}))
									}
								>
									<option value="clt">CLT</option>
									<option value="pj">PJ</option>
									<option value="temporary">Temporário</option>
									<option value="intern">Estagiário</option>
								</select>
							</div>

							<div className="form-group">
								<label className="form-label">Turno de Trabalho</label>
								<select
									className="form-select"
									value={formData.workSchedule}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											workSchedule: e.target.value as
												| "day"
												| "night"
												| "rotating"
												| "flexible",
										}))
									}
								>
									<option value="day">Diurno</option>
									<option value="night">Noturno</option>
									<option value="rotating">Rotativo</option>
									<option value="flexible">Flexível</option>
								</select>
							</div>

							<div className="form-group">
								<label className="form-label">Horas Semanais *</label>
								<input
									type="number"
									className={`form-input ${errors.weeklyHours ? "error" : ""}`}
									value={formData.weeklyHours}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											weeklyHours: parseInt(e.target.value) || 0,
										}))
									}
									min="1"
									max="168"
								/>
								{errors.weeklyHours && (
									<span className="form-error">{errors.weeklyHours}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Equipe</label>
								<select
									className="form-select"
									value={formData.teamId}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, teamId: e.target.value }))
									}
								>
									<option value="">Sem equipe</option>
									{teams.map((team) => (
										<option key={team.id} value={team.id}>
											{team.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Status e Observações */}
					<div className="form-section">
						<h3 className="section-title">
							<FaIndustry className="section-icon" />
							Status e Observações
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Status</label>
								<select
									className="form-select"
									value={formData.status}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											status: e.target.value as
												| "active"
												| "inactive"
												| "suspended"
												| "on_leave",
										}))
									}
								>
									<option value="active">Ativo</option>
									<option value="inactive">Inativo</option>
									<option value="suspended">Suspenso</option>
									<option value="on_leave">Afastado</option>
								</select>
							</div>

							<div className="form-group full-width">
								<label className="form-label">Observações</label>
								<textarea
									className="form-textarea"
									value={formData.notes}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, notes: e.target.value }))
									}
									placeholder="Observações adicionais sobre o operador..."
								/>
							</div>
						</div>
					</div>

					<div className="form-actions">
						{isEditing && (
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setIsEditing(false);
									setEditingId(null);
									setFormData({
										// Dados do usuário
										email: "",
										name: "",
										displayName: "",
										company: "",
										phone: "",
										password: "",

										// Dados específicos do operador
										code: "",
										primarySectorId: "",
										secondarySectorIds: [],
										skills: [],
										status: "active",
										admissionDate: "",
										lastTrainingDate: "",
										nextTrainingDate: "",
										contractType: "clt",
										workSchedule: "day",
										weeklyHours: 40,
										supervisorId: "",
										teamId: "",
										notes: "",
									});
								}}
							>
								Cancelar
							</Button>
						)}
						<Button type="submit" variant="primary">
							{isEditing ? "Atualizar Operador" : "Cadastrar Operador"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
