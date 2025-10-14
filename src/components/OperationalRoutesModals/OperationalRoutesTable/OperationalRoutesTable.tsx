import { memo } from 'react';
import { 
	FaRoute, 
	FaEdit, 
	FaTrash,
	FaEye,
	FaSort,
	FaSortUp,
	FaSortDown,
	FaClock,
	FaTools
} from "react-icons/fa";
import type { OperationalRoute } from "../../../types/operationalRoutes";

interface OperationalRoutesTableProps {
	routes: OperationalRoute[];
	onEdit: (route: OperationalRoute) => void;
	onDelete: (route: OperationalRoute) => void;
	onView: (route: OperationalRoute) => void;
	onSort: (field: 'productName' | 'productCode' | 'status' | 'totalStandardTime' | 'stepsCount') => void;
	sortField: 'productName' | 'productCode' | 'status' | 'totalStandardTime' | 'stepsCount';
	sortDirection: 'asc' | 'desc';
}

const OperationalRoutesTable = memo<OperationalRoutesTableProps>(({ 
	routes, 
	onEdit, 
	onDelete, 
	onView,
	onSort, 
	sortField, 
	sortDirection
}) => {
	
	const getSortIcon = (field: string) => {
		if (sortField !== field) return <FaSort />;
		return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
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

	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case "active":
				return "status-active";
			case "inactive":
				return "status-inactive";
			case "draft":
				return "status-draft";
			default:
				return "status-inactive";
		}
	};

	const formatTime = (minutes: number) => {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
	};

	return (
		<div className="operational-routes-table">
			<div className="table-header">
				<div 
					className="sortable-header" 
					onClick={() => onSort('productName')}
					title="Ordenar por produto"
				>
					Produto {getSortIcon('productName')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('status')}
					title="Ordenar por status"
				>
					Status {getSortIcon('status')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('stepsCount')}
					title="Ordenar por etapas"
				>
					Etapas {getSortIcon('stepsCount')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('totalStandardTime')}
					title="Ordenar por tempo"
				>
					Tempo Total {getSortIcon('totalStandardTime')}
				</div>
				<div>Setup Total</div>
				<div>Ações</div>
			</div>

			{routes.length === 0 ? (
				<div className="empty-state">
					<FaRoute />
					<p>Nenhum roteiro encontrado</p>
				</div>
			) : (
				routes.map((route) => (
					<div key={route.id} className="table-row">
						<div className="product-info">
							<div>
								<div className="product-code">{route.productName}</div>
								<div className="product-name">{route.productCode}</div>
							</div>
						</div>
						<div className="status-cell">
							<span className={`status-badge ${getStatusBadgeClass(route.status)}`}>
								{getStatusText(route.status)}
							</span>
						</div>
						<div className="steps-cell">
							<div className="steps-info">
								<span className="steps-count">{route.steps.length}</span>
								<span className="steps-label">etapas</span>
							</div>
						</div>
						<div className="time-cell">
							<div className="time-info">
								<FaClock className="time-icon" />
								<span>{formatTime(route.totalStandardTime)}</span>
							</div>
						</div>
						<div className="setup-cell">
							<div className="setup-info">
								<FaTools className="setup-icon" />
								<span>{formatTime(route.totalSetupTime)}</span>
							</div>
						</div>
						<div className="actions-cell">
							<button
								className="action-btn view-btn"
								onClick={() => onView(route)}
								title="Visualizar roteiro"
							>
								<FaEye />
							</button>
							<button
								className="action-btn edit-btn"
								onClick={() => onEdit(route)}
								title="Editar roteiro"
							>
								<FaEdit />
							</button>
							<button
								className="action-btn delete-btn"
								onClick={() => onDelete(route)}
								title="Excluir roteiro"
							>
								<FaTrash />
							</button>
						</div>
					</div>
				))
			)}
		</div>
	);
});

OperationalRoutesTable.displayName = 'OperationalRoutesTable';

export default OperationalRoutesTable;
