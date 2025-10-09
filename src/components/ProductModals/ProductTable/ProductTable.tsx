import { memo } from 'react';
import { 
	FaBox, 
	FaEdit, 
	FaTrash,
	FaSort,
	FaSortUp,
	FaSortDown,
} from "react-icons/fa";
import type { Product } from "../../../types";

interface ProductTableProps {
	products: Product[];
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
	onSort: (field: 'code' | 'name' | 'category' | 'isActive' | 'createdAt') => void;
	sortField: 'code' | 'name' | 'category' | 'isActive' | 'createdAt';
	sortDirection: 'asc' | 'desc';
	useVirtualization?: boolean;
	virtualizationThreshold?: number;
}

const ProductTable = memo<ProductTableProps>(({ 
	products, 
	onEdit, 
	onDelete, 
	onSort, 
	sortField, 
	sortDirection
}) => {
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

	const getSortIcon = (field: string) => {
		if (sortField !== field) return <FaSort />;
		return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
	};

	const formatPrice = (price?: number) => {
		if (!price) return 'N/A';
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(price);
	};


	// Loading é tratado no componente pai

	return (
		<div className="products-table">
			<div className="table-header">
				<div 
					className="sortable-header" 
					onClick={() => onSort('code')}
					title="Ordenar por código"
				>
					Código {getSortIcon('code')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('name')}
					title="Ordenar por nome"
				>
					Nome {getSortIcon('name')}
				</div>
				<div>Preço</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('category')}
					title="Ordenar por categoria"
				>
					Categoria {getSortIcon('category')}
				</div>
				<div 
					className="sortable-header" 
					onClick={() => onSort('isActive')}
					title="Ordenar por status"
				>
					Status {getSortIcon('isActive')}
				</div>
				<div>Ações</div>
			</div>

			{products.length === 0 ? (
				<div className="empty-state">
					<FaBox />
					<p>Nenhum produto encontrado</p>
				</div>
			) : (
				products.map((product) => (
					<div key={product.id} className="table-row">
						<div className="product-info">
							<div>
								<div className="product-code">{product.code}</div>
							</div>
						</div>
						<div className="name-cell">
							{product.name}
						</div>
						<div className="price-cell">
							{formatPrice(product.price)}
						</div>
						<div className="category-cell">
							{product.category}
						</div>
						<div className="status-cell">
							<span className={`status-badge ${getStatusBadgeClass(product.isActive)}`}>
								{getStatusText(product.isActive)}
							</span>
						</div>
						<div className="actions-cell">
							<button
								className="action-btn edit-btn"
								onClick={() => onEdit(product)}
								title="Editar produto"
							>
								<FaEdit />
							</button>
							<button
								className="action-btn delete-btn"
								onClick={() => onDelete(product)}
								title="Remover produto"
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

ProductTable.displayName = 'ProductTable';

export default ProductTable;
