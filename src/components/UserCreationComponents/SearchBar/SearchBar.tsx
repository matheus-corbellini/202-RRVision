import { memo } from 'react';
import { FaSearch, FaUserPlus } from "react-icons/fa";
import Button from "../../Button/Button";

interface SearchBarProps {
	searchTerm: string;
	userTypeFilter: string;
	onSearchChange: (value: string) => void;
	onFilterChange: (value: string) => void;
	onCreateUser: () => void;
}

const SearchBar = memo<SearchBarProps>(({
	searchTerm,
	userTypeFilter,
	onSearchChange,
	onFilterChange,
	onCreateUser
}) => {
	return (
		<div className="search-container">
			<div className="search-input-wrapper">
				<FaSearch className="search-icon" />
				<input
					type="text"
					placeholder="Buscar por nome, e-mail ou empresa..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="search-input"
				/>
			</div>
			<div className="filter-wrapper">
				<select
					value={userTypeFilter}
					onChange={(e) => onFilterChange(e.target.value)}
					className="user-type-filter"
				>
					<option value="all">Todos os tipos</option>
					<option value="admin">Administradores</option>
					<option value="operator">Operadores</option>
					<option value="user">Usuários</option>
				</select>
			</div>
			<div className="search-actions">
				<Button onClick={onCreateUser}>
					<FaUserPlus />
					Criar Usuário
				</Button>
			</div>
		</div>
	);
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
