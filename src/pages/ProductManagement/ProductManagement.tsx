"use client";

import { useState, useEffect } from "react";
import { 
	createProduct, 
	listAllProducts, 
	deleteProduct, 
	updateProduct,
	isCodeAlreadyUsed,
	type CreateProductData,
	type UpdateProductData 
} from "../../services/productService";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { 
	FaBox, 
	FaSave, 
	FaTimes, 
	FaEdit, 
	FaTrash, 
	FaSearch,
	FaBoxes,
	FaTag,
	FaFolder,
	FaInfoCircle
} from "react-icons/fa";
import type { Product } from "../../types";
import "./ProductManagement.css";

interface ProductFormData {
	code: string;
	name: string;
	description: string;
	category: string;
	isActive: boolean;
}

export default function ProductManagement() {
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [formData, setFormData] = useState<ProductFormData>({
		code: "",
		name: "",
		description: "",
		category: "",
		isActive: true,
	});
	const [formLoading, setFormLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Carregar produtos
	useEffect(() => {
		loadProducts();
	}, []);

	// Filtrar produtos
	useEffect(() => {
		let filtered = products;

		// Filtrar por categoria
		if (categoryFilter !== "all") {
			filtered = filtered.filter((p) => p.category === categoryFilter);
		}

		// Filtrar por termo de busca
		if (searchTerm.trim()) {
			filtered = filtered.filter(
				(p) =>
					p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
					p.category.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		setFilteredProducts(filtered);
	}, [products, searchTerm, categoryFilter]);

	const loadProducts = async () => {
		try {
			setLoading(true);
			const productsList = await listAllProducts();
			setProducts(productsList);
		} catch (err) {
			console.error("Erro ao carregar produtos:", err);
			setError("Erro ao carregar lista de produtos");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
	) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;
		
		setFormData((prev) => ({ 
			...prev, 
			[name]: type === 'checkbox' ? checked : value 
		}));
		if (error) setError(null);
	};

	const validateForm = async (): Promise<boolean> => {
		if (!formData.code || !formData.name || !formData.category) {
			setError("Código, nome e categoria são obrigatórios");
			return false;
		}

		// Verificar se código já existe (apenas para novos produtos)
		if (!editingProduct) {
			try {
				const codeExists = await isCodeAlreadyUsed(formData.code);
				if (codeExists) {
					setError("Código do produto já está em uso");
					return false;
				}
			} catch (err) {
				setError("Erro ao verificar disponibilidade do código");
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
			if (editingProduct) {
				// Atualizar produto existente
				const updateData: UpdateProductData = {
					name: formData.name,
					description: formData.description,
					category: formData.category,
					isActive: formData.isActive,
				};

				const result = await updateProduct(editingProduct.id, updateData);
				
				if (result.success) {
					setSuccess(true);
					resetForm();
					await loadProducts();
				} else {
					setError(result.error || "Erro ao atualizar produto");
				}
			} else {
				// Criar novo produto
				const createData: CreateProductData = {
					code: formData.code,
					name: formData.name,
					description: formData.description,
					category: formData.category,
					isActive: formData.isActive,
				};

				const result = await createProduct(createData);
				
				if (result.success) {
					setSuccess(true);
					resetForm();
					await loadProducts();
				} else {
					setError(result.error || "Erro ao criar produto");
				}
			}
		} catch (err) {
			console.error("Erro ao salvar produto:", err);
			setError("Erro ao salvar produto. Tente novamente.");
		} finally {
			setFormLoading(false);
		}
	};

	const handleDelete = async (productId: string) => {
		if (!confirm("Tem certeza que deseja remover este produto?")) return;
		
		try {
			const result = await deleteProduct(productId);
			
			if (result.success) {
				await loadProducts();
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
			} else {
				setError(result.error || "Erro ao remover produto");
			}
		} catch (err) {
			console.error("Erro ao remover produto:", err);
			setError("Erro ao remover produto");
		}
	};

	const handleEdit = (productToEdit: Product) => {
		setEditingProduct(productToEdit);
		setFormData({
			code: productToEdit.code,
			name: productToEdit.name,
			description: productToEdit.description,
			category: productToEdit.category,
			isActive: productToEdit.isActive,
		});
		setModalOpen(true);
	};

	const resetForm = () => {
		setFormData({
			code: "",
			name: "",
			description: "",
			category: "",
			isActive: true,
		});
		setEditingProduct(null);
		setError(null);
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

	const getStatusBadgeClass = (isActive: boolean) => {
		switch (isActive) {
			case true: return "status-active";
			case false: return "status-inactive";
			default: return "status-unknown";
		}
	};

	const getStatusText = (isActive: boolean) => {
		switch (isActive) {
			case true: return "Ativo";
			case false: return "Inativo";
			default: return "Desconhecido";
		}
	};

	// Obter categorias únicas para filtro
	const categories = Array.from(new Set(products.map(p => p.category)));

	return (
		<div className="product-management-content">
			<div className="content-header">
				<div className="header-content">
					<h1>
						<FaBoxes className="header-icon" />
						Gerenciar Produtos
					</h1>
					<p>
						Visualize, crie, edite e remova produtos do sistema
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

			<div className="products-section">
				<div className="search-container">
					<div className="search-input-wrapper">
						<FaSearch className="search-icon" />
						<input
							type="text"
							placeholder="Buscar por código, nome, descrição ou categoria..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="search-input"
						/>
					</div>
					<div className="filter-wrapper">
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="category-filter"
						>
							<option value="all">Todas as categorias</option>
							{categories.map(category => (
								<option key={category} value={category}>{category}</option>
							))}
						</select>
					</div>
					<div className="search-actions">
						<Button onClick={openCreateModal}>
							<FaBox />
							Criar Produto
						</Button>
					</div>
				</div>

				{loading ? (
					<div className="loading-container">
						<div className="spinner"></div>
						<p>Carregando produtos...</p>
					</div>
				) : (
					<div className="products-table">
						<div className="table-header">
							<div>Código</div>
							<div>Nome</div>
							<div>Descrição</div>
							<div>Categoria</div>
							<div>Status</div>
							<div>Ações</div>
						</div>

						{filteredProducts.length === 0 ? (
							<div className="empty-state">
								<FaBoxes />
								<p>Nenhum produto encontrado</p>
							</div>
						) : (
							filteredProducts.map((p) => (
								<div key={p.id} className="table-row">
									<div className="product-info">
										<div className="product-avatar">
											{p.name?.charAt(0)?.toUpperCase() || "P"}
										</div>
										<div>
											<div className="product-code">{p.code}</div>
										</div>
									</div>
									<div className="name-cell">
										<FaTag />
										{p.name}
									</div>
									<div className="description-cell">
										<FaInfoCircle />
										{p.description || "—"}
									</div>
									<div className="category-cell">
										<FaFolder />
										{p.category}
									</div>
									<div className="status-cell">
										<span className={`status-badge ${getStatusBadgeClass(p.isActive)}`}>
											{getStatusText(p.isActive)}
										</span>
									</div>
									<div className="actions-cell">
										<button
											className="action-btn edit-btn"
											onClick={() => handleEdit(p)}
											title="Editar produto"
										>
											<FaEdit />
										</button>
										<button
											className="action-btn delete-btn"
											onClick={() => handleDelete(p.id)}
											title="Remover produto"
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
								{editingProduct ? "Editar Produto" : "Criar Novo Produto"}
							</h2>
							<button className="close-btn" onClick={handleCancel}>
								<FaTimes />
							</button>
						</div>
						<div className="modal-body">
							<form onSubmit={handleSubmit} className="product-form">
								<div className="form-section">
									<h3>Informações do Produto</h3>
									<div className="form-grid">
										<div className="form-group">
											<label>Código *</label>
											<Input
												type="text"
												name="code"
												value={formData.code}
												onChange={handleChange}
												placeholder="Ex: PROD001"
												required
												disabled={formLoading || !!editingProduct}
											/>
										</div>

										<div className="form-group">
											<label>Nome *</label>
											<Input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												placeholder="Nome do produto"
												required
												disabled={formLoading}
											/>
										</div>

										<div className="form-group">
											<label>Categoria *</label>
											<Input
												type="text"
												name="category"
												value={formData.category}
												onChange={handleChange}
												placeholder="Categoria do produto"
												required
												disabled={formLoading}
											/>
										</div>

										<div className="form-group">
											<label>Status</label>
											<select
												name="isActive"
												value={formData.isActive ? "true" : "false"}
												onChange={(e) => setFormData(prev => ({ 
													...prev, 
													isActive: e.target.value === "true" 
												}))}
												disabled={formLoading}
											>
												<option value="true">Ativo</option>
												<option value="false">Inativo</option>
											</select>
										</div>
									</div>

									<div className="form-group">
										<label>Descrição</label>
										<textarea
											name="description"
											value={formData.description}
											onChange={handleChange}
											placeholder="Descrição detalhada do produto"
											rows={4}
											disabled={formLoading}
										/>
									</div>
								</div>

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
										{formLoading ? "Salvando..." : editingProduct ? "Salvar" : "Criar Produto"}
									</Button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}