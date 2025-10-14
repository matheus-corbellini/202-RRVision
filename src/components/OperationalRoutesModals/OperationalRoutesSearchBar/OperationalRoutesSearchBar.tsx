import { memo } from 'react';
import { FaSearch, FaRoute } from "react-icons/fa";
import Button from "../../Button/Button";

interface OperationalRoutesSearchBarProps {
	searchTerm: string;
	statusFilter: string;
	onSearchChange: (value: string) => void;
	onFilterChange: (value: string) => void;
	onCreateRoute: () => void;
}

const OperationalRoutesSearchBar = memo<OperationalRoutesSearchBarProps>(({ 
	searchTerm,
	statusFilter,
	onSearchChange,
	onFilterChange,
	onCreateRoute
}) => {
	return (
		<div className="search-container">
			<div className="search-input-wrapper">
				<FaSearch className="search-icon" />
				<input
					type="text"
					placeholder="Buscar por produto ou código..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="search-input"
				/>
			</div>
			<div className="filter-wrapper">
				<select
					value={statusFilter}
					onChange={(e) => onFilterChange(e.target.value)}
					className="status-filter"
				>
					<option value="all">Todos os status</option>
					<option value="active">Ativo</option>
					<option value="inactive">Inativo</option>
					<option value="draft">Rascunho</option>
				</select>
			</div>
			<div className="search-actions">
				<Button onClick={onCreateRoute}>
					<FaRoute />
					Novo Roteiro
				</Button>
			</div>
		</div>
	);
});

OperationalRoutesSearchBar.displayName = 'OperationalRoutesSearchBar';

export default OperationalRoutesSearchBar;
