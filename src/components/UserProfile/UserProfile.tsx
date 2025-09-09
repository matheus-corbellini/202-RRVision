import React from "react";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useOperator } from "../../hooks/useOperator";
import "./UserProfile.css";

/**
 * Componente para exibir informações do perfil do usuário
 * Funciona para todos os tipos de usuários (admin, supervisor, operator)
 */
const UserProfile: React.FC = () => {
	const {
		user,
		getUserType,
		getRole,
		getBasicInfo,
		getDisplayInfo,
		isOperator,
		getPermissions,
		hasPermission,
		canAccess,
		getNavigationInfo,
	} = useUserProfile();

	// Hook específico para operadores
	const operatorHook = useOperator();

	// Se não há usuário logado, não renderizar nada
	if (!user) {
		return null;
	}

	const basicInfo = getBasicInfo();
	const displayInfo = getDisplayInfo();
	const navigationInfo = getNavigationInfo();
	const permissions = getPermissions();

	return (
		<div className="user-profile">
			<div className="profile-header">
				<div className="user-avatar">
					{displayInfo.avatar ? (
						<img src={displayInfo.avatar} alt="Avatar" />
					) : (
						<div className="avatar-placeholder">
							{displayInfo.displayName.charAt(0).toUpperCase()}
						</div>
					)}
				</div>
				<div className="user-info">
					<h2>{displayInfo.displayName}</h2>
					<div className="user-badges">
						<span className={`user-type-badge ${getUserType()}`}>
							{displayInfo.userTypeLabel}
						</span>
						<span className={`role-badge ${getRole()}`}>
							{displayInfo.roleLabel}
						</span>
						{isOperator() && displayInfo.operatorCode && (
							<span className="operator-code-badge">
								#{displayInfo.operatorCode}
							</span>
						)}
						{isOperator() && displayInfo.operatorStatus && (
							<span className={`status-badge ${displayInfo.operatorStatus}`}>
								{displayInfo.operatorStatus}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="profile-content">
				{/* Informações básicas */}
				<section className="profile-section">
					<h3>Informações Básicas</h3>
					<div className="info-grid">
						<div className="info-item">
							<label>Nome:</label>
							<span>{basicInfo.name || "Não informado"}</span>
						</div>
						<div className="info-item">
							<label>Email:</label>
							<span>{basicInfo.email}</span>
						</div>
						<div className="info-item">
							<label>Empresa:</label>
							<span>{basicInfo.company || "Não informado"}</span>
						</div>
						<div className="info-item">
							<label>Telefone:</label>
							<span>{basicInfo.phone || "Não informado"}</span>
						</div>
						<div className="info-item">
							<label>Email Verificado:</label>
							<span className={basicInfo.emailVerified ? "verified" : "not-verified"}>
								{basicInfo.emailVerified ? "Sim" : "Não"}
							</span>
						</div>
					</div>
				</section>

				{/* Informações específicas do operador */}
				{isOperator() && (
					<section className="profile-section">
						<h3>Informações do Operador</h3>
						<div className="operator-info">
							<div className="info-grid">
								<div className="info-item">
									<label>Código:</label>
									<span>{operatorHook.getOperatorCode()}</span>
								</div>
								<div className="info-item">
									<label>Setor Principal:</label>
									<span>{operatorHook.getPrimarySector()}</span>
								</div>
								<div className="info-item">
									<label>Setores Secundários:</label>
									<span>
										{operatorHook.getSecondarySectors().length > 0
											? operatorHook.getSecondarySectors().join(", ")
											: "Nenhum"
										}
									</span>
								</div>
								<div className="info-item">
									<label>Atividades Treinadas:</label>
									<span>
										{operatorHook.getTrainedActivities().length > 0
											? operatorHook.getTrainedActivities().join(", ")
											: "Nenhuma"
										}
									</span>
								</div>
								<div className="info-item">
									<label>Status:</label>
									<span className={operatorHook.getStatus()}>
										{operatorHook.getStatus()}
									</span>
								</div>
								<div className="info-item">
									<label>Data de Admissão:</label>
									<span>
										{operatorHook.getTrainingInfo().admissionDate
											? new Date(operatorHook.getTrainingInfo().admissionDate || '').toLocaleDateString()
											: "Não informado"
										}
									</span>
								</div>
							</div>
						</div>
					</section>
				)}

				{/* Permissões e Acesso */}
				<section className="profile-section">
					<h3>Permissões e Acesso</h3>
					<div className="permissions-info">
						<div className="permissions-list">
							<h4>Permissões Ativas:</h4>
							{permissions.length > 0 ? (
								<div className="permissions-grid">
									{permissions.map((permission, index) => (
										<span key={index} className="permission-tag">
											{permission}
										</span>
									))}
								</div>
							) : (
								<p className="no-data">Nenhuma permissão específica</p>
							)}
						</div>

						<div className="access-info">
							<h4>Funcionalidades Acessíveis:</h4>
							<div className="access-grid">
								<div className="access-item">
									<label>Painel Administrativo:</label>
									<span className={navigationInfo.canAccessAdmin ? "yes" : "no"}>
										{navigationInfo.canAccessAdmin ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Gerenciar Usuários:</label>
									<span className={navigationInfo.canManageUsers ? "yes" : "no"}>
										{navigationInfo.canManageUsers ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Gerenciar Operadores:</label>
									<span className={navigationInfo.canManageOperators ? "yes" : "no"}>
										{navigationInfo.canManageOperators ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Visualizar Relatórios:</label>
									<span className={navigationInfo.canViewReports ? "yes" : "no"}>
										{navigationInfo.canViewReports ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Gerenciar Configurações:</label>
									<span className={navigationInfo.canManageSettings ? "yes" : "no"}>
										{navigationInfo.canManageSettings ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Gerenciar Alertas:</label>
									<span className={navigationInfo.canManageAlerts ? "yes" : "no"}>
										{navigationInfo.canManageAlerts ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Visualizar Dashboard:</label>
									<span className={navigationInfo.canViewDashboard ? "yes" : "no"}>
										{navigationInfo.canViewDashboard ? "Sim" : "Não"}
									</span>
								</div>
								<div className="access-item">
									<label>Gerenciar Tarefas:</label>
									<span className={navigationInfo.canManageTasks ? "yes" : "no"}>
										{navigationInfo.canManageTasks ? "Sim" : "Não"}
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Demonstração de funcionalidades específicas */}
				<section className="profile-section">
					<h3>Demonstração de Funcionalidades</h3>
					<div className="demo-section">
						<div className="demo-item">
							<label>Pode acessar gerenciamento de usuários:</label>
							<span className={canAccess("user-management") ? "yes" : "no"}>
								{canAccess("user-management") ? "Sim" : "Não"}
							</span>
						</div>
						<div className="demo-item">
							<label>Pode visualizar relatórios:</label>
							<span className={canAccess("reports") ? "yes" : "no"}>
								{canAccess("reports") ? "Sim" : "Não"}
							</span>
						</div>
						<div className="demo-item">
							<label>Tem permissão de criação de usuários:</label>
							<span className={hasPermission("users.create") ? "yes" : "no"}>
								{hasPermission("users.create") ? "Sim" : "Não"}
							</span>
						</div>
						{isOperator() && (
							<>
								<div className="demo-item">
									<label>Pode trabalhar no setor "Produção":</label>
									<span className={operatorHook.canWorkInSector("Produção") ? "yes" : "no"}>
										{operatorHook.canWorkInSector("Produção") ? "Sim" : "Não"}
									</span>
								</div>
								<div className="demo-item">
									<label>Pode executar atividade "Soldagem":</label>
									<span className={operatorHook.canExecuteActivity("Soldagem") ? "yes" : "no"}>
										{operatorHook.canExecuteActivity("Soldagem") ? "Sim" : "Não"}
									</span>
								</div>
							</>
						)}
					</div>
				</section>
			</div>
		</div>
	);
};

export default UserProfile;
