import { useAuth } from "./useAuth";

/**
 * Hook para acessar dados do perfil do usuário
 * Funciona para todos os tipos de usuários (admin, supervisor, operator)
 */
export const useUserProfile = () => {
	const { user } = useAuth();

	// Verificar tipo de usuário
	const getUserType = (): string => {
		return user?.userType || "operator";
	};

	const getRole = (): string => {
		return user?.role || "operator";
	};

	// Verificar se é um tipo específico de usuário
	const isAdmin = (): boolean => {
		return getUserType() === "admin" || getRole() === "admin";
	};

	const isSupervisor = (): boolean => {
		return getUserType() === "supervisor" || getRole() === "supervisor";
	};

	const isOperator = (): boolean => {
		return getUserType() === "operator" && !!user?.operatorData;
	};

	// Obter dados básicos do usuário
	const getBasicInfo = () => {
		return {
			id: user?.id,
			name: user?.name,
			email: user?.email,
			displayName: user?.displayName,
			company: user?.company,
			phone: user?.phone,
			photoURL: user?.photoURL,
			emailVerified: user?.emailVerified,
			createdAt: user?.createdAt,
			updatedAt: user?.updatedAt,
		};
	};

	// Obter permissões baseadas no tipo de usuário
	const getPermissions = (): string[] => {
		const userType = getUserType();

		// Permissões baseadas no tipo de usuário
		const basePermissions = {
			admin: [
				"users.create", "users.read", "users.update", "users.delete",
				"operators.create", "operators.read", "operators.update", "operators.delete",
				"reports.read", "reports.export", "settings.read", "settings.update",
				"dashboard.read", "alerts.read", "alerts.manage"
			],
			supervisor: [
				"operators.read", "operators.update",
				"reports.read", "reports.export",
				"dashboard.read", "alerts.read", "alerts.manage"
			],
			operator: [
				"tasks.read", "tasks.update",
				"dashboard.read", "alerts.read"
			]
		};

		return basePermissions[userType as keyof typeof basePermissions] || basePermissions.operator;
	};

	// Verificar se tem permissão específica
	const hasPermission = (permission: string): boolean => {
		return getPermissions().includes(permission);
	};

	// Verificar se pode acessar uma funcionalidade
	const canAccess = (feature: string): boolean => {
		const permissions = getPermissions();
		
		// Mapeamento de funcionalidades para permissões
		const featurePermissions: Record<string, string[]> = {
			"user-management": ["users.create", "users.read", "users.update", "users.delete"],
			"operator-management": ["operators.create", "operators.read", "operators.update", "operators.delete"],
			"reports": ["reports.read", "reports.export"],
			"settings": ["settings.read", "settings.update"],
			"alerts": ["alerts.read", "alerts.manage"],
			"dashboard": ["dashboard.read"],
			"tasks": ["tasks.read", "tasks.update"]
		};

		const requiredPermissions = featurePermissions[feature] || [];
		return requiredPermissions.some(permission => permissions.includes(permission));
	};

	// Obter informações específicas do operador (se for operador)
	const getOperatorInfo = () => {
		if (!isOperator()) return null;
		
		return {
			code: user?.operatorData?.code || "",
			primarySectorId: user?.operatorData?.primarySectorId || "",
			primarySectorName: user?.operatorData?.primarySectorName,
			secondarySectorIds: user?.operatorData?.secondarySectorIds || [],
			secondarySectorNames: user?.operatorData?.secondarySectorNames,
			trainedActivities: user?.operatorData?.trainedActivities || [],
			status: user?.operatorData?.status || "inactive",
			admissionDate: user?.operatorData?.admissionDate || "",
			lastTrainingDate: user?.operatorData?.lastTrainingDate,
			nextTrainingDate: user?.operatorData?.nextTrainingDate,
			contractType: user?.operatorData?.contractType || "clt",
			workSchedule: user?.operatorData?.workSchedule || "day",
			weeklyHours: user?.operatorData?.weeklyHours || 40,
			supervisorId: user?.operatorData?.supervisorId,
			supervisorName: user?.operatorData?.supervisorName,
			teamId: user?.operatorData?.teamId,
			teamName: user?.operatorData?.teamName,
			skills: user?.operatorData?.skills || [],
			certifications: user?.operatorData?.certifications || [],
			accessLevel: user?.operatorData?.accessLevel || "basic",
			permissions: user?.operatorData?.permissions || [],
		};
	};

	// Obter informações de navegação baseadas no tipo de usuário
	const getNavigationInfo = () => {
		
		return {
			canAccessAdmin: isAdmin(),
			canManageUsers: canAccess("user-management"),
			canManageOperators: canAccess("operator-management"),
			canViewReports: canAccess("reports"),
			canManageSettings: canAccess("settings"),
			canManageAlerts: canAccess("alerts"),
			canViewDashboard: canAccess("dashboard"),
			canManageTasks: canAccess("tasks"),
			// Informações específicas para operadores
			isOperator: isOperator(),
			operatorCode: isOperator() ? getOperatorInfo()?.code : null,
			operatorSectors: isOperator() ? getOperatorInfo()?.secondarySectorIds : [],
		};
	};

	// Obter informações de exibição para a interface
	const getDisplayInfo = () => {
		const basicInfo = getBasicInfo();
		const userType = getUserType();
		
		return {
			displayName: basicInfo.displayName || basicInfo.name || "Usuário",
			userTypeLabel: getUserTypeLabel(userType),
			roleLabel: getRoleLabel(getRole()),
			avatar: basicInfo.photoURL,
			company: basicInfo.company,
			// Informações específicas para operadores
			operatorCode: isOperator() ? getOperatorInfo()?.code : null,
			operatorStatus: isOperator() ? getOperatorInfo()?.status : null,
		};
	};

	// Funções auxiliares para labels
	const getUserTypeLabel = (userType: string): string => {
		const labels: Record<string, string> = {
			admin: "Administrador",
			supervisor: "Supervisor",
			operator: "Operador"
		};
		return labels[userType] || "Operador";
	};

	const getRoleLabel = (role: string): string => {
		const labels: Record<string, string> = {
			admin: "Administrador",
			supervisor: "Supervisor",
			operator: "Operador"
		};
		return labels[role] || "Operador";
	};

	return {
		// Informações básicas
		user,
		getUserType,
		getRole,
		getBasicInfo,
		getDisplayInfo,
		
		// Verificações de tipo
		isAdmin,
		isSupervisor,
		isOperator,
		
		// Permissões e acesso
		getPermissions,
		hasPermission,
		canAccess,
		
		// Informações específicas
		getOperatorInfo,
		getNavigationInfo,
	};
};
