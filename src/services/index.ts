// Exportar todos os serviços
export * from "./authService";
export * from "./blingService";
export * from "./blingDataMapper";
export * from "./dataService";
export * from "./attachmentService";
export * from "./agendaService";

// Exportar tipos específicos do operationalRoutesService para evitar conflitos
export type {
	OperationalRoute,
	Product,
	Step,
	RouteAssignment,

	RouteStats
} from "../types/operationalRoutes";

// Exportar tipos específicos do operatorScheduleService para evitar conflitos
export type {
	Task,
	Break,
	QualityCheck,
	OperatorStats,
	TaskFilters,
	TaskAssignment
} from "../types/operatorSchedule";

// Exportar interfaces de busca dos serviços
export type { SearchOptions, SearchResult } from "./dataService";
export type {
	SearchOptions as OperationalRouteSearchOptions,
	SearchResult as OperationalRouteSearchResult
} from "./operationalRoutesService";

// Exportar funções dos serviços sem conflitos de tipos
export {
	createOperationalRoute,
	updateOperationalRoute,
	deleteOperationalRoute,
	getOperationalRouteById,
	listAllOperationalRoutes,
	searchOperationalRoutes,
	getRoutesByProduct,
	getRoutesByStatus,
	getActiveRoutes,
	checkRouteExists,
	getRoutesBySector,
	getRoutesByOperator,
	createRouteAssignment,
	updateRouteAssignment,
	getRouteAssignments,
	getRoutesStats
} from "./operationalRoutesService";

export {
	createTask,
	updateTask,
	deleteTask,
	getTaskById,
	listAllTasks,
	searchTasks,
	getTasksByOperator,
	getTasksBySector,
	getTasksByDate,
	startTask,
	pauseTask,
	completeTask,
	startBreak,
	endBreak,
	addQualityCheck,
	getOperatorStats,
	createTaskAssignment,
	getTaskAssignments
} from "./operatorScheduleService";
