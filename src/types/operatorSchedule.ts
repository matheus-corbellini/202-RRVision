// Tipos para agenda de operadores
export interface Task {
	id: string;
	orderId: string;
	productName: string;
	activity: string;
	sector: string;
	sectorId: string;
	description: string;
	estimatedTime: number; // em minutos
	setupTime: number;
	startTime: string;
	endTime: string;
	status: "pending" | "in_progress" | "paused" | "completed" | "delayed" | "cancelled";
	actualStartTime?: string;
	actualEndTime?: string;
	actualTime?: number;
	priority: "low" | "medium" | "high" | "urgent";
	requiredSkills: string[];
	breaks: Break[];
	nonConformities: string[];
	// Associações
	assignedOperatorId: string;
	routeId?: string; // Roteiro operacional associado
	stepId?: string; // Etapa específica do roteiro
	// Controle de qualidade
	qualityChecks: QualityCheck[];
	notes?: string;
}

export interface Break {
	id: string;
	type: "coffee" | "lunch" | "bathroom" | "maintenance" | "emergency" | "other";
	startTime: string;
	endTime?: string;
	duration?: number;
	reason?: string;
	approvedBy?: string;
}

export interface QualityCheck {
	id: string;
	type: "start" | "end" | "intermediate";
	checkTime: string;
	operatorId: string;
	operatorName: string;
	status: "passed" | "failed" | "pending";
	notes?: string;
	attachments?: string[];
}

export interface OperatorStats {
	tasksCompleted: number;
	averageEfficiency: number;
	totalWorkTime: number;
	onTimeCompletion: number;
	ranking: number;
	dailyTarget: number;
	// Métricas adicionais
	totalBreaks: number;
	totalBreakTime: number;
	qualityScore: number;
	productivityIndex: number;
}

export interface ScheduleDay {
	date: string;
	tasks: Task[];
	breaks: Break[];
	totalWorkTime: number;
	totalBreakTime: number;
	efficiency: number;
}

export interface ScheduleWeek {
	weekStart: string;
	weekEnd: string;
	days: ScheduleDay[];
	weeklyStats: {
		totalTasks: number;
		completedTasks: number;
		averageEfficiency: number;
		totalWorkTime: number;
	};
}

export interface TaskFilters {
	status?: string[];
	priority?: string[];
	sector?: string[];
	operator?: string;
	dateRange?: {
		start: string;
		end: string;
	};
	hasNonConformities?: boolean;
	requiresQualityCheck?: boolean;
}

export interface TaskAssignment {
	id: string;
	taskId: string;
	operatorId: string;
	assignedAt: string;
	assignedBy: string;
	status: "active" | "completed" | "cancelled";
	notes?: string;
}
