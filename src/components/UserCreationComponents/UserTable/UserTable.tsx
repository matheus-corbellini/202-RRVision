import { memo, lazy, Suspense } from 'react';
import { 
	FaUserTag, 
	FaEdit, 
	FaTrash,
	FaSort,
	FaSortUp,
	FaSortDown
} from "react-icons/fa";
import type { User } from "../../../types";

// Lazy load virtualized table for large lists
const VirtualizedUserTable = lazy(() => import("../VirtualizedUserTable/VirtualizedUserTable"));

interface UserTableProps {
	users: User[];
	loading: boolean;
	onEdit: (user: User) => void;
	onDelete: (user: User) => void;
	onSort: (field: 'name' | 'email' | 'company' | 'userType' | 'createdAt') => void;
	sortField: 'name' | 'email' | 'company' | 'userType' | 'createdAt';
	sortDirection: 'asc' | 'desc';
	useVirtualization?: boolean;
	virtualizationThreshold?: number;
}

const UserTable = memo<UserTableProps>(({ 
	users, 
	loading, 
	onEdit, 
	onDelete, 
	onSort, 
	sortField, 
	sortDirection,
	useVirtualization = true,
	virtualizationThreshold = 100
}) => {
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

	// Decidir se deve usar virtualização
	const shouldUseVirtualization = useVirtualization && users.length > virtualizationThreshold;

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

	// Usar tabela virtualizada para listas grandes
	if (shouldUseVirtualization) {
		return (
			<Suspense fallback={<div className="loading-container"><div className="spinner"></div><p>Carregando tabela...</p></div>}>
				<VirtualizedUserTable
					users={users}
					loading={loading}
					onEdit={onEdit}
					onDelete={onDelete}
					onSort={onSort}
					sortField={sortField}
					sortDirection={sortDirection}
				/>
			</Suspense>
		);
	}

	return (
		<div className="users-table">
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

			{users.map((user) => (
				<div key={user.id} className="table-row">
					<div className="user-info">
						<div>
							<div className="user-name">{user.name || user.displayName || "—"}</div>
						</div>
					</div>
					<div className="email-cell">
						{user.email}
					</div>
					<div className="company-cell">
						{user.company || "—"}
					</div>
					<div className="phone-cell">
						{user.phone || "—"}
					</div>
					<div className="role-cell">
						<span className={`role-badge ${getRoleBadgeClass(user.userType)}`}>
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
	);
});

UserTable.displayName = 'UserTable';

export default UserTable;
