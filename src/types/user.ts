// Tipos específicos para usuários
export interface User {
	id: string;
	email: string;
	name: string;
	displayName?: string;
	company?: string;
	phone?: string;
	photoURL?: string | null;
	emailVerified: boolean;
	userType: string;
	role: string;
	createdAt: string;
	updatedAt: string;
	operatorData?: {
		code: string;
		primarySectorId: string;
		secondarySectorIds: string[];
		trainedActivities: string[];
		skills: string[];
		status: string;
		admissionDate: string;
		lastTrainingDate?: string;
		nextTrainingDate?: string;
		contractType: string;
		workSchedule: string;
		weeklyHours: number;
		supervisorId?: string;
		teamId?: string;
	};
}


