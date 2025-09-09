import { useUserProfile } from "./useUserProfile";

/**
 * Hook para acessar dados específicos do operador
 * Fornece métodos utilitários para trabalhar com dados de operadores
 * Requer que o usuário seja do tipo "operator"
 */
export const useOperator = () => {
	const { isOperator: checkIsOperator, getOperatorInfo } = useUserProfile();

	// Verificar se o usuário atual é um operador
	const isOperator = (): boolean => {
		return checkIsOperator();
	};

	// Obter dados do operador
	const getOperatorData = () => {
		if (!isOperator()) return null;
		return getOperatorInfo();
	};

	// Obter código do operador
	const getOperatorCode = (): string => {
		return getOperatorData()?.code || "";
	};

	// Obter setor principal
	const getPrimarySector = (): string => {
		return getOperatorData()?.primarySectorId || "";
	};

	// Obter setores secundários
	const getSecondarySectors = (): string[] => {
		return getOperatorData()?.secondarySectorIds || [];
	};

	// Obter todos os setores (principal + secundários)
	const getAllSectors = (): string[] => {
		const primary = getPrimarySector();
		const secondary = getSecondarySectors();
		return primary ? [primary, ...secondary] : secondary;
	};

	// Obter atividades treinadas
	const getTrainedActivities = (): string[] => {
		return getOperatorData()?.trainedActivities || [];
	};

	// Obter status do operador
	const getStatus = (): string => {
		return getOperatorData()?.status || "inactive";
	};

	// Verificar se o operador está ativo
	const isActive = (): boolean => {
		return getStatus() === "active";
	};

	// Obter supervisor
	const getSupervisor = (): { id?: string; name?: string } => {
		const data = getOperatorData();
		return {
			id: data?.supervisorId,
			name: data?.supervisorName
		};
	};

	// Obter equipe
	const getTeam = (): { id?: string; name?: string } => {
		const data = getOperatorData();
		return {
			id: data?.teamId,
			name: data?.teamName
		};
	};

	// Obter habilidades
	const getSkills = (): string[] => {
		return getOperatorData()?.skills || [];
	};

	// Obter certificações
	const getCertifications = () => {
		return getOperatorData()?.certifications || [];
	};

	// Obter nível de acesso
	const getAccessLevel = (): string => {
		return getOperatorData()?.accessLevel || "basic";
	};

	// Obter permissões
	const getPermissions = (): string[] => {
		return getOperatorData()?.permissions || [];
	};

	// Verificar se tem permissão específica
	const hasPermission = (permission: string): boolean => {
		return getPermissions().includes(permission);
	};

	// Verificar se pode executar atividade específica
	const canExecuteActivity = (activityId: string): boolean => {
		return getTrainedActivities().includes(activityId);
	};

	// Verificar se pode trabalhar em setor específico
	const canWorkInSector = (sectorId: string): boolean => {
		return getAllSectors().includes(sectorId);
	};

	// Obter informações de treinamento
	const getTrainingInfo = () => {
		const data = getOperatorData();
		return {
			lastTraining: data?.lastTrainingDate,
			nextTraining: data?.nextTrainingDate,
			admissionDate: data?.admissionDate,
			activities: getTrainedActivities()
		};
	};

	// Obter informações contratuais
	const getContractInfo = () => {
		const data = getOperatorData();
		return {
			type: data?.contractType,
			workSchedule: data?.workSchedule,
			weeklyHours: data?.weeklyHours
		};
	};

	return {
		// Dados básicos
		isOperator,
		getOperatorData,
		getOperatorCode,
		
		// Setores e atividades
		getPrimarySector,
		getSecondarySectors,
		getAllSectors,
		getTrainedActivities,
		canExecuteActivity,
		canWorkInSector,
		
		// Status e permissões
		getStatus,
		isActive,
		getAccessLevel,
		getPermissions,
		hasPermission,
		
		// Relacionamentos
		getSupervisor,
		getTeam,
		
		// Habilidades e certificações
		getSkills,
		getCertifications,
		
		// Informações adicionais
		getTrainingInfo,
		getContractInfo,
	};
};
