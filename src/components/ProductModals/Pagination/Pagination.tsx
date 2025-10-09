import { memo } from 'react';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	startIndex: number;
	itemsPerPage: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPreviousPage: () => void;
	onNextPage: () => void;
}

const Pagination = memo<PaginationProps>(({ 
	currentPage,
	totalPages,
	startIndex,
	itemsPerPage,
	totalItems,
	onPageChange,
	onPreviousPage,
	onNextPage
}) => {
	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
	const startItem = totalItems > 0 ? startIndex + 1 : 0;

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;
		
		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Show pages around current page
			const start = Math.max(1, currentPage - 2);
			const end = Math.min(totalPages, currentPage + 2);
			
			if (start > 1) {
				pages.push(1);
				if (start > 2) {
					pages.push('...');
				}
			}
			
			for (let i = start; i <= end; i++) {
				pages.push(i);
			}
			
			if (end < totalPages) {
				if (end < totalPages - 1) {
					pages.push('...');
				}
				pages.push(totalPages);
			}
		}
		
		return pages;
	};

	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="pagination">
			<div className="pagination-info">
				Mostrando {startItem} a {endIndex} de {totalItems} produtos
			</div>
			
			<div className="pagination-controls">
				<button 
					onClick={onPreviousPage}
					disabled={currentPage === 1}
					className="pagination-btn"
					title="Página anterior"
				>
					Anterior
				</button>
				
				<div className="pagination-numbers">
					{getPageNumbers().map((page, index) => (
						<button
							key={index}
							onClick={() => typeof page === 'number' ? onPageChange(page) : undefined}
							disabled={page === '...'}
							className={`pagination-number ${page === currentPage ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
							title={typeof page === 'number' ? `Ir para página ${page}` : undefined}
						>
							{page}
						</button>
					))}
				</div>
				
				<button 
					onClick={onNextPage}
					disabled={currentPage === totalPages}
					className="pagination-btn"
					title="Próxima página"
				>
					Próxima
				</button>
			</div>
		</div>
	);
});

Pagination.displayName = 'Pagination';

export default Pagination;
