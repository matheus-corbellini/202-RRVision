import React, { memo, useMemo, useRef, useEffect, useState } from 'react';
import { 
	FaEnvelope, 
	FaBuilding, 
	FaPhone, 
	FaUserTag, 
	FaEdit, 
	FaTrash,
	FaSort,
	FaSortUp,
	FaSortDown
} from "react-icons/fa";
import type { User } from "../../../types";

interface VirtualizedUserTableProps {
	users: User[];
	loading: boolean;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onSort: (field: 'name' | 'email' | 'company' | 'userType' | 'createdAt') => void;
	sortField: 'name' | 'email' | 'company' | 'userType' | 'createdAt';
	sortDirection: 'asc' | 'desc';
	itemHeight?: number;
	containerHeight?: number;
	overscan?: number;
}

const VirtualizedUserTable = memo<VirtualizedUserTableProps>(({ 
	users, 
	loading, 
	onEdit, 
	onDelete, 
	onSort, 
	sortField, 
	sortDirection,
	itemHeight = 80,
	containerHeight = 600,
	overscan = 5
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);

	const getRoleBadgeClass = (userType: string) => {
		switch (userType) {
			case "admin": return "role-admin";
			case "operator": return "role-operator";
			case "user": return "role-user";
			default: return "role-user";
		}
	};

	const getRoleText = (userType: string) => {
		switch (userType) {
			case "admin": return "Administrador";
			case "operator": return "Operador";
			case "user": return "Usuário";
			default: return "Usuário";
		}
	};

	const getSortIcon = (field: 'name' | 'email' | 'company' | 'userType' | 'createdAt') => {
		if (sortField !== field) return <FaSort />;
		return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
	};

	// Calcular itens visíveis
	const visibleRange = useMemo(() => {
		const startIndex = Math.floor(scrollTop / itemHeight);
		const endIndex = Math.min(
			startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
			users.length
		);
		return {
			start: Math.max(0, startIndex - overscan),
			end: endIndex
		};
	}, [scrollTop, itemHeight, containerHeight, overscan, users.length]);

	// Itens visíveis
	const visibleUsers = useMemo(() => {
		return users.slice(visibleRange.start, visibleRange.end);
	}, [users, visibleRange]);

	// Altura total da lista
	const totalHeight = users.length * itemHeight;

	// Offset para o primeiro item visível
	const offsetY = visibleRange.start * itemHeight;

	// Handler de scroll
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	};

	// Efeito para resetar scroll quando a lista mudar
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = 0;
			setScrollTop(0);
		}
	}, [users.length]);

	if (loading) {
		return (
			<div className="loading-container">
				<div className="spinner"></div>
				<p>Carregando usuários...</p>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="empty-state">
				<FaUserTag />
				<p>Nenhum usuário encontrado</p>
			</div>
		);
	}

	return (
		<div className="virtualized-table-container">
			{/* Header fixo */}
			<div className="table-header">
				<div className="sortable-header" onClick={() => onSort('name')}>
					Nome {getSortIcon('name')}
				</div>
				<div className="sortable-header" onClick={() => onSort('email')}>
					E-mail {getSortIcon('email')}
				</div>
				<div className="sortable-header" onClick={() => onSort('company')}>
					Empresa {getSortIcon('company')}
				</div>
				<div>Telefone</div>
				<div className="sortable-header" onClick={() => onSort('userType')}>
					Papel {getSortIcon('userType')}
				</div>
				<div>Ações</div>
			</div>

			{/* Container virtualizado */}
			<div
				ref={containerRef}
				className="virtualized-container"
				style={{ height: containerHeight, overflow: 'auto' }}
				onScroll={handleScroll}
			>
				<div style={{ height: totalHeight, position: 'relative' }}>
					<div
						style={{
							transform: `translateY(${offsetY}px)`,
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
						}}
					>
						{visibleUsers.map((user) => (
							<div
								key={user.id}
								className="table-row"
								style={{ height: itemHeight }}
							>
								<div className="user-info">
									<div className="user-avatar">
										{user.name?.charAt(0)?.toUpperCase() || "U"}
									</div>
									<div>
										<div className="user-name">{user.name || user.displayName || "—"}</div>
										<div className="user-type">{user.userType}</div>
									</div>
								</div>
								<div className="email-cell">
									<FaEnvelope />
									{user.email}
								</div>
								<div className="company-cell">
									<FaBuilding />
									{user.company || "—"}
								</div>
								<div className="phone-cell">
									<FaPhone />
									{user.phone || "—"}
								</div>
								<div className="role-cell">
									<span className={`role-badge ${getRoleBadgeClass(user.userType)}`}>
										<FaUserTag />
										{getRoleText(user.userType)}
									</span>
								</div>
								<div className="actions-cell">
									<button
										className="action-btn edit-btn"
										onClick={() => onEdit(user)}
										title="Editar usuário"
									>
										<FaEdit />
									</button>
									<button
										className="action-btn delete-btn"
										onClick={() => onDelete(user)}
										title="Remover usuário"
									>
										<FaTrash />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
});

VirtualizedUserTable.displayName = 'VirtualizedUserTable';

export default VirtualizedUserTable;
