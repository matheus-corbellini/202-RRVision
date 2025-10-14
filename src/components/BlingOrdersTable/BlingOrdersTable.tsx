import React from 'react';
import { FaEye, FaEdit, FaTrash, FaSortUp, FaSortDown } from 'react-icons/fa';
import { BlingOrdersService, type BlingProductionOrder } from '../../services/blingOrdersService';
import './BlingOrdersTable.css';

interface BlingOrdersTableProps {
	orders: BlingProductionOrder[];
	onView?: (order: BlingProductionOrder) => void;
	onEdit?: (order: BlingProductionOrder) => void;
	onDelete?: (order: BlingProductionOrder) => void;
	onSort?: (field: string) => void;
	sortField?: string;
	sortDirection?: 'asc' | 'desc';
}

export default function BlingOrdersTable({
	orders,
	onView,
	onEdit,
	onDelete,
	onSort,
	sortField,
	sortDirection
}: BlingOrdersTableProps) {
	const getSortIcon = (field: string) => {
		if (sortField !== field) return null;
		return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
	};

	const handleSort = (field: string) => {
		if (onSort) {
			onSort(field);
		}
	};

	if (orders.length === 0) {
		return (
			<div className="empty-state">
				<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
					<path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" />
					<rect x="9" y="3" width="6" height="8" rx="1" />
				</svg>
				<p>Nenhuma ordem de produção encontrada</p>
			</div>
		);
	}

	return (
		<div className="bling-orders-table">
			<div className="table-header">
				<div 
					className="sortable-header" 
					onClick={() => handleSort('orderNumber')}
				>
					Número da Ordem {getSortIcon('orderNumber')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => handleSort('productName')}
				>
					Produto {getSortIcon('productName')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => handleSort('customerName')}
				>
					Cliente {getSortIcon('customerName')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => handleSort('status')}
				>
					Status {getSortIcon('status')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => handleSort('orderDate')}
				>
					Data {getSortIcon('orderDate')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => handleSort('total')}
				>
					Total {getSortIcon('total')}
				</div>
				<div className="actions-header">Ações</div>
			</div>

			{orders.map((order) => {
				const mainProduct = BlingOrdersService.getMainProduct(order);
				const statusInfo = BlingOrdersService.mapBlingStatus(order.situacao);
				
				// Debug: verificar o que está sendo retornado
				console.log('Order data:', order);
				console.log('Main product:', mainProduct);
				console.log('Status info:', statusInfo);
				
				// Verificações de segurança para dados opcionais
				const customerName = order.cliente?.nome || 'Cliente não informado';
				const customerEmail = order.cliente?.email;
				const orderNumber = order.numero || 'N/A';
				const orderDate = order.data || new Date().toISOString();
				const orderTotal = order.total || 0;
				
				return (
					<div key={order.id} className="table-row">
						<div className="order-info">
							<div className="order-number">
								#{orderNumber}
							</div>
						</div>

						<div className="product-info">
							<div className="product-avatar">
								{String(mainProduct.code).charAt(0).toUpperCase()}
							</div>
							<div className="product-details">
								<div className="product-code">{String(mainProduct.code)}</div>
								<div className="product-name">{String(mainProduct.name)}</div>
								<div className="product-quantity">Qtd: {String(mainProduct.quantity)}</div>
							</div>
						</div>

						<div className="customer-info">
							<div className="customer-name">{customerName}</div>
							{customerEmail && (
								<div className="customer-email">{customerEmail}</div>
							)}
						</div>

						<div className="status-cell">
							<span 
								className="status-badge"
								style={{ 
									color: statusInfo.color, 
									backgroundColor: statusInfo.bgColor 
								}}
							>
								{String(statusInfo.label)}
							</span>
						</div>

						<div className="date-info">
							<div className="order-date">
								{String(BlingOrdersService.formatDate(orderDate))}
							</div>
							{order.dataSaida && (
								<div className="delivery-date">
									Entregue: {String(BlingOrdersService.formatDate(order.dataSaida))}
								</div>
							)}
						</div>

						<div className="total-info">
							<div className="order-total">
								{String(BlingOrdersService.formatCurrency(orderTotal || 0))}
							</div>
						</div>

						<div className="actions-cell">
							{onView && (
								<button 
									className="action-btn view-btn"
									onClick={() => onView(order)}
									title="Visualizar ordem"
								>
									<FaEye />
								</button>
							)}
							{onEdit && (
								<button 
									className="action-btn edit-btn"
									onClick={() => onEdit(order)}
									title="Editar ordem"
								>
									<FaEdit />
								</button>
							)}
							{onDelete && (
								<button 
									className="action-btn delete-btn"
									onClick={() => onDelete(order)}
									title="Excluir ordem"
								>
									<FaTrash />
								</button>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
