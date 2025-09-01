import {
	addDoc,
	collection,
	query,
	where,
	getDocs,
	orderBy,
	limit,
	startAfter,
	type DocumentSnapshot,
	type QueryConstraint,
	deleteDoc,
	doc,
	updateDoc,
	getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { 
	Task, 
	Break, 
	QualityCheck, 
	OperatorStats, 
	TaskFilters,
	TaskAssignment 
} from "../types/operatorSchedule";

// Criar nova tarefa
export const createTask = async (
	task: Omit<Task, "id" | "createdAt" | "updatedAt">,
	userId: string
): Promise<string> => {
	if (!task.assignedOperatorId) {
		throw new Error("Operador é obrigatório");
	}
	if (!task.sectorId) {
		throw new Error("Setor é obrigatório");
	}

	const taskData = {
		...task,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		createdBy: userId,
		updatedBy: userId,
	};

	const tasksRef = collection(db, "tasks");
	const docRef = await addDoc(tasksRef, taskData);
	
	// Garantir que o campo 'id' existe no documento
	await updateDoc(docRef, { id: docRef.id });
	return docRef.id;
};

// Atualizar tarefa
export const updateTask = async (
	id: string,
	updates: Partial<Task>,
	userId: string
): Promise<void> => {
	const taskRef = doc(db, "tasks", id);
	await updateDoc(taskRef, {
		...updates,
		updatedAt: new Date().toISOString(),
		updatedBy: userId,
	});
};

// Excluir tarefa
export const deleteTask = async (id: string): Promise<void> => {
	const taskRef = doc(db, "tasks", id);
	await deleteDoc(taskRef);
};

// Buscar tarefa por ID
export const getTaskById = async (id: string): Promise<Task | null> => {
	try {
		const taskRef = doc(db, "tasks", id);
		const taskSnap = await getDoc(taskRef);

		if (taskSnap.exists()) {
			return { id: taskSnap.id, ...taskSnap.data() } as Task;
		}
		return null;
	} catch (error) {
		console.error("Erro ao buscar tarefa:", error);
		return null;
	}
};

// Listar todas as tarefas
export const listAllTasks = async (): Promise<Task[]> => {
	try {
		const tasksRef = collection(db, "tasks");
		const snapshot = await getDocs(tasksRef);
		return snapshot.docs.map((d) => ({
			...(d.data() as Record<string, unknown>),
			id: d.id,
		})) as Task[];
	} catch (error) {
		console.error("Erro ao listar tarefas:", error);
		throw error;
	}
};

// Buscar tarefas com filtros
export const searchTasks = async (
	filters: TaskFilters,
	options: {
		orderByField?: string;
		orderDirection?: "asc" | "desc";
		limitCount?: number;
		lastDoc?: DocumentSnapshot;
	} = {}
): Promise<{
	data: Task[];
	lastDoc?: DocumentSnapshot;
	hasMore: boolean;
}> => {
	try {
		const {
			orderByField = "startTime",
			orderDirection = "asc",
			limitCount = 50,
			lastDoc,
		} = options;

		const tasksRef = collection(db, "tasks");
		const constraints: QueryConstraint[] = [];

		// Aplicar filtros
		if (filters.status && filters.status.length > 0) {
			constraints.push(where("status", "in", filters.status));
		}
		if (filters.priority && filters.priority.length > 0) {
			constraints.push(where("priority", "in", filters.priority));
		}
		if (filters.sector) {
			constraints.push(where("sectorId", "==", filters.sector));
		}
		if (filters.operator) {
			constraints.push(where("assignedOperatorId", "==", filters.operator));
		}
		if (filters.hasNonConformities) {
			constraints.push(where("nonConformities", "!=", []));
		}

		// Ordenação
		constraints.push(orderBy(orderByField, orderDirection));

		// Paginação
		if (lastDoc) {
			constraints.push(startAfter(lastDoc));
		}
		constraints.push(limit(limitCount + 1));

		const q = query(tasksRef, ...constraints);
		const querySnapshot = await getDocs(q);

		const tasks: Task[] = [];
		const docs = querySnapshot.docs;
		const hasMore = docs.length > limitCount;
		const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

		dataToReturn.forEach((doc) => {
			tasks.push({ id: doc.id, ...doc.data() } as Task);
		});

		return {
			data: tasks,
			lastDoc: dataToReturn[dataToReturn.length - 1],
			hasMore,
		};
	} catch (error) {
		console.error("Erro ao buscar tarefas:", error);
		throw error;
	}
};

// Buscar tarefas por operador
export const getTasksByOperator = async (operatorId: string): Promise<Task[]> => {
	try {
		const result = await searchTasks({ operator: operatorId });
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar tarefas por operador:", error);
		throw error;
	}
};

// Buscar tarefas por setor
export const getTasksBySector = async (sectorId: string): Promise<Task[]> => {
	try {
		const result = await searchTasks({ sector: [sectorId] });
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar tarefas por setor:", error);
		throw error;
	}
};

// Buscar tarefas do dia
export const getTasksByDate = async (date: string): Promise<Task[]> => {
	try {
		const startOfDay = new Date(date);
		startOfDay.setHours(0, 0, 0, 0);
		
		const endOfDay = new Date(date);
		endOfDay.setHours(23, 59, 59, 999);

		const tasksRef = collection(db, "tasks");
		const q = query(
			tasksRef,
			where("startTime", ">=", startOfDay.toISOString()),
			where("startTime", "<=", endOfDay.toISOString()),
			orderBy("startTime", "asc")
		);

		const snapshot = await getDocs(q);
		return snapshot.docs.map((d) => ({
			...(d.data() as Record<string, unknown>),
			id: d.id,
		})) as Task[];
	} catch (error) {
		console.error("Erro ao buscar tarefas por data:", error);
		throw error;
	}
};

// Iniciar tarefa
export const startTask = async (taskId: string, operatorId: string): Promise<void> => {
	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		status: "in_progress",
		actualStartTime: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});
};

// Pausar tarefa
export const pauseTask = async (taskId: string, operatorId: string): Promise<void> => {
	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		status: "paused",
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});
};

// Finalizar tarefa
export const completeTask = async (taskId: string, operatorId: string): Promise<void> => {
	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		status: "completed",
		actualEndTime: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});
};

// Iniciar pausa
export const startBreak = async (
	taskId: string,
	breakData: Omit<Break, "id" | "startTime">,
	operatorId: string
): Promise<string> => {
	const breakItem: Break = {
		id: `break-${Date.now()}`,
		...breakData,
		startTime: new Date().toISOString(),
	};

	// Adicionar pausa à tarefa
	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		breaks: [...(await getTaskById(taskId))?.breaks || [], breakItem],
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});

	return breakItem.id;
};

// Finalizar pausa
export const endBreak = async (
	taskId: string,
	breakId: string,
	operatorId: string
): Promise<void> => {
	const task = await getTaskById(taskId);
	if (!task) throw new Error("Tarefa não encontrada");

	const updatedBreaks = task.breaks.map((breakItem) =>
		breakItem.id === breakId
			? {
					...breakItem,
					endTime: new Date().toISOString(),
					duration: calculateBreakDuration(breakItem.startTime, new Date().toISOString()),
			  }
			: breakItem
	);

	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		breaks: updatedBreaks,
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});
};

// Calcular duração da pausa
const calculateBreakDuration = (startTime: string, endTime: string): number => {
	const start = new Date(startTime);
	const end = new Date(endTime);
	return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // em minutos
};

// Adicionar verificação de qualidade
export const addQualityCheck = async (
	taskId: string,
	qualityCheck: Omit<QualityCheck, "id" | "checkTime">,
	operatorId: string
): Promise<string> => {
	const checkItem: QualityCheck = {
		id: `qc-${Date.now()}`,
		...qualityCheck,
		checkTime: new Date().toISOString(),
	};

	const taskRef = doc(db, "tasks", taskId);
	await updateDoc(taskRef, {
		qualityChecks: [...(await getTaskById(taskId))?.qualityChecks || [], checkItem],
		updatedAt: new Date().toISOString(),
		updatedBy: operatorId,
	});

	return checkItem.id;
};

// Obter estatísticas do operador
export const getOperatorStats = async (operatorId: string, dateRange?: { start: string; end: string }): Promise<OperatorStats> => {
	try {
		const filters: TaskFilters = { operator: operatorId };
		if (dateRange) {
			filters.dateRange = dateRange;
		}

		const tasks = await searchTasks(filters);
		const operatorTasks = tasks.data;

		const completedTasks = operatorTasks.filter(t => t.status === "completed").length;
		const totalTasks = operatorTasks.length;
		const onTimeTasks = operatorTasks.filter(t => 
			t.status === "completed" && 
			t.actualTime && 
			t.actualTime <= t.estimatedTime + t.setupTime
		).length;

		const totalWorkTime = operatorTasks
			.filter(t => t.status === "completed" && t.actualTime)
			.reduce((sum, t) => sum + (t.actualTime || 0), 0);

		const totalBreaks = operatorTasks.reduce((sum, t) => sum + t.breaks.length, 0);
		const totalBreakTime = operatorTasks.reduce((sum, t) => 
			sum + t.breaks.reduce((breakSum, b) => breakSum + (b.duration || 0), 0), 0
		);

		const efficiency = totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0;

		return {
			tasksCompleted: completedTasks,
			averageEfficiency: efficiency,
			totalWorkTime,
			onTimeCompletion: totalTasks > 0 ? (onTimeTasks / totalTasks) * 100 : 0,
			ranking: 0, // Seria calculado comparando com outros operadores
			dailyTarget: 0, // Seria definido pelo sistema
			totalBreaks,
			totalBreakTime,
			qualityScore: 0, // Seria calculado baseado nas verificações de qualidade
			productivityIndex: efficiency,
		};
	} catch (error) {
		console.error("Erro ao obter estatísticas do operador:", error);
		throw error;
	}
};

// Criar agendamento de tarefa
export const createTaskAssignment = async (
	assignment: Omit<TaskAssignment, "id" | "assignedAt">,
	userId: string
): Promise<string> => {
	const assignmentData = {
		...assignment,
		assignedAt: new Date().toISOString(),
		assignedBy: userId,
	};

	const assignmentsRef = collection(db, "taskAssignments");
	const docRef = await addDoc(assignmentsRef, assignmentData);
	return docRef.id;
};

// Buscar agendamentos
export const getTaskAssignments = async (taskId?: string, operatorId?: string): Promise<TaskAssignment[]> => {
	try {
		const assignmentsRef = collection(db, "taskAssignments");
		let q = query(assignmentsRef);

		if (taskId) {
			q = query(q, where("taskId", "==", taskId));
		}
		if (operatorId) {
			q = query(q, where("operatorId", "==", operatorId));
		}

		const snapshot = await getDocs(q);
		return snapshot.docs.map((d) => ({
			...(d.data() as Record<string, unknown>),
			id: d.id,
		})) as TaskAssignment[];
	} catch (error) {
		console.error("Erro ao buscar agendamentos:", error);
		throw error;
	}
};
