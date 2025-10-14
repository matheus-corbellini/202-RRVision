"use client";

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import {
	listAllOperationalRoutes,
	deleteOperationalRoute,
} from "../../services/operationalRoutesService";
import Button from "../../components/Button/Button";
import { 
	FaSave, 
	FaTimes, 
	FaTrash, 
	FaRoute,
	FaExclamationTriangle,
	FaSync,
	FaCloudDownloadAlt
} from "react-icons/fa";
import type { OperationalRoute } from "../../types/operationalRoutes";
import { useDebounce } from "../../hooks/useDebounce";
import { useBlingOrders } from "../../hooks/useBlingOrders";
import { BlingOrdersService, type BlingProductionOrder } from "../../services/blingOrdersService";
import "./OperationalRoutesList.css";

// Lazy loading para componentes pesados
const OperationalRoutesTable = lazy(() => import("../../components/OperationalRoutesModals/OperationalRoutesTable/OperationalRoutesTable"));
const BlingOrdersTable = lazy(() => import("../../components/BlingOrdersTable/BlingOrdersTable"));
const OperationalRoutesSearchBar = lazy(() => import("../../components/OperationalRoutesModals/OperationalRoutesSearchBar/OperationalRoutesSearchBar"));
const OperationalRoutesPagination = lazy(() => import("../../components/OperationalRoutesModals/OperationalRoutesPagination/OperationalRoutesPagination"));

type SortField = 'productName' | 'productCode' | 'status' | 'totalStandardTime' | 'stepsCount' | 'orderNumber' | 'customerName' | 'orderDate' | 'total';
type SortDirection = 'asc' | 'desc';

export default function OperationalRoutesList() {
	// Estado principal
	const [routes, setRoutes] = useState<OperationalRoute[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [loading, setLoading] = useState(true);
	const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; route: OperationalRoute | null }>({ isOpen: false, route: null });
	const [sortField, setSortField] = useState<SortField>('productName');
	const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(30);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);

	// Hook para ordens de produção do Bling
	const {
		orders: blingOrders,
		isLoading: blingLoading,
		error: blingError,
		success: blingSuccess,
		message: blingMessage,
		hasBlingToken,
		loadOrders: loadBlingOrders,
		clearError: clearBlingError,
		clearSuccess: clearBlingSuccess
	} = useBlingOrders();

	// Hooks personalizados - removidos pois não são utilizados nesta implementação
	// const { setField, clearAllErrors, setLoading: setFormLoading, setEditingRoute, resetForm, handleChange } = useOperationalRouteForm();
	
	// Debounce para busca
	const debouncedSearchTerm = useDebounce(searchTerm, 300);

	// Carregar roteiros e ordens do Bling automaticamente
	useEffect(() => {
		loadRoutes();
		
		// Carregar ordens do Bling automaticamente se houver token
		if (hasBlingToken) {
			loadBlingOrders();
		}
	}, [hasBlingToken, loadBlingOrders]);

	// Filtrar e ordenar roteiros operacionais
	const filteredAndSortedRoutes = useMemo(() => {
		let filtered = routes;

		// Filtrar por status
		if (statusFilter !== "all") {
			filtered = filtered.filter((route) => route.status === statusFilter);
		}

		// Filtrar por termo de busca
		if (debouncedSearchTerm.trim()) {
			filtered = filtered.filter((route) =>
				route.productName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
				route.productCode.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
			);
		}

		// Ordenar roteiros
		filtered.sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortField) {
				case 'productName':
					aValue = a.productName.toLowerCase();
					bValue = b.productName.toLowerCase();
					break;
				case 'productCode':
					aValue = a.productCode.toLowerCase();
					bValue = b.productCode.toLowerCase();
					break;
				case 'status':
					aValue = a.status;
					bValue = b.status;
					break;
				case 'totalStandardTime':
					aValue = a.totalStandardTime;
					bValue = b.totalStandardTime;
					break;
				case 'stepsCount':
					aValue = a.steps.length;
					bValue = b.steps.length;
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [routes, debouncedSearchTerm, statusFilter, sortField, sortDirection]);

	// Filtrar e ordenar ordens do Bling
	const filteredAndSortedBlingOrders = useMemo(() => {
		let filtered = blingOrders;

		// Filtrar por status
		if (statusFilter !== "all") {
			filtered = filtered.filter((order) => order.situacao === statusFilter);
		}

		// Filtrar por termo de busca
		if (debouncedSearchTerm.trim()) {
			filtered = filtered.filter((order) => {
				const mainProduct = BlingOrdersService.getMainProduct(order);
				return (
					mainProduct.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					mainProduct.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					order.cliente.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
					order.numero.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
				);
			});
		}

		// Ordenar ordens do Bling
		filtered.sort((a, b) => {
			let aValue: string | number;
			let bValue: string | number;

			switch (sortField) {
				case 'productName':
					const aProduct = BlingOrdersService.getMainProduct(a);
					const bProduct = BlingOrdersService.getMainProduct(b);
					aValue = aProduct.name.toLowerCase();
					bValue = bProduct.name.toLowerCase();
					break;
				case 'productCode':
					const aCode = BlingOrdersService.getMainProduct(a);
					const bCode = BlingOrdersService.getMainProduct(b);
					aValue = aCode.code.toLowerCase();
					bValue = bCode.code.toLowerCase();
					break;
				case 'status':
					aValue = a.situacao;
					bValue = b.situacao;
					break;
				case 'orderNumber':
					aValue = a.numero.toLowerCase();
					bValue = b.numero.toLowerCase();
					break;
				case 'customerName':
					aValue = a.cliente.nome.toLowerCase();
					bValue = b.cliente.nome.toLowerCase();
					break;
				case 'orderDate':
					aValue = new Date(a.data).getTime();
					bValue = new Date(b.data).getTime();
					break;
				case 'total':
					aValue = a.total;
					bValue = b.total;
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return filtered;
	}, [blingOrders, debouncedSearchTerm, statusFilter, sortField, sortDirection]);

	// Dados para exibição - mostrar ordens do Bling por padrão se disponíveis
	const displayData = useMemo(() => {
		if (hasBlingToken && blingOrders.length > 0) {
			return filteredAndSortedBlingOrders;
		}
		return filteredAndSortedRoutes;
	}, [hasBlingToken, blingOrders.length, filteredAndSortedBlingOrders, filteredAndSortedRoutes]);

	// Determinar se estamos mostrando ordens do Bling
	const isShowingBlingOrders = hasBlingToken && blingOrders.length > 0;

	// Paginação
	const totalPages = Math.ceil(displayData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedData = displayData.slice(startIndex, startIndex + itemsPerPage);

	// Reset página quando filtros mudam
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm, statusFilter, sortField, sortDirection]);

	const loadRoutes = useCallback(async () => {
		try {
			setLoading(true);
			const routesData = await listAllOperationalRoutes();
			setRoutes(routesData);
		} catch (err) {
			console.error("Erro ao carregar roteiros:", err);
			setError("Erro ao carregar lista de roteiros operacionais");
		} finally {
			setLoading(false);
		}
	}, []);

	const handleDeleteClick = useCallback((route: OperationalRoute) => {
		setDeleteConfirmModal({ isOpen: true, route });
	}, []);

	const handleDeleteConfirm = useCallback(async () => {
		if (!deleteConfirmModal.route) return;
		
		try {
			await deleteOperationalRoute(deleteConfirmModal.route.id);
			await loadRoutes();
			setSuccess(true);
			setTimeout(() => setSuccess(false), 3000);
			setDeleteConfirmModal({ isOpen: false, route: null });
		} catch (err) {
			console.error("Erro ao remover roteiro:", err);
			setError("Erro ao remover roteiro operacional");
		}
	}, [deleteConfirmModal.route, loadRoutes, setSuccess, setError]);

	const handleDeleteCancel = useCallback(() => {
		setDeleteConfirmModal({ isOpen: false, route: null });
	}, []);

	const handleEdit = useCallback((routeToEdit: OperationalRoute) => {
		// Navegar para a página de edição
		window.location.href = `/operational-routes?edit=${routeToEdit.id}`;
	}, []);

	const handleView = useCallback((route: OperationalRoute) => {
		// Navegar para a página de visualização
		window.location.href = `/operational-routes?view=${route.id}`;
	}, []);

	// Funções para ordens do Bling
	const handleViewBlingOrder = useCallback((order: BlingProductionOrder) => {
		// Abrir modal ou navegar para visualização da ordem
		console.log('Visualizar ordem:', order);
		alert(`Visualizar ordem ${order.numero} - ${order.cliente.nome}`);
	}, []);

	const handleEditBlingOrder = useCallback((order: BlingProductionOrder) => {
		// Abrir modal de edição ou navegar para edição
		console.log('Editar ordem:', order);
		alert(`Editar ordem ${order.numero}`);
	}, []);

	const handleDeleteBlingOrder = useCallback((order: BlingProductionOrder) => {
		// Confirmar exclusão
		if (confirm(`Tem certeza que deseja excluir a ordem ${order.numero}?`)) {
			console.log('Excluir ordem:', order);
			alert(`Ordem ${order.numero} excluída`);
		}
	}, []);

	// Funções de ordenação
	const handleSort = useCallback((field: string) => {
		const validField = field as SortField;
		if (sortField === validField) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(validField);
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
		setStatusFilter(value);
	}, []);

	const openCreateModal = useCallback(() => {
		window.location.href = "/operational-routes";
	}, []);

	// Funções para integração com Bling
	const handleLoadBlingOrders = useCallback(async () => {
		await loadBlingOrders();
	}, [loadBlingOrders]);

	const handleToggleBlingOrders = useCallback(() => {
		// Se não há ordens do Bling, carregar
		if (hasBlingToken && blingOrders.length === 0) {
			handleLoadBlingOrders();
		}
	}, [hasBlingToken, blingOrders.length, handleLoadBlingOrders]);


	return (
		<div className="operational-routes-management-content">
			<div className="operational-routes-management-container">
				<div className="content-header">
					<div className="header-content">
						<h1>
							<FaRoute className="header-icon" />
							Lista de Roteiros Operacionais
						</h1>
						<p>
							{isShowingBlingOrders ? 'Visualize ordens de produção do Bling' : 'Visualize e gerencie todos os roteiros de produção cadastrados'}
							{isShowingBlingOrders && (
								<span className="bling-indicator">
									{' '}• {blingOrders.length} ordens de produção
								</span>
							)}
						</p>
					</div>
					<div className="header-actions">
						{hasBlingToken && (
							<Button
								variant={isShowingBlingOrders ? "outline" : "primary"}
								onClick={handleToggleBlingOrders}
								disabled={blingLoading}
								className="bling-sync-btn"
							>
								{blingLoading ? (
									<FaSync className="spinning" />
								) : (
									<FaCloudDownloadAlt />
								)}
								{isShowingBlingOrders ? 'Ver Roteiros' : 'Atualizar Ordens'}
							</Button>
						)}
					</div>
				</div>

				{error && (
					<div className="operational-routes-error-message">
						<FaTimes />
						{error}
					</div>
				)}

				{success && (
					<div className="operational-routes-success-message">
						<FaSave />
						Operação realizada com sucesso!
					</div>
				)}

				{blingError && (
					<div className="operational-routes-error-message">
						<FaTimes />
						{blingError}
						<button 
							onClick={clearBlingError}
							className="clear-error-btn"
							title="Fechar erro"
						>
							<FaTimes />
						</button>
					</div>
				)}

				{blingSuccess && blingMessage && (
					<div className="operational-routes-success-message">
						<FaCloudDownloadAlt />
						{blingMessage}
						<button 
							onClick={clearBlingSuccess}
							className="clear-success-btn"
							title="Fechar mensagem"
						>
							<FaTimes />
						</button>
					</div>
				)}

				<div className="operational-routes-section">
					<Suspense fallback={<div className="operational-routes-loading-container"><div className="operational-routes-spinner"></div><p>Carregando...</p></div>}>
						<OperationalRoutesSearchBar
							searchTerm={searchTerm}
							statusFilter={statusFilter}
							onSearchChange={handleSearchChange}
							onFilterChange={handleFilterChange}
							onCreateRoute={openCreateModal}
						/>
					</Suspense>

					{loading || blingLoading ? (
						<div className="operational-routes-loading-container">
							<div className="operational-routes-spinner"></div>
							<p>{isShowingBlingOrders ? 'Carregando ordens de produção...' : 'Carregando roteiros...'}</p>
						</div>
					) : isShowingBlingOrders ? (
						<Suspense fallback={<div className="operational-routes-loading-container"><div className="operational-routes-spinner"></div><p>Carregando...</p></div>}>
							<BlingOrdersTable
								orders={paginatedData as BlingProductionOrder[]}
								onView={handleViewBlingOrder}
								onEdit={handleEditBlingOrder}
								onDelete={handleDeleteBlingOrder}
								onSort={handleSort}
								sortField={sortField}
								sortDirection={sortDirection}
							/>
						</Suspense>
					) : (
						<Suspense fallback={<div className="operational-routes-loading-container"><div className="operational-routes-spinner"></div><p>Carregando...</p></div>}>
							<OperationalRoutesTable
								routes={paginatedData as OperationalRoute[]}
								onEdit={handleEdit}
								onDelete={handleDeleteClick}
								onView={handleView}
								onSort={handleSort}
								sortField={sortField as 'productName' | 'productCode' | 'status' | 'totalStandardTime' | 'stepsCount'}
								sortDirection={sortDirection}
							/>
						</Suspense>
					)}

					{/* Paginação */}
					{totalPages > 1 && (
						<Suspense fallback={<div></div>}>
							<OperationalRoutesPagination
								currentPage={currentPage}
								totalPages={totalPages}
								startIndex={startIndex}
								itemsPerPage={itemsPerPage}
								totalItems={displayData.length}
								onPageChange={goToPage}
								onPreviousPage={goToPreviousPage}
								onNextPage={goToNextPage}
							/>
						</Suspense>
					)}
				</div>

				{/* Modal de Confirmação de Exclusão */}
				{deleteConfirmModal.isOpen && (
					<div className="operational-routes-modal-overlay">
						<div className="operational-routes-modal operational-routes-delete-confirm-modal">
							<div className="operational-routes-modal-header">
								<h2>
									<FaExclamationTriangle className="header-icon" style={{ color: '#e53e3e' }} />
									Confirmar Exclusão
								</h2>
								<button className="operational-routes-close-btn" onClick={handleDeleteCancel}>
									<FaTimes />
								</button>
							</div>
							<div className="operational-routes-modal-body">
								<div className="operational-routes-delete-confirm-content">
									<p>
										Tem certeza que deseja remover o roteiro <strong>{deleteConfirmModal.route?.productName}</strong>?
									</p>
									<p className="operational-routes-delete-warning">
										Esta ação não pode ser desfeita e todos os dados do roteiro serão permanentemente removidos.
									</p>
								</div>
								<div className="operational-routes-form-actions">
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
										className="operational-routes-danger-btn"
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
