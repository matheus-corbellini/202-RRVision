import { memo } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
	if (totalPages <= 1) return null;

	const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

	return (
		<div className="pagination-container">
			<div className="pagination-info">
				Mostrando {startIndex + 1} - {endIndex} de {totalItems} usuários
			</div>
			<div className="pagination-controls">
				<button
					className="pagination-btn"
					onClick={onPreviousPage}
					disabled={currentPage === 1}
				>
					<FaChevronLeft />
				</button>
				
				{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					const page = i + 1;
					return (
						<button
							key={page}
							className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
							onClick={() => onPageChange(page)}
						>
							{page}
						</button>
					);
				})}
				
				<button
					className="pagination-btn"
					onClick={onNextPage}
					disabled={currentPage === totalPages}
				>
					<FaChevronRight />
				</button>
			</div>
		</div>
	);
});

Pagination.displayName = 'Pagination';

export default Pagination;
