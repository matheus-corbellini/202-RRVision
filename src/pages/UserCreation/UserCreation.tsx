"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { 
	createUser, 
	listAllUsers, 
	deleteUser, 
	updateUser,
	type CreateUserData,
	type UpdateUserData 
} from "../../services/userCreationService";
import { 
	FaUsers,
	FaTimes, 
	FaSave, 
	FaExclamationTriangle,
	FaTrash
} from "react-icons/fa";
import Button from "../../components/Button/Button";
import type { User } from "../../types";
import { useUserForm } from "../../hooks/useUserForm";
import { useFormValidation } from "../../hooks/useFormValidation";
import { useDebounce } from "../../hooks/useDebounce";
import "./UserCreation.css";

// Lazy loading para componentes pesados
const UserTable = lazy(() => import("../../components/UserCreationComponents/UserTable/UserTable"));
const UserForm = lazy(() => import("../../components/UserCreationComponents/UserForm/UserForm"));
const SearchBar = lazy(() => import("../../components/UserCreationComponents/SearchBar/SearchBar"));
const Pagination = lazy(() => import("../../components/UserCreationComponents/Pagination/Pagination"));

// Interfaces movidas para hooks personalizados

type SortField = 'name' | 'email' | 'company' | 'userType' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function UserCreation() {
	// Estado principal
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Hooks personalizados
	const {
		formData,
		formErrors,
		formLoading,
		editingUser,
		setField,
		clearAllErrors,
		setLoading: setFormLoading,
		setEditingUser,
		resetForm,
		addSkill,
		removeSkill,
		setNewSkill,
		handleChange,
		handlePhoneChange,
	} = useUserForm();

	const { validateForm } = useFormValidation();
	
	// Debounce para busca
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Carregar usuários
	useEffect(() => {
		loadUsers();
	}, []);

	// Filtrar e ordenar usuários com useMemo para performance
	const filteredAndSortedUsers = useMemo(() => {
		let filtered = users;

		// Filtrar por tipo de usuário
		if (userTypeFilter !== "all") {
			filtered = filtered.filter((u) => u.userType === userTypeFilter);
		}

		// Filtrar por termo de busca (usando debouncedSearchTerm)
		if (debouncedSearchTerm.trim()) {
			filtered = filtered.filter(
				(u) =>
					u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					(u.name || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					(u.company || "").toLowerCase().includes(debouncedSearchTerm.toLowerCase())
			);
		}

		// Ordenar
		filtered.sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortField) {
				case 'name':
					aValue = (a.name || "").toLowerCase();
					bValue = (b.name || "").toLowerCase();
					break;
				case 'email':
					aValue = a.email.toLowerCase();
					bValue = b.email.toLowerCase();
					break;
				case 'company':
					aValue = (a.company || "").toLowerCase();
					bValue = (b.company || "").toLowerCase();
					break;
				case 'userType':
					aValue = a.userType.toLowerCase();
					bValue = b.userType.toLowerCase();
					break;
				case 'createdAt':
					aValue = new Date(a.createdAt).getTime();
					bValue = new Date(b.createdAt).getTime();
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [users, debouncedSearchTerm, userTypeFilter, sortField, sortDirection]);

	// Paginação
	const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;

	// Reset página quando filtros mudam
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm, userTypeFilter, sortField, sortDirection]);

	const loadUsers = useCallback(async () => {
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
	}, []);

	// Funções movidas para hooks personalizados

	const handleValidateForm = useCallback(async (): Promise<boolean> => {
		const validation = await validateForm(formData, editingUser);
		
		if (!validation.isValid) {
			// Set first error as main error
			const firstError = Object.values(validation.errors)[0];
			setError(firstError);
			return false;
		}
		
		clearAllErrors();
		return true;
	}, [formData, editingUser, validateForm, setError, clearAllErrors]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		
		const isValid = await handleValidateForm();
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
	}, [formData, editingUser, handleValidateForm, setFormLoading, setError, setSuccess, resetForm, loadUsers]);

	const handleDeleteClick = useCallback((user: User) => {
		setDeleteConfirmModal({ isOpen: true, user });
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!deleteConfirmModal.user) return;
		
		try {
			const result = await deleteUser(deleteConfirmModal.user.id);
			
			if (result.success) {
				await loadUsers();
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
				setDeleteConfirmModal({ isOpen: false, user: null });
			} else {
				setError(result.error || "Erro ao remover usuário");
			}
		} catch (err) {
			console.error("Erro ao remover usuário:", err);
			setError("Erro ao remover usuário");
		}
	}, [deleteConfirmModal.user, loadUsers, setSuccess, setError]);

	const handleDeleteCancel = useCallback(() => {
		setDeleteConfirmModal({ isOpen: false, user: null });
	}, []);

	const handleEdit = useCallback((userToEdit: User) => {
		setEditingUser(userToEdit);
		setField('email', userToEdit.email);
		setField('name', userToEdit.name);
		setField('displayName', userToEdit.displayName || "");
		setField('company', userToEdit.company || "");
		setField('phone', userToEdit.phone || "");
		setField('password', "");
		setField('confirmPassword', "");
		setField('userType', userToEdit.userType);
		setField('role', userToEdit.role);
		// Campos específicos de operador
		setField('code', userToEdit.operatorData?.code || "");
		setField('primarySectorId', userToEdit.operatorData?.primarySectorId || "");
		setField('secondarySectorIds', userToEdit.operatorData?.secondarySectorIds || []);
		setField('skills', userToEdit.operatorData?.skills || []);
		setField('admissionDate', userToEdit.operatorData?.admissionDate || "");
		setField('contractType', userToEdit.operatorData?.contractType || "clt");
		setField('workSchedule', userToEdit.operatorData?.workSchedule || "day");
		setField('weeklyHours', userToEdit.operatorData?.weeklyHours || 40);
		setField('supervisorId', userToEdit.operatorData?.supervisorId || "");
		setField('teamId', userToEdit.operatorData?.teamId || "");
		setField('status', userToEdit.operatorData?.status || "active");
		setField('lastTrainingDate', userToEdit.operatorData?.lastTrainingDate || "");
		setField('nextTrainingDate', userToEdit.operatorData?.nextTrainingDate || "");
		setField('newSkill', "");
		setModalOpen(true);
	}, [setEditingUser, setField]);

	const handleCancel = useCallback(() => {
		resetForm();
		setModalOpen(false);
	}, [resetForm]);

	const openCreateModal = useCallback(() => {
		resetForm();
		setModalOpen(true);
	}, [resetForm]);

	// Funções movidas para hooks personalizados

	// Funções de ordenação
	const handleSort = useCallback((field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('asc');
		}
	}, [sortField, sortDirection]);

	// Funções de paginação
	const goToPage = useCallback((page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	}, [totalPages]);

	const goToPreviousPage = useCallback(() => {
		setCurrentPage(prev => Math.max(1, prev - 1));
	}, []);

	const goToNextPage = useCallback(() => {
		setCurrentPage(prev => Math.min(totalPages, prev + 1));
	}, [totalPages]);

	// Handlers para busca e filtros
	const handleSearchChange = useCallback((value: string) => {
		setSearchTerm(value);
	}, []);

	const handleFilterChange = useCallback((value: string) => {
		setUserTypeFilter(value);
	}, []);

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
					<Suspense fallback={<div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>}>
						<SearchBar
							searchTerm={searchTerm}
							userTypeFilter={userTypeFilter}
							onSearchChange={handleSearchChange}
							onFilterChange={handleFilterChange}
							onCreateUser={openCreateModal}
						/>
					</Suspense>

					<Suspense fallback={<div className="loading-container"><div className="spinner"></div><p>Carregando...</p></div>}>
						<UserTable
							users={filteredAndSortedUsers}
							loading={loading}
							onEdit={handleEdit}
							onDelete={handleDeleteClick}
							onSort={handleSort}
							sortField={sortField}
							sortDirection={sortDirection}
							useVirtualization={true}
							virtualizationThreshold={50}
						/>
					</Suspense>

					{/* Paginação apenas para listas pequenas */}
					{filteredAndSortedUsers.length <= 50 && (
						<Suspense fallback={<div></div>}>
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								startIndex={startIndex}
								itemsPerPage={itemsPerPage}
								totalItems={filteredAndSortedUsers.length}
								onPageChange={goToPage}
								onPreviousPage={goToPreviousPage}
								onNextPage={goToNextPage}
							/>
						</Suspense>
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
								<Suspense fallback={<div className="loading-container"><div className="spinner"></div><p>Carregando formulário...</p></div>}>
									<UserForm
										formData={formData}
										formErrors={formErrors}
										formLoading={formLoading}
										editingUser={editingUser}
										onChange={handleChange}
										onPhoneChange={handlePhoneChange}
										onSubmit={handleSubmit}
										onCancel={handleCancel}
										onAddSkill={addSkill}
										onRemoveSkill={removeSkill}
										onNewSkillChange={setNewSkill}
									/>
								</Suspense>
							</div>
						</div>
					</div>
				)}

				{/* Modal de Confirmação de Exclusão */}
				{deleteConfirmModal.isOpen && (
					<div className="modal-overlay">
						<div className="modal delete-confirm-modal">
							<div className="modal-header">
								<h2>
									<FaExclamationTriangle className="header-icon" style={{ color: '#e53e3e' }} />
									Confirmar Exclusão
								</h2>
								<button className="close-btn" onClick={handleDeleteCancel}>
									<FaTimes />
								</button>
							</div>
							<div className="modal-body">
								<div className="delete-confirm-content">
									<p>
										Tem certeza que deseja remover o usuário <strong>{deleteConfirmModal.user?.name}</strong>?
									</p>
									<p className="delete-warning">
										Esta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.
									</p>
								</div>
								<div className="form-actions">
									<Button
										type="button"
										variant="outline"
										onClick={handleDeleteCancel}
									>
										<FaTimes />
										Cancelar
									</Button>
									<button
										type="button"
										onClick={handleDeleteConfirm}
										className="danger-btn"
									>
										<FaTrash />
										Confirmar Exclusão
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
