import { memo } from 'react';
import { FaSearch, FaBox } from "react-icons/fa";
import Button from "../../Button/Button";

interface SearchBarProps {
	searchTerm: string;
	categoryFilter: string;
	categories: string[];
	onSearchChange: (value: string) => void;
	onFilterChange: (value: string) => void;
	onCreateProduct: () => void;
}

const SearchBar = memo<SearchBarProps>(({ 
	searchTerm,
	categoryFilter,
	categories,
	onSearchChange,
	onFilterChange,
	onCreateProduct
}) => {
	return (
		<div className="search-container">
			<div className="search-input-wrapper">
				<FaSearch className="search-icon" />
				<input
					type="text"
					placeholder="Buscar por código, nome, descrição ou categoria..."
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					className="search-input"
				/>
			</div>
			<div className="filter-wrapper">
				<select
					value={categoryFilter}
					onChange={(e) => onFilterChange(e.target.value)}
					className="category-filter"
				>
					<option value="all">Todas as categorias</option>
					{categories.map(category => (
						<option key={category} value={category}>{category}</option>
					))}
				</select>
			</div>
			<div className="search-actions">
				<Button onClick={onCreateProduct}>
					<FaBox />
					Criar Produto
				</Button>
			</div>
		</div>
	);
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
