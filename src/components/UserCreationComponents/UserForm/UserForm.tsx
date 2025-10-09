import React, { memo, useCallback } from 'react';
import { FaTimes, FaSave, FaPlus } from "react-icons/fa";
import Button from "../../Button/Button";
import Input from "../../Input/Input";
import type { User, UserRole } from "../../../types";

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

interface UserFormProps {
	formData: UserFormData;
	formErrors: Record<string, string>;
	formLoading: boolean;
	editingUser: User | null;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	onAddSkill: () => void;
	onRemoveSkill: (skill: string) => void;
	onNewSkillChange: (value: string) => void;
}

const UserForm = memo<UserFormProps>(({
	formData,
	formErrors,
	formLoading,
	editingUser,
	onChange,
	onPhoneChange,
	onSubmit,
	onCancel,
	onAddSkill,
	onRemoveSkill,
	onNewSkillChange
}) => {
	const handleNewSkillChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		onNewSkillChange(e.target.value);
	}, [onNewSkillChange]);

	return (
		<form onSubmit={onSubmit} className="user-form">
			<div className="form-section">
				<h3>Informações Pessoais</h3>
				<div className="form-grid">
					<div className="form-group">
						<label>Nome Completo *</label>
						<Input
							type="text"
							name="name"
							value={formData.name}
							onChange={onChange}
							placeholder="Digite o nome completo"
							required
							disabled={formLoading}
						/>
						{formErrors.name && (
							<div className="field-error">
								{formErrors.name}
							</div>
						)}
					</div>

					<div className="form-group">
						<label>Nome de Exibição</label>
						<Input
							type="text"
							name="displayName"
							value={formData.displayName}
							onChange={onChange}
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
							onChange={onChange}
							placeholder="Digite o e-mail"
							required
							disabled={formLoading}
						/>
						{formErrors.email && (
							<div className="field-error">
								{formErrors.email}
							</div>
						)}
					</div>

					<div className="form-group">
						<label>Telefone</label>
						<Input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={onPhoneChange}
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
							onChange={onChange}
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
							onChange={onChange}
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
							onChange={onChange}
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
									onChange={onChange}
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
									onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
								onChange={onChange}
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
									onChange={handleNewSkillChange}
									disabled={formLoading}
								/>
								<Button
									type="button"
									onClick={onAddSkill}
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
												onClick={() => onRemoveSkill(skill)}
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
					onClick={onCancel}
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
	);
});

UserForm.displayName = 'UserForm';

export default UserForm;
