// Tipos para horários de trabalho por operador
import type { BaseEntity } from './base';

export interface WorkSchedule extends BaseEntity {
	operatorId: string; // Código do Operador (ID)
	operatorCode: string;
	operatorName: string;
	
	// Jornada base (início/fim)
	baseSchedule: {
		startTime: string; // formato HH:mm
		endTime: string; // formato HH:mm
		workDays: number[]; // 0-6 (domingo-sábado)
	};
	
	// Intervalos (pausa, almoço, descansos, café, banheiro, etc.)
	breaks: BreakInterval[];
	
	// Exceções de horário (ex: hora extra, falta)
	exceptions: ScheduleException[];
	
	// Status e controle
	isActive: boolean;
	effectiveDate: string; // Data de início da vigência
	endDate?: string; // Data de fim da vigência (opcional)
}

export interface BreakInterval extends BaseEntity {
	type: "coffee" | "lunch" | "bathroom" | "rest" | "maintenance" | "other";
	name: string;
	startTime: string; // formato HH:mm
	duration: number; // em minutos
	isPaid: boolean; // se é pausa remunerada
	description?: string;
}

export interface ScheduleException extends BaseEntity {
	type: "overtime" | "absence" | "late_arrival" | "early_departure" | "holiday" | "vacation" | "sick_leave" | "other";
	date: string; // formato YYYY-MM-DD
	startTime?: string; // formato HH:mm (para exceções com horário específico)
	endTime?: string; // formato HH:mm
	duration?: number; // em minutos
	reason: string;
	status: "pending" | "approved" | "rejected";
	approvedBy?: string;
	approvedAt?: string;
	notes?: string;
}

export interface WorkScheduleStats {
	totalScheduledHours: number;
	totalWorkedHours: number;
	totalBreakTime: number;
	totalOvertime: number;
	attendanceRate: number; // percentual de presença
	punctualityRate: number; // percentual de pontualidade
	exceptionsCount: number;
	breaksCount: number;
}

export interface WorkScheduleFilters {
	operatorId?: string;
	dateRange?: {
		start: string;
		end: string;
	};
	status?: string[];
	exceptionType?: string[];
	hasExceptions?: boolean;
}