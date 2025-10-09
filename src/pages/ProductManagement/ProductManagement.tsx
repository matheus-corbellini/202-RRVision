"use client";

import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { 
	createProduct, 
	listAllProducts, 
	deleteProduct, 
	updateProduct,
	type CreateProductData,
	type UpdateProductData 
} from "../../services/productService";
import Button from "../../components/Button/Button";
import { 
	FaSave, 
	FaTimes, 
	FaTrash, 
	FaBoxes,
	FaExclamationTriangle
} from "react-icons/fa";
import type { Product } from "../../types";
import { useProductForm } from "../../hooks/useProductForm";
import { useProductValidation } from "../../hooks/useProductValidation";
import { useDebounce } from "../../hooks/useDebounce";
import "./ProductManagement.css";

// Lazy loading para componentes pesados
const ProductTable = lazy(() => import("../../components/ProductModals/ProductTable/ProductTable"));
const ProductForm = lazy(() => import("../../components/ProductModals/ProductForm/ProductForm"));
const SearchBar = lazy(() => import("../../components/ProductModals/SearchBar/SearchBar"));
const Pagination = lazy(() => import("../../components/ProductModals/Pagination/Pagination"));

// Interfaces movidas para hooks personalizados

type SortField = 'code' | 'name' | 'category' | 'isActive' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ProductManagement() {
	// Estado principal
	const [products, setProducts] = useState<Product[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; product: Product | null }>({ isOpen: false, product: null });
	const [sortField, setSortField] = useState<SortField>('name');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(30);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Hooks personalizados
	const {
		formData,
		formErrors,
		formLoading,
		editingProduct,
		setField,
		clearAllErrors,
		setLoading: setFormLoading,
		setEditingProduct,
		resetForm,
		handleChange,
	} = useProductForm();

	const { validateForm } = useProductValidation();
	
	// Debounce para busca
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Carregar produtos
	useEffect(() => {
		loadProducts();
	}, []);

	// Filtrar e ordenar produtos com useMemo para performance
	const filteredAndSortedProducts = useMemo(() => {
		let filtered = products;

		// Filtrar por categoria
		if (categoryFilter !== "all") {
			filtered = filtered.filter((p) => p.category === categoryFilter);
		}

		// Filtrar por termo de busca (usando debouncedSearchTerm)
		if (debouncedSearchTerm.trim()) {
			filtered = filtered.filter(
				(p) =>
					p.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					p.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					p.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
			);
		}

		// Ordenar
		filtered.sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortField) {
				case 'code':
					aValue = a.code.toLowerCase();
					bValue = b.code.toLowerCase();
					break;
				case 'name':
					aValue = a.name.toLowerCase();
					bValue = b.name.toLowerCase();
					break;
				case 'category':
					aValue = a.category.toLowerCase();
					bValue = b.category.toLowerCase();
					break;
				case 'isActive':
					aValue = a.isActive ? 1 : 0;
					bValue = b.isActive ? 1 : 0;
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
	}, [products, debouncedSearchTerm, categoryFilter, sortField, sortDirection]);

	// Paginação
	const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

	// Reset página quando filtros mudam
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm, categoryFilter, sortField, sortDirection]);

	const loadProducts = useCallback(async () => {
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
	}, []);

	// Funções movidas para hooks personalizados

	const handleValidateForm = useCallback(async (): Promise<boolean> => {
		const validation = await validateForm(formData, editingProduct);
		
		if (!validation.isValid) {
			// Set first error as main error
			const firstError = Object.values(validation.errors)[0];
			setError(firstError);
			return false;
		}
		
		clearAllErrors();
		return true;
	}, [formData, editingProduct, validateForm, setError, clearAllErrors]);

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault();
		
		const isValid = await handleValidateForm();
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
	}, [formData, editingProduct, handleValidateForm, setFormLoading, setError, setSuccess, resetForm, loadProducts]);

	const handleDeleteClick = useCallback((product: Product) => {
		setDeleteConfirmModal({ isOpen: true, product });
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!deleteConfirmModal.product) return;
		
		try {
			const result = await deleteProduct(deleteConfirmModal.product.id);
			
			if (result.success) {
				await loadProducts();
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
				setDeleteConfirmModal({ isOpen: false, product: null });
			} else {
				setError(result.error || "Erro ao remover produto");
			}
		} catch (err) {
			console.error("Erro ao remover produto:", err);
			setError("Erro ao remover produto");
		}
	}, [deleteConfirmModal.product, loadProducts, setSuccess, setError]);

	const handleDeleteCancel = useCallback(() => {
		setDeleteConfirmModal({ isOpen: false, product: null });
	}, []);

	const handleEdit = useCallback((productToEdit: Product) => {
		setEditingProduct(productToEdit);
		setField('code', productToEdit.code);
		setField('name', productToEdit.name);
		setField('description', productToEdit.description);
		setField('category', productToEdit.category);
		setField('isActive', productToEdit.isActive);
		setModalOpen(true);
	}, [setEditingProduct, setField]);

	const handleCancel = useCallback(() => {
		resetForm();
		setModalOpen(false);
	}, [resetForm]);

	const openCreateModal = useCallback(() => {
		resetForm();
		setModalOpen(true);
	}, [resetForm]);

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
		setCategoryFilter(value);
	}, []);

	// Funções movidas para componentes

	// Obter categorias únicas para filtro
	const categories = Array.from(new Set(products.map(p => p.category)));

	return (
		<div className="product-management-content">
			<div className="product-management-container">
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
					<div className="product-error-message">
						<FaTimes />
						{error}
					</div>
				)}

				{success && (
					<div className="product-success-message">
						<FaSave />
						Operação realizada com sucesso!
					</div>
				)}

				<div className="products-section">
				<Suspense fallback={<div className="product-loading-container"><div className="product-spinner"></div><p>Carregando...</p></div>}>
					<SearchBar
						searchTerm={searchTerm}
						categoryFilter={categoryFilter}
						categories={categories}
						onSearchChange={handleSearchChange}
						onFilterChange={handleFilterChange}
						onCreateProduct={openCreateModal}
					/>
				</Suspense>

				{loading ? (
					<div className="product-loading-container">
						<div className="product-spinner"></div>
						<p>Carregando produtos...</p>
					</div>
				) : (
					<Suspense fallback={<div className="product-loading-container"><div className="product-spinner"></div><p>Carregando...</p></div>}>
						<ProductTable
							products={paginatedProducts}
							onEdit={handleEdit}
							onDelete={handleDeleteClick}
							onSort={handleSort}
							sortField={sortField}
							sortDirection={sortDirection}
						/>
					</Suspense>
				)}

				{/* Paginação para listas com mais de 30 produtos */}
				{totalPages > 1 && (
					<Suspense fallback={<div></div>}>
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							startIndex={startIndex}
							itemsPerPage={itemsPerPage}
							totalItems={filteredAndSortedProducts.length}
							onPageChange={goToPage}
							onPreviousPage={goToPreviousPage}
							onNextPage={goToNextPage}
						/>
					</Suspense>
				)}
			</div>

				{/* Modal de Criação/Edição */}
				{modalOpen && (
					<div className="product-modal-overlay">
						<div className="product-modal">
							<div className="product-modal-header">
								<h2>
									{editingProduct ? "Editar Produto" : "Criar Novo Produto"}
								</h2>
								<button className="product-close-btn" onClick={handleCancel}>
									<FaTimes />
								</button>
							</div>
							<div className="product-modal-body">
								<Suspense fallback={<div className="product-loading-container"><div className="product-spinner"></div><p>Carregando formulário...</p></div>}>
									<ProductForm
										formData={formData}
										formErrors={formErrors}
										formLoading={formLoading}
										editingProduct={editingProduct}
										onChange={handleChange}
										onSubmit={handleSubmit}
										onCancel={handleCancel}
										onFieldChange={setField}
									/>
								</Suspense>
							</div>
					</div>
				</div>
			)}

			{/* Modal de Confirmação de Exclusão */}
			{deleteConfirmModal.isOpen && (
				<div className="product-modal-overlay">
					<div className="product-modal product-delete-confirm-modal">
						<div className="product-modal-header">
							<h2>
								<FaExclamationTriangle className="header-icon" style={{ color: '#e53e3e' }} />
								Confirmar Exclusão
							</h2>
							<button className="product-close-btn" onClick={handleDeleteCancel}>
								<FaTimes />
							</button>
						</div>
						<div className="product-modal-body">
							<div className="product-delete-confirm-content">
								<p>
									Tem certeza que deseja remover o produto <strong>{deleteConfirmModal.product?.name}</strong>?
								</p>
								<p className="product-delete-warning">
									Esta ação não pode ser desfeita e todos os dados do produto serão permanentemente removidos.
								</p>
							</div>
							<div className="product-form-actions">
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
									className="product-danger-btn"
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