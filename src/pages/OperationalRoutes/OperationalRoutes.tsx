"use client";

import { useState, useEffect } from "react";
import {
	FaRoute,
	FaBox,
	FaClock,
	FaTools,
	FaEdit,
	FaTrash,
	FaPlus,
	FaTimes,
	FaList,
	FaUser,
	FaIndustry,
} from "react-icons/fa";
import Button from "../../components/Button/Button";
import { useAuth } from "../../hooks/useAuth";
import {
	createOperationalRoute,
	updateOperationalRoute,
	deleteOperationalRoute,
	listAllOperationalRoutes,
	checkRouteExists,
} from "../../services/operationalRoutesService";
import type { OperationalRoute, Product, Step } from "../../types/operationalRoutes";
import "./OperationalRoutes.css";

// Interface para o formulário
interface RouteFormData {
	productId: string;
	version: string;
	status: "active" | "inactive" | "draft";
	primarySectorId: string;
	assignedOperatorId?: string;
	steps: Step[];
}

export default function OperationalRoutes() {
	const { user } = useAuth();
	const [formData, setFormData] = useState<RouteFormData>({
		productId: "",
		version: "1.0",
		status: "draft",
		primarySectorId: "",
		assignedOperatorId: "",
		steps: [],
	});

	const [routes, setRoutes] = useState<OperationalRoute[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [sectors, setSectors] = useState<any[]>([]);
	const [operators, setOperators] = useState<any[]>([]);
	const [newStep, setNewStep] = useState<Partial<Step>>({
		name: "",
		description: "",
		sequence: 1,
		standardTime: 0,
		setupTime: 0,
		equipment: "",
		requirements: [],
		notes: "",
		sectorId: "",
		operatorId: "",
	});
	const [newRequirement, setNewRequirement] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(false);

	// Carregar dados do Firebase
	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true);
				
				// Mock de produtos (em produção, isso viria de uma API de produtos)
				const mockProducts: Product[] = [
					{
						id: "1",
						code: "PROD001",
						name: "Produto A",
						description: "Descrição do produto A",
						category: "Categoria 1",
						isActive: true,
						createdAt: "2023-01-01",
						updatedAt: "2023-01-01",
						createdBy: "admin",
						updatedBy: "admin",
					},
					{
						id: "2",
						code: "PROD002",
						name: "Produto B",
						description: "Descrição do produto B",
						category: "Categoria 2",
						isActive: true,
						createdAt: "2023-01-01",
						updatedAt: "2023-01-01",
						createdBy: "admin",
						updatedBy: "admin",
					},
					{
						id: "3",
						code: "PROD003",
						name: "Produto C",
						description: "Descrição do produto C",
						category: "Categoria 1",
						isActive: true,
						createdAt: "2023-01-01",
						updatedAt: "2023-01-01",
						createdBy: "admin",
						updatedBy: "admin",
					},
				];

				// Mock de setores
				const mockSectors = [
					{ id: "1", name: "Corte", code: "CORTE" },
					{ id: "2", name: "Montagem", code: "MONT" },
					{ id: "3", name: "Acabamento", code: "ACAB" },
					{ id: "4", name: "Qualidade", code: "QUAL" },
					{ id: "5", name: "Preparação", code: "PREP" },
				];

				// Mock de operadores
				const mockOperators = [
					{ id: "1", name: "João Silva", code: "OP001" },
					{ id: "2", name: "Maria Santos", code: "OP002" },
					{ id: "3", name: "Carlos Mendes", code: "OP003" },
					{ id: "4", name: "Ana Oliveira", code: "OP004" },
				];

				setProducts(mockProducts);
				setSectors(mockSectors);
				setOperators(mockOperators);

				// Carregar roteiros do Firebase
				const routesData = await listAllOperationalRoutes();
				setRoutes(routesData);
			} catch (error) {
				console.error("Erro ao carregar dados:", error);
				alert("Erro ao carregar dados dos roteiros operacionais");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const validateForm = async (): Promise<boolean> => {
		const newErrors: Record<string, string> = {};

		if (!formData.productId) {
			newErrors.productId = "Produto é obrigatório";
		}

		if (!formData.primarySectorId) {
			newErrors.primarySectorId = "Setor primário é obrigatório";
		}

		if (!formData.version.trim()) {
			newErrors.version = "Versão é obrigatória";
		}

		// Validar formato da versão (ex: 1.0, 2.1, etc.)
		const versionRegex = /^\d+\.\d+$/;
		if (!versionRegex.test(formData.version)) {
			newErrors.version = "Formato de versão inválido. Use o formato X.Y (ex: 1.0, 2.1)";
		}

		if (formData.steps.length === 0) {
			newErrors.steps = "Pelo menos uma etapa é obrigatória";
		}

		// Validar etapas
		formData.steps.forEach((step, index) => {
			if (!step.name.trim()) {
				newErrors[`step${index}Name`] = `Nome da etapa ${index + 1} é obrigatório`;
			}
			if (step.standardTime <= 0) {
				newErrors[`step${index}StandardTime`] = `Tempo padrão da etapa ${index + 1} deve ser maior que 0`;
			}
			if (step.sequence <= 0) {
				newErrors[`step${index}Sequence`] = `Sequência da etapa ${index + 1} deve ser maior que 0`;
			}
			if (!step.sectorId) {
				newErrors[`step${index}SectorId`] = `Setor da etapa ${index + 1} é obrigatório`;
			}
		});

		// Validar sequência das etapas
		const sequences = formData.steps.map(step => step.sequence).sort((a, b) => a - b);
		for (let i = 0; i < sequences.length; i++) {
			if (sequences[i] !== i + 1) {
				newErrors.steps = "As etapas devem ter sequência sequencial (1, 2, 3, ...)";
				break;
			}
		}

		// Verificar se já existe um roteiro com a mesma versão para o produto (apenas para novos registros)
		if (!isEditing && formData.productId && formData.version) {
			try {
				const routeExists = await checkRouteExists(formData.productId, formData.version);
				if (routeExists) {
					newErrors.version = "Já existe um roteiro com esta versão para este produto";
				}
			} catch (error) {
				console.error("Erro ao verificar existência do roteiro:", error);
				newErrors.version = "Erro ao verificar versão existente";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			alert("Usuário não autenticado");
			return;
		}

		if (!(await validateForm())) {
			return;
		}

		const selectedProduct = products.find(p => p.id === formData.productId);
		if (!selectedProduct) {
			alert("Produto selecionado não encontrado");
			return;
		}

		const selectedSector = sectors.find(s => s.id === formData.primarySectorId);
		if (!selectedSector) {
			alert("Setor selecionado não encontrado");
			return;
		}

		// Calcular tempos totais
		const totalStandardTime = formData.steps.reduce((sum, step) => sum + step.standardTime, 0);
		const totalSetupTime = formData.steps.reduce((sum, step) => sum + step.setupTime, 0);

		try {
			setLoading(true);

			// Preparar dados para salvamento
			const routeData = {
				productId: formData.productId,
				productCode: selectedProduct.code,
				productName: selectedProduct.name,
				productDescription: selectedProduct.description,
				productCategory: selectedProduct.category,
				version: formData.version,
				status: formData.status,
				primarySectorId: formData.primarySectorId,
				assignedOperatorId: formData.assignedOperatorId || undefined,
				steps: formData.steps.map((step, index) => ({
					...step,
					sequence: index + 1, // Garantir sequência sequencial
				})),
				totalStandardTime,
				totalSetupTime,
				totalSteps: formData.steps.length,
				createdBy: user.id,
				updatedBy: user.id,
			};

			if (isEditing && editingId) {
				// Editar roteiro existente
				await updateOperationalRoute(editingId, routeData, user.id);

				// Atualizar estado local
				setRoutes((prev) =>
					prev.map((route) =>
						route.id === editingId
							? {
								...route,
								...routeData,
								updatedAt: new Date().toISOString(),
								updatedBy: user.id,
							}
							: route
					)
				);
				setIsEditing(false);
				setEditingId(null);
				alert("Roteiro operacional atualizado com sucesso!");
			} else {
				// Criar novo roteiro
				const newRouteId = await createOperationalRoute(routeData, user.id);

				// Criar objeto completo para o estado local
				const newRoute: OperationalRoute = {
					id: newRouteId,
					...routeData,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				};

				setRoutes((prev) => [newRoute, ...prev]); // Adicionar no início da lista
				alert("Roteiro operacional criado com sucesso!");
			}

			// Limpar formulário
			resetForm();
		} catch (error) {
			console.error("Erro ao salvar roteiro:", error);
			const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
			alert(`Erro ao salvar roteiro: ${errorMessage}`);
		} finally {
			setLoading(false);
		}
	};

	// Função para resetar o formulário
	const resetForm = () => {
		setFormData({
			productId: "",
			version: "1.0",
			status: "draft",
			primarySectorId: "",
			assignedOperatorId: "",
			steps: [],
		});
		setNewStep({
			name: "",
			description: "",
			sequence: 1,
			standardTime: 0,
			setupTime: 0,
			equipment: "",
			requirements: [],
			notes: "",
			sectorId: "",
			operatorId: "",
		});
		setNewRequirement("");
		setErrors({});
	};

	const handleEdit = (route: OperationalRoute) => {
		setIsEditing(true);
		setEditingId(route.id);
		setFormData({
			productId: route.productId,
			version: route.version,
			status: route.status,
			primarySectorId: route.primarySectorId,
			assignedOperatorId: route.assignedOperatorId,
			steps: route.steps,
		});
		// Scroll para o topo do formulário
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Tem certeza que deseja excluir este roteiro operacional?\n\nEsta ação não pode ser desfeita.")) {
			try {
				setLoading(true);
				await deleteOperationalRoute(id);
				setRoutes((prev) => prev.filter((route) => route.id !== id));
				alert("Roteiro operacional excluído com sucesso!");
			} catch (error) {
				console.error("Erro ao excluir roteiro:", error);
				const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
				alert(`Erro ao excluir roteiro: ${errorMessage}`);
			} finally {
				setLoading(false);
			}
		}
	};

	const addStep = () => {
		if (!newStep.name || !newStep.standardTime || newStep.standardTime <= 0 || !newStep.sectorId) {
			alert("Nome da etapa, tempo padrão e setor são obrigatórios");
			return;
		}

		// Validar se já existe uma etapa com o mesmo nome
		const stepExists = formData.steps.some(step => 
			step.name.toLowerCase() === (newStep.name || '').toLowerCase()
		);
		if (stepExists) {
			alert("Já existe uma etapa com este nome");
			return;
		}

		const step: Step = {
			id: Date.now().toString(),
			name: newStep.name.trim(),
			description: newStep.description?.trim() || "",
			sequence: formData.steps.length + 1,
			standardTime: newStep.standardTime,
			setupTime: newStep.setupTime || 0,
			equipment: newStep.equipment?.trim() || "",
			requirements: newStep.requirements || [],
			notes: newStep.notes?.trim() || "",
			sectorId: newStep.sectorId,
			operatorId: newStep.operatorId || undefined,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			createdBy: "current-user",
			updatedBy: "current-user",
		};

		setFormData((prev) => ({
			...prev,
			steps: [...prev.steps, step],
		}));

		// Limpar formulário de etapa
		setNewStep({
			name: "",
			description: "",
			sequence: formData.steps.length + 2,
			standardTime: 0,
			setupTime: 0,
			equipment: "",
			requirements: [],
			notes: "",
			sectorId: "",
			operatorId: "",
		});
		setNewRequirement("");
	};

	const removeStep = (stepId: string) => {
		setFormData((prev) => {
			const updatedSteps = prev.steps.filter((step) => step.id !== stepId);
			// Reordenar sequência das etapas restantes
			const reorderedSteps = updatedSteps.map((step, index) => ({
				...step,
				sequence: index + 1,
			}));
			
			return {
				...prev,
				steps: reorderedSteps,
			};
		});
	};

	const addRequirement = () => {
		if (newRequirement.trim() && !newStep.requirements?.includes(newRequirement.trim())) {
			setNewStep((prev) => ({
				...prev,
				requirements: [...(prev.requirements || []), newRequirement.trim()],
			}));
			setNewRequirement("");
		}
	};

	const removeRequirement = (requirementToRemove: string) => {
		setNewStep((prev) => ({
			...prev,
			requirements: (prev.requirements || []).filter((req) => req !== requirementToRemove),
		}));
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

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditingId(null);
		resetForm();
	};

	const getSectorName = (sectorId: string) => {
		return sectors.find(s => s.id === sectorId)?.name || "Setor não encontrado";
	};

	const getOperatorName = (operatorId?: string) => {
		if (!operatorId) return "Não atribuído";
		return operators.find(o => o.id === operatorId)?.name || "Operador não encontrado";
	};

	return (
		<div className="operational-routes-page">
			<div className="operational-routes-container">
				<div className="operational-routes-header">
					<div className="header-content">
						<h1>Cadastro de Roteiros Operacionais</h1>
						<p>Gerencie os roteiros de produção com produtos, etapas, tempo padrão e setup</p>
					</div>
				</div>

				<form className="registration-form" onSubmit={handleSubmit}>
					{/* Informações do Produto */}
					<div className="form-section">
						<h3 className="section-title">
							<FaBox className="section-icon" />
							Informações do Produto
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Produto *</label>
								<select
									className={`form-select ${errors.productId ? "error" : ""}`}
									value={formData.productId}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, productId: e.target.value }))
									}
								>
									<option value="">Selecione um produto</option>
									{products.map((product) => (
										<option key={product.id} value={product.id}>
											{product.code} - {product.name}
										</option>
									))}
								</select>
								{errors.productId && (
									<span className="form-error">{errors.productId}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Versão</label>
								<input
									type="text"
									className={`form-input ${errors.version ? "error" : ""}`}
									value={formData.version}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, version: e.target.value }))
									}
									placeholder="Ex: 1.0"
								/>
								{errors.version && (
									<span className="form-error">{errors.version}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Status</label>
								<select
									className="form-select"
									value={formData.status}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											status: e.target.value as "active" | "inactive" | "draft",
										}))
									}
								>
									<option value="draft">Rascunho</option>
									<option value="active">Ativo</option>
									<option value="inactive">Inativo</option>
								</select>
							</div>
						</div>
					</div>

					{/* Associações com Setor e Operador */}
					<div className="form-section">
						<h3 className="section-title">
							<FaIndustry className="section-icon" />
							Associações
						</h3>
						<div className="form-grid">
							<div className="form-group">
								<label className="form-label">Setor Primário *</label>
								<select
									className={`form-select ${errors.primarySectorId ? "error" : ""}`}
									value={formData.primarySectorId}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, primarySectorId: e.target.value }))
									}
								>
									<option value="">Selecione um setor</option>
									{sectors.map((sector) => (
										<option key={sector.id} value={sector.id}>
											{sector.code} - {sector.name}
										</option>
									))}
								</select>
								{errors.primarySectorId && (
									<span className="form-error">{errors.primarySectorId}</span>
								)}
							</div>

							<div className="form-group">
								<label className="form-label">Operador Atribuído</label>
								<select
									className="form-select"
									value={formData.assignedOperatorId}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, assignedOperatorId: e.target.value }))
									}
								>
									<option value="">Selecione um operador (opcional)</option>
									{operators.map((operator) => (
										<option key={operator.id} value={operator.id}>
											{operator.code} - {operator.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Etapas do Roteiro */}
					<div className="form-section">
						<h3 className="section-title">
							<FaRoute className="section-icon" />
							Etapas do Roteiro
						</h3>
						
						{/* Lista de etapas existentes */}
						{formData.steps.length > 0 && (
							<div className="steps-list">
								<h4>Etapas Configuradas:</h4>
								{formData.steps.map((step) => (
									<div key={step.id} className="step-item">
										<div className="step-header">
											<span className="step-sequence">{step.sequence}</span>
											<span className="step-name">{step.name}</span>
											<span className="step-times">
												<FaClock /> {formatTime(step.standardTime)} | <FaTools /> {formatTime(step.setupTime)}
											</span>
											<button
												type="button"
												className="remove-step-btn"
												onClick={() => removeStep(step.id)}
											>
												<FaTrash />
											</button>
										</div>
										<div className="step-details">
											<p><strong>Descrição:</strong> {step.description}</p>
											<p><strong>Equipamento:</strong> {step.equipment}</p>
											<p><strong>Setor:</strong> {getSectorName(step.sectorId)}</p>
											{step.operatorId && (
												<p><strong>Operador:</strong> {getOperatorName(step.operatorId)}</p>
											)}
											{step.requirements.length > 0 && (
												<p><strong>Requisitos:</strong> {step.requirements.join(", ")}</p>
											)}
											{step.notes && <p><strong>Notas:</strong> {step.notes}</p>}
										</div>
									</div>
								))}
							</div>
						)}

						{/* Formulário para nova etapa */}
						<div className="new-step-form">
							<h4>Adicionar Nova Etapa:</h4>
							<div className="form-grid">
								<div className="form-group">
									<label className="form-label">Nome da Etapa *</label>
									<input
										type="text"
										className="form-input"
										value={newStep.name}
										onChange={(e) =>
											setNewStep((prev) => ({ ...prev, name: e.target.value }))
										}
										placeholder="Nome da etapa"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Descrição</label>
									<input
										type="text"
										className="form-input"
										value={newStep.description}
										onChange={(e) =>
											setNewStep((prev) => ({ ...prev, description: e.target.value }))
										}
										placeholder="Descrição da etapa"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Tempo Padrão (minutos) *</label>
									<input
										type="number"
										className="form-input"
										value={newStep.standardTime}
										onChange={(e) =>
											setNewStep((prev) => ({
												...prev,
												standardTime: parseInt(e.target.value) || 0,
											}))
										}
										min="1"
										placeholder="Tempo em minutos"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Tempo de Setup (minutos)</label>
									<input
										type="number"
										className="form-input"
										value={newStep.setupTime}
										onChange={(e) =>
											setNewStep((prev) => ({
												...prev,
												setupTime: parseInt(e.target.value) || 0,
											}))
										}
										min="0"
										placeholder="Tempo de setup"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Equipamento</label>
									<input
										type="text"
										className="form-input"
										value={newStep.equipment}
										onChange={(e) =>
											setNewStep((prev) => ({ ...prev, equipment: e.target.value }))
										}
										placeholder="Equipamento necessário"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Sequência</label>
									<input
										type="number"
										className="form-input"
										value={newStep.sequence}
										onChange={(e) =>
											setNewStep((prev) => ({
												...prev,
												sequence: parseInt(e.target.value) || 1,
											}))
										}
										min="1"
										placeholder="Ordem da etapa"
									/>
								</div>

								<div className="form-group">
									<label className="form-label">Setor da Etapa *</label>
									<select
										className="form-select"
										value={newStep.sectorId}
										onChange={(e) =>
											setNewStep((prev) => ({ ...prev, sectorId: e.target.value }))
										}
									>
										<option value="">Selecione um setor</option>
										{sectors.map((sector) => (
											<option key={sector.id} value={sector.id}>
												{sector.code} - {sector.name}
											</option>
										))}
									</select>
								</div>

								<div className="form-group">
									<label className="form-label">Operador da Etapa</label>
									<select
										className="form-select"
										value={newStep.operatorId}
										onChange={(e) =>
											setNewStep((prev) => ({ ...prev, operatorId: e.target.value }))
										}
									>
										<option value="">Selecione um operador (opcional)</option>
										{operators.map((operator) => (
											<option key={operator.id} value={operator.id}>
												{operator.code} - {operator.name}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Requisitos */}
							<div className="form-group full-width">
								<label className="form-label">Requisitos</label>
								<div className="requirements-container">
									{(newStep.requirements || []).map((req, index) => (
										<span key={index} className="requirement-tag">
											{req}
											<button type="button" onClick={() => removeRequirement(req)}>
												<FaTimes />
											</button>
										</span>
									))}
								</div>
								<div className="requirement-input-group">
									<input
										type="text"
										className="form-input requirement-input"
										value={newRequirement}
										onChange={(e) => setNewRequirement(e.target.value)}
										placeholder="Digite um requisito"
										onKeyPress={(e) =>
											e.key === "Enter" && (e.preventDefault(), addRequirement())
										}
									/>
									<Button type="button" variant="outline" onClick={addRequirement}>
										<FaPlus />
									</Button>
								</div>
							</div>

							{/* Notas */}
							<div className="form-group full-width">
								<label className="form-label">Notas</label>
								<textarea
									className="form-textarea"
									value={newStep.notes}
									onChange={(e) =>
										setNewStep((prev) => ({ ...prev, notes: e.target.value }))
									}
									placeholder="Observações sobre a etapa..."
								/>
							</div>

							<Button type="button" variant="outline" onClick={addStep}>
								<FaPlus /> Adicionar Etapa
							</Button>
						</div>

						{errors.steps && (
							<span className="form-error">{errors.steps}</span>
						)}
					</div>

					<div className="form-actions">
						{isEditing && (
							<Button
								type="button"
								variant="secondary"
								onClick={handleCancelEdit}
							>
								Cancelar
							</Button>
						)}
						<Button type="submit" variant="primary" disabled={loading}>
							{loading ? "Salvando..." : (isEditing ? "Atualizar Roteiro" : "Cadastrar Roteiro")}
						</Button>
					</div>
				</form>

				{/* Lista de Roteiros Existentes */}
				<div className="routes-list-section">
					<h3 className="section-title">
						<FaList className="section-icon" />
						Roteiros Operacionais Existentes
					</h3>
					
					{loading ? (
						<div className="loading-message">Carregando roteiros...</div>
					) : routes.length === 0 ? (
						<div className="no-routes-message">
							<p>Nenhum roteiro operacional cadastrado ainda.</p>
							<p>Use o formulário acima para criar o primeiro roteiro.</p>
						</div>
					) : (
						<div className="routes-grid">
							{routes.map((route) => (
								<div key={route.id} className="route-card">
									<div className="route-header">
										<div className="route-product-info">
											<h4>{route.productName}</h4>
											<p className="product-code">{route.productCode}</p>
											<p className="route-version">Versão: {route.version}</p>
										</div>
										<div className="route-status">
											<span className={`status-badge ${getStatusClass(route.status)}`}>
												{getStatusText(route.status)}
											</span>
										</div>
									</div>
									
									<div className="route-details">
										<div className="route-associations">
											<p><FaIndustry /> <strong>Setor:</strong> {getSectorName(route.primarySectorId)}</p>
											<p><FaUser /> <strong>Operador:</strong> {getOperatorName(route.assignedOperatorId)}</p>
										</div>
										
										<div className="route-stats">
											<div className="stat-item">
												<FaRoute />
												<span>{route.totalSteps} etapas</span>
											</div>
											<div className="stat-item">
												<FaClock />
												<span>{formatTime(route.totalStandardTime)}</span>
											</div>
											<div className="stat-item">
												<FaTools />
												<span>{formatTime(route.totalSetupTime)}</span>
											</div>
										</div>
										
										<div className="route-steps-preview">
											<h5>Etapas:</h5>
											{route.steps.slice(0, 3).map((step) => (
												<div key={step.id} className="step-preview">
													<span className="step-number">{step.sequence}</span>
													<span className="step-name">{step.name}</span>
													<span className="step-time">{formatTime(step.standardTime)}</span>
													<span className="step-sector">{getSectorName(step.sectorId)}</span>
												</div>
											))}
											{route.steps.length > 3 && (
												<p className="more-steps">+{route.steps.length - 3} etapas</p>
											)}
										</div>
									</div>
									
									<div className="route-actions">
										<Button
											type="button"
											variant="outline"
											onClick={() => handleEdit(route)}
										>
											<FaEdit /> Editar
										</Button>
										<Button
											type="button"
											variant="secondary"
											onClick={() => handleDelete(route.id)}
										>
											<FaTrash /> Excluir
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
