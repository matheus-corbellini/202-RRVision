import { memo } from 'react';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface OperationalRoutesPaginationProps {
	currentPage: number;
	totalPages: number;
	startIndex: number;
	itemsPerPage: number;
	totalItems: number;
	onPageChange: (page: number) => void;
	onPreviousPage: () => void;
	onNextPage: () => void;
}

const OperationalRoutesPagination = memo<OperationalRoutesPaginationProps>(({
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

	const renderPageNumbers = () => {
		const pages = [];
		const maxVisiblePages = 5;
		
		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
		
		if (endPage - startPage + 1 < maxVisiblePages) {
			startPage = Math.max(1, endPage - maxVisiblePages + 1);
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(
				<button
					key={i}
					className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
					onClick={() => onPageChange(i)}
				>
					{i}
				</button>
			);
		}

		return pages;
	};

	if (totalPages <= 1) return null;

	return (
		<div className="pagination">
			<div className="pagination-info">
				Mostrando {startIndex + 1} a {endIndex} de {totalItems} roteiros
			</div>
			<div className="pagination-controls">
				<button
					className="pagination-btn"
					onClick={onPreviousPage}
					disabled={currentPage === 1}
				>
					<FaChevronLeft />
				</button>
				{renderPageNumbers()}
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

OperationalRoutesPagination.displayName = 'OperationalRoutesPagination';

export default OperationalRoutesPagination;
