import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	doc,
	getDoc,
	updateDoc,
	addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { Task, Break } from "../types/operatorSchedule";

// Interface para documento da coleção Agenda
export interface AgendaItem {
	id: string;
	userId: string;
	date: string; // formato: "YYYY-MM-DD"
	time: string; // formato: "HH:MM"
	taskId: string;
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
	assignedOperatorId: string;
	routeId?: string;
	stepId?: string;
	qualityChecks: any[];
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

// Buscar agenda do usuário por data
export const getUserAgendaByDate = async (
	userId: string,
	date: string
): Promise<AgendaItem[]> => {
	try {
		const agendaRef = collection(db, "Agenda");
		const q = query(
			agendaRef,
			where("userId", "==", userId),
			where("date", "==", date),
			orderBy("time", "asc")
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => ({
			...(doc.data() as Record<string, unknown>),
			id: doc.id,
		})) as AgendaItem[];
	} catch (error) {
		console.error("Erro ao buscar agenda do usuário por data:", error);
		throw error;
	}
};

// Buscar agenda do usuário por período
export const getUserAgendaByDateRange = async (
	userId: string,
	startDate: string,
	endDate: string
): Promise<AgendaItem[]> => {
	try {
		const agendaRef = collection(db, "Agenda");
		const q = query(
			agendaRef,
			where("userId", "==", userId),
			where("date", ">=", startDate),
			where("date", "<=", endDate),
			orderBy("date", "asc"),
			orderBy("time", "asc")
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => ({
			...(doc.data() as Record<string, unknown>),
			id: doc.id,
		})) as AgendaItem[];
	} catch (error) {
		console.error("Erro ao buscar agenda do usuário por período:", error);
		throw error;
	}
};

// Buscar item específico da agenda
export const getAgendaItem = async (itemId: string): Promise<AgendaItem | null> => {
	try {
		const agendaRef = doc(db, "Agenda", itemId);
		const snapshot = await getDoc(agendaRef);
		
		if (snapshot.exists()) {
			return {
				...(snapshot.data() as Record<string, unknown>),
				id: snapshot.id,
			} as AgendaItem;
		}
		
		return null;
	} catch (error) {
		console.error("Erro ao buscar item da agenda:", error);
		throw error;
	}
};

// Atualizar status de um item da agenda
export const updateAgendaItemStatus = async (
	itemId: string,
	status: AgendaItem["status"]
): Promise<void> => {
	try {
		const agendaRef = doc(db, "Agenda", itemId);
		const updates: Partial<AgendaItem> = {
			status,
			updatedAt: new Date().toISOString(),
		};

		// Adicionar timestamp de início/fim baseado no status
		if (status === "in_progress") {
			updates.actualStartTime = new Date().toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (status === "completed") {
			updates.actualEndTime = new Date().toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			});
		}

		await updateDoc(agendaRef, updates);
	} catch (error) {
		console.error("Erro ao atualizar status do item da agenda:", error);
		throw error;
	}
};

// Adicionar pausa a um item da agenda
export const addBreakToAgendaItem = async (
	itemId: string,
	breakData: Omit<Break, "id">
): Promise<void> => {
	try {
		const agendaRef = doc(db, "Agenda", itemId);
		const breakItem: Break = {
			...breakData,
			id: `break-${Date.now()}`,
		};

		// Buscar o item atual para adicionar a pausa
		const currentItem = await getAgendaItem(itemId);
		if (!currentItem) {
			throw new Error("Item da agenda não encontrado");
		}

		const updatedBreaks = [...currentItem.breaks, breakItem];
		await updateDoc(agendaRef, {
			breaks: updatedBreaks,
			updatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Erro ao adicionar pausa ao item da agenda:", error);
		throw error;
	}
};

// Finalizar pausa de um item da agenda
export const endBreakInAgendaItem = async (
	itemId: string,
	breakId: string
): Promise<void> => {
	try {
		const agendaRef = doc(db, "Agenda", itemId);
		const currentItem = await getAgendaItem(itemId);
		
		if (!currentItem) {
			throw new Error("Item da agenda não encontrado");
		}

		const updatedBreaks = currentItem.breaks.map((breakItem) => {
			if (breakItem.id === breakId && !breakItem.endTime) {
				const endTime = new Date().toLocaleTimeString("pt-BR", {
					hour: "2-digit",
					minute: "2-digit",
				});
				const duration = calculateBreakDuration(breakItem.startTime, endTime);
				
				return {
					...breakItem,
					endTime,
					duration,
				};
			}
			return breakItem;
		});

		await updateDoc(agendaRef, {
			breaks: updatedBreaks,
			updatedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Erro ao finalizar pausa do item da agenda:", error);
		throw error;
	}
};

// Calcular duração da pausa
const calculateBreakDuration = (startTime: string, endTime: string): number => {
	const [startHour, startMin] = startTime.split(":").map(Number);
	const [endHour, endMin] = endTime.split(":").map(Number);
	return endHour * 60 + endMin - (startHour * 60 + startMin);
};

// Criar documento padrão na agenda para um usuário
export const createDefaultAgendaItem = async (
	userId: string,
	date: string,
	time: string = "08:00"
): Promise<AgendaItem> => {
	try {
		const defaultAgendaItem: Omit<AgendaItem, "id"> = {
			userId,
			date,
			time,
			taskId: `default-${Date.now()}`,
			orderId: "AGENDA-DEFAULT",
			productName: "Tarefa Padrão",
			activity: "Preparação do Dia",
			sector: "Geral",
			sectorId: "default",
			description: "Tarefa padrão criada automaticamente para o dia de trabalho",
			estimatedTime: 60, // 1 hora
			setupTime: 15, // 15 minutos
			startTime: time,
			endTime: "09:15", // 1 hora e 15 minutos depois
			status: "pending",
			priority: "medium",
			requiredSkills: ["Geral"],
			breaks: [],
			nonConformities: [],
			assignedOperatorId: userId,
			qualityChecks: [],
			notes: "Tarefa criada automaticamente pelo sistema",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const agendaRef = collection(db, "Agenda");
		const docRef = await addDoc(agendaRef, defaultAgendaItem);
		
		// Garantir que o campo 'id' existe no documento
		await updateDoc(docRef, { id: docRef.id });
		
		return {
			...defaultAgendaItem,
			id: docRef.id,
		};
	} catch (error) {
		console.error("Erro ao criar item padrão da agenda:", error);
		throw error;
	}
};

// Interface para jornada de trabalho
export interface WorkShift {
	id: string;
	userId: string;
	date: string; // formato: "YYYY-MM-DD"
	startTime: string; // formato: "HH:MM"
	endTime: string; // formato: "HH:MM"
	duration: string; // formato: "HH:MM:SS"
	totalMinutes: number;
	status: "completed" | "interrupted";
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

// Salvar jornada de trabalho
export const saveWorkShift = async (
	userId: string,
	startTime: string,
	endTime: string,
	duration: string,
	totalMinutes: number,
	notes?: string
): Promise<string> => {
	try {
		const today = new Date();
		const dateString = today.toISOString().split('T')[0];
		
		const workShift: Omit<WorkShift, "id"> = {
			userId,
			date: dateString,
			startTime,
			endTime,
			duration,
			totalMinutes,
			status: "completed",
			notes,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const shiftsRef = collection(db, "WorkShifts");
		const docRef = await addDoc(shiftsRef, workShift);
		
		// Garantir que o campo 'id' existe no documento
		await updateDoc(docRef, { id: docRef.id });
		
		console.log(`Jornada salva com ID: ${docRef.id}`);
		return docRef.id;
	} catch (error) {
		console.error("Erro ao salvar jornada:", error);
		throw error;
	}
};

// Buscar jornadas de trabalho do usuário
export const getUserWorkShifts = async (
	userId: string,
	startDate?: string,
	endDate?: string
): Promise<WorkShift[]> => {
	try {
		const shiftsRef = collection(db, "WorkShifts");
		let q = query(shiftsRef, where("userId", "==", userId));

		if (startDate && endDate) {
			q = query(q, where("date", ">=", startDate), where("date", "<=", endDate));
		}

		q = query(q, orderBy("date", "desc"), orderBy("startTime", "desc"));

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => ({
			...(doc.data() as Record<string, unknown>),
			id: doc.id,
		})) as WorkShift[];
	} catch (error) {
		console.error("Erro ao buscar jornadas:", error);
		throw error;
	}
};

// Buscar jornadas do dia atual
export const getTodayWorkShifts = async (userId: string): Promise<WorkShift[]> => {
	try {
		const today = new Date().toISOString().split('T')[0];
		return await getUserWorkShifts(userId, today, today);
	} catch (error) {
		console.error("Erro ao buscar jornadas de hoje:", error);
		throw error;
	}
};

// Interface para registro de tempo trabalhado
export interface WorkTimeRecord {
	id: string;
	userId: string;
	operatorId: string;
	date: string; // formato: "YYYY-MM-DD"
	startTime: string; // formato: "HH:MM:SS"
	endTime: string; // formato: "HH:MM:SS"
	duration: string; // formato: "HH:MM:SS"
	totalMinutes: number;
	totalSeconds: number;
	status: "active" | "completed" | "interrupted";
	notes?: string;
	createdAt: string;
	updatedAt: string;
}

// Buscar registro de tempo trabalhado do dia atual
export const getTodayWorkTimeRecord = async (
	operatorId: string
): Promise<WorkTimeRecord | null> => {
	try {
		const today = new Date().toISOString().split('T')[0];
		const workTimeRef = collection(db, "WorkTimeRecords");
		const q = query(
			workTimeRef,
			where("operatorId", "==", operatorId),
			where("date", "==", today)
		);

		const snapshot = await getDocs(q);
		if (snapshot.empty) {
			return null;
		}

		const doc = snapshot.docs[0];
		return {
			...(doc.data() as Record<string, unknown>),
			id: doc.id,
		} as WorkTimeRecord;
	} catch (error) {
		console.error("Erro ao buscar registro de tempo trabalhado de hoje:", error);
		throw error;
	}
};

// Criar ou atualizar registro de tempo trabalhado do operador
export const saveOrUpdateWorkTimeRecord = async (
	userId: string,
	operatorId: string,
	startTime: string,
	endTime: string,
	duration: string,
	totalMinutes: number,
	notes?: string
): Promise<string> => {
	try {
		const today = new Date();
		const dateString = today.toISOString().split('T')[0];
		
		// Verificar se já existe um registro para hoje
		const existingRecord = await getTodayWorkTimeRecord(operatorId);
		
		// Calcular total de segundos para precisão
		const [hours, minutes, seconds] = duration.split(":").map(Number);
		const totalSeconds = hours * 3600 + minutes * 60 + seconds;
		
		console.log(`Salvando registro - Duration: ${duration}, Hours: ${hours}, Minutes: ${minutes}, Seconds: ${seconds}`);
		console.log(`Total minutes: ${totalMinutes}, Total seconds: ${totalSeconds}`);
		
		if (existingRecord) {
			// Atualizar registro existente
			const workTimeRef = doc(db, "WorkTimeRecords", existingRecord.id);
			const updates: Partial<WorkTimeRecord> = {
				endTime,
				duration,
				totalMinutes,
				totalSeconds,
				status: "completed",
				notes,
				updatedAt: new Date().toISOString(),
			};

			await updateDoc(workTimeRef, updates);
			console.log(`Registro de tempo trabalhado atualizado com ID: ${existingRecord.id}`);
			return existingRecord.id;
		} else {
			// Criar novo registro
			const workTimeRecord: Omit<WorkTimeRecord, "id"> = {
				userId,
				operatorId,
				date: dateString,
				startTime,
				endTime,
				duration,
				totalMinutes,
				totalSeconds,
				status: "completed",
				notes,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			const workTimeRef = collection(db, "WorkTimeRecords");
			const docRef = await addDoc(workTimeRef, workTimeRecord);
			
			// Garantir que o campo 'id' existe no documento
			await updateDoc(docRef, { id: docRef.id });
			
			console.log(`Novo registro de tempo trabalhado criado com ID: ${docRef.id}`);
			return docRef.id;
		}
	} catch (error) {
		console.error("Erro ao salvar/atualizar registro de tempo trabalhado:", error);
		throw error;
	}
};

// Atualizar duração do registro de tempo trabalhado em tempo real
export const updateWorkTimeRecordDuration = async (
	operatorId: string,
	duration: string,
	totalMinutes: number
): Promise<void> => {
	try {
		const existingRecord = await getTodayWorkTimeRecord(operatorId);
		
		if (existingRecord) {
			// Calcular total de segundos para precisão
			const [hours, minutes, seconds] = duration.split(":").map(Number);
			const totalSeconds = hours * 3600 + minutes * 60 + seconds;
			
			const workTimeRef = doc(db, "WorkTimeRecords", existingRecord.id);
			const updates: Partial<WorkTimeRecord> = {
				duration,
				totalMinutes,
				totalSeconds,
				status: "active",
				updatedAt: new Date().toISOString(),
			};

			await updateDoc(workTimeRef, updates);
			console.log(`Duração do registro atualizada: ${duration}`);
		}
	} catch (error) {
		console.error("Erro ao atualizar duração do registro:", error);
		throw error;
	}
};

// Buscar registros de tempo trabalhado do operador
export const getOperatorWorkTimeRecords = async (
	operatorId: string,
	startDate?: string,
	endDate?: string
): Promise<WorkTimeRecord[]> => {
	try {
		const workTimeRef = collection(db, "WorkTimeRecords");
		let q = query(workTimeRef, where("operatorId", "==", operatorId));

		if (startDate && endDate) {
			q = query(q, where("date", ">=", startDate), where("date", "<=", endDate));
		}

		q = query(q, orderBy("date", "desc"), orderBy("startTime", "desc"));

		const snapshot = await getDocs(q);
		return snapshot.docs.map((doc) => ({
			...(doc.data() as Record<string, unknown>),
			id: doc.id,
		})) as WorkTimeRecord[];
	} catch (error) {
		console.error("Erro ao buscar registros de tempo trabalhado:", error);
		throw error;
	}
};

// Converter AgendaItem para Task (para compatibilidade com componentes existentes)
export const agendaItemToTask = (agendaItem: AgendaItem): Task => {
	return {
		id: agendaItem.id,
		orderId: agendaItem.orderId,
		productName: agendaItem.productName,
		activity: agendaItem.activity,
		sector: agendaItem.sector,
		sectorId: agendaItem.sectorId,
		description: agendaItem.description,
		estimatedTime: agendaItem.estimatedTime,
		setupTime: agendaItem.setupTime,
		startTime: agendaItem.startTime,
		endTime: agendaItem.endTime,
		status: agendaItem.status,
		actualStartTime: agendaItem.actualStartTime,
		actualEndTime: agendaItem.actualEndTime,
		actualTime: agendaItem.actualTime,
		priority: agendaItem.priority,
		requiredSkills: agendaItem.requiredSkills,
		breaks: agendaItem.breaks,
		nonConformities: agendaItem.nonConformities,
		assignedOperatorId: agendaItem.assignedOperatorId,
		routeId: agendaItem.routeId,
		stepId: agendaItem.stepId,
		qualityChecks: agendaItem.qualityChecks,
		notes: agendaItem.notes,
	};
};
