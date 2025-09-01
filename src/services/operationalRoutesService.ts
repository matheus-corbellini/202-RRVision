import {
	addDoc,
	setDoc,
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
import type { OperationalRoute, RouteAssignment, RouteStats } from "../types/operationalRoutes";

export interface SearchOptions {
	searchTerm?: string;
	field?: string;
	orderByField?: string;
	orderDirection?: "asc" | "desc";
	limitCount?: number;
	lastDoc?: DocumentSnapshot;
	productId?: string;
	status?: string;
	primarySectorId?: string;
	assignedOperatorId?: string;
}

export interface SearchResult<T> {
	data: T[];
	lastDoc?: DocumentSnapshot;
	hasMore: boolean;
}

function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
	const cleaned: Record<string, unknown> = {};
	Object.keys(obj).forEach((key) => {
		const value = (obj as Record<string, unknown>)[key];
		if (value !== undefined) cleaned[key] = value;
	});
	return cleaned as T;
}

// Criar um novo roteiro operacional
export const createOperationalRoute = async (
	route: Omit<OperationalRoute, "id" | "createdAt" | "updatedAt"> & { id?: string },
	userId: string
): Promise<string> => {
	if (!route.productId) {
		throw new Error("Produto é obrigatório");
	}
	if (!route.steps || route.steps.length === 0) {
		throw new Error("Pelo menos uma etapa é obrigatória");
	}
	if (!route.primarySectorId) {
		throw new Error("Setor primário é obrigatório");
	}

	const normalized = removeUndefined({
		...route,
		createdBy: userId,
		updatedBy: userId,
	});

	if (normalized.id) {
		const ref = doc(db, "operationalRoutes", normalized.id);
		await setDoc(
			ref,
			removeUndefined({
				...(normalized as Record<string, unknown>),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		);
		return normalized.id;
	}

	const routesRef = collection(db, "operationalRoutes");
	const docRef = await addDoc(
		routesRef,
		removeUndefined({
			...(normalized as Record<string, unknown>),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
	);

	// Garantir que o campo 'id' existe no documento para consistência
	await updateDoc(docRef, { id: docRef.id });
	return docRef.id;
};

// Atualizar um roteiro operacional existente
export const updateOperationalRoute = async (
	id: string,
	updates: Partial<OperationalRoute>,
	userId: string
): Promise<void> => {
	const routeRef = doc(db, "operationalRoutes", id);
	await updateDoc(
		routeRef,
		removeUndefined({
			...updates,
			updatedBy: userId,
			updatedAt: new Date().toISOString(),
		})
	);
};

// Excluir um roteiro operacional
export const deleteOperationalRoute = async (id: string): Promise<void> => {
	const routeRef = doc(db, "operationalRoutes", id);
	await deleteDoc(routeRef);
};

// Buscar um roteiro operacional por ID
export const getOperationalRouteById = async (id: string): Promise<OperationalRoute | null> => {
	try {
		const routeRef = doc(db, "operationalRoutes", id);
		const routeSnap = await getDoc(routeRef);

		if (routeSnap.exists()) {
			return { id: routeSnap.id, ...routeSnap.data() } as OperationalRoute;
		}
		return null;
	} catch (error) {
		console.error("Erro ao buscar roteiro:", error);
		return null;
	}
};

// Listar todos os roteiros operacionais
export const listAllOperationalRoutes = async (): Promise<OperationalRoute[]> => {
	try {
		const routesRef = collection(db, "operationalRoutes");
		const snapshot = await getDocs(routesRef);
		return snapshot.docs.map((d) => ({
			...(d.data() as Record<string, unknown>),
			id: d.id,
		})) as OperationalRoute[];
	} catch (error) {
		console.error("Erro ao listar roteiros:", error);
		throw error;
	}
};

// Buscar roteiros operacionais com filtros
export const searchOperationalRoutes = async (
	options: SearchOptions
): Promise<SearchResult<OperationalRoute>> => {
	try {
		const {
			searchTerm,
			field,
			orderByField = "createdAt",
			orderDirection = "desc",
			limitCount = 10,
			lastDoc,
			productId,
			status,
			primarySectorId,
			assignedOperatorId,
		} = options;

		const routesRef = collection(db, "operationalRoutes");
		const constraints: QueryConstraint[] = [];

		// Adicionar filtro por produto se fornecido
		if (productId) {
			constraints.push(where("productId", "==", productId));
		}

		// Adicionar filtro por status se fornecido
		if (status) {
			constraints.push(where("status", "==", status));
		}

		// Adicionar filtro por setor primário se fornecido
		if (primarySectorId) {
			constraints.push(where("primarySectorId", "==", primarySectorId));
		}

		// Adicionar filtro por operador atribuído se fornecido
		if (assignedOperatorId) {
			constraints.push(where("assignedOperatorId", "==", assignedOperatorId));
		}

		// Adicionar busca por texto se fornecida
		if (searchTerm && field) {
			constraints.push(
				where(field, ">=", searchTerm),
				where(field, "<=", searchTerm + "\uf8ff")
			);
		}

		// Adicionar ordenação
		constraints.push(orderBy(orderByField, orderDirection));

		// Adicionar paginação
		if (lastDoc) {
			constraints.push(startAfter(lastDoc));
		}

		// Adicionar limite
		constraints.push(limit(limitCount + 1));

		const q = query(routesRef, ...constraints);
		const querySnapshot = await getDocs(q);

		const routes: OperationalRoute[] = [];
		const docs = querySnapshot.docs;

		const hasMore = docs.length > limitCount;
		const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

		dataToReturn.forEach((doc) => {
			routes.push({ id: doc.id, ...doc.data() } as OperationalRoute);
		});

		return {
			data: routes,
			lastDoc: dataToReturn[dataToReturn.length - 1],
			hasMore,
		};
	} catch (error) {
		console.error("Erro ao buscar roteiros:", error);
		throw error;
	}
};

// Buscar roteiros por produto
export const getRoutesByProduct = async (productId: string): Promise<OperationalRoute[]> => {
	try {
		const result = await searchOperationalRoutes({
			productId,
			orderByField: "version",
			orderDirection: "desc",
		});
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar roteiros por produto:", error);
		throw error;
	}
};

// Buscar roteiros por status
export const getRoutesByStatus = async (status: string): Promise<OperationalRoute[]> => {
	try {
		const result = await searchOperationalRoutes({
			status,
			orderByField: "createdAt",
			orderDirection: "desc",
		});
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar roteiros por status:", error);
		throw error;
	}
};

// Buscar roteiros ativos
export const getActiveRoutes = async (): Promise<OperationalRoute[]> => {
	return getRoutesByStatus("active");
};

// Verificar se já existe um roteiro para um produto e versão
export const checkRouteExists = async (
	productId: string,
	version: string
): Promise<boolean> => {
	try {
		const routesRef = collection(db, "operationalRoutes");
		const q = query(
			routesRef,
			where("productId", "==", productId),
			where("version", "==", version)
		);
		const snapshot = await getDocs(q);
		return !snapshot.empty;
	} catch (error) {
		console.error("Erro ao verificar existência do roteiro:", error);
		return false;
	}
};

// Buscar roteiros por setor
export const getRoutesBySector = async (sectorId: string): Promise<OperationalRoute[]> => {
	try {
		const result = await searchOperationalRoutes({
			primarySectorId: sectorId,
			orderByField: "createdAt",
			orderDirection: "desc",
		});
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar roteiros por setor:", error);
		throw error;
	}
};

// Buscar roteiros por operador
export const getRoutesByOperator = async (operatorId: string): Promise<OperationalRoute[]> => {
	try {
		const result = await searchOperationalRoutes({
			assignedOperatorId: operatorId,
			orderByField: "createdAt",
			orderDirection: "desc",
		});
		return result.data;
	} catch (error) {
		console.error("Erro ao buscar roteiros por operador:", error);
		throw error;
	}
};

// Criar associação de roteiro com operador
export const createRouteAssignment = async (
	assignment: Omit<RouteAssignment, "id" | "assignedAt">,
	userId: string
): Promise<string> => {
	const assignmentData = {
		...assignment,
		assignedAt: new Date().toISOString(),
		assignedBy: userId,
	};

	const assignmentsRef = collection(db, "routeAssignments");
	const docRef = await addDoc(assignmentsRef, assignmentData);
	
	// Atualizar o roteiro com o operador associado
	await updateOperationalRoute(assignment.routeId, {
		assignedOperatorId: assignment.operatorId,
	}, userId);

	return docRef.id;
};

// Atualizar associação de roteiro
export const updateRouteAssignment = async (
	id: string,
	updates: Partial<RouteAssignment>,
	userId: string
): Promise<void> => {
	const assignmentRef = doc(db, "routeAssignments", id);
	await updateDoc(assignmentRef, {
		...updates,
		updatedAt: new Date().toISOString(),
		updatedBy: userId,
	});
};

// Buscar associações de roteiro
export const getRouteAssignments = async (routeId?: string, operatorId?: string): Promise<RouteAssignment[]> => {
	try {
		const assignmentsRef = collection(db, "routeAssignments");
		let q = query(assignmentsRef);

		if (routeId) {
			q = query(q, where("routeId", "==", routeId));
		}
		if (operatorId) {
			q = query(q, where("operatorId", "==", operatorId));
		}

		const snapshot = await getDocs(q);
		return snapshot.docs.map((d) => ({
			...(d.data() as Record<string, unknown>),
			id: d.id,
		})) as RouteAssignment[];
	} catch (error) {
		console.error("Erro ao buscar associações de roteiro:", error);
		throw error;
	}
};

// Obter estatísticas dos roteiros por setor e operador
export const getRoutesStats = async (): Promise<RouteStats> => {
	try {
		const routesRef = collection(db, "operationalRoutes");
		const snapshot = await getDocs(routesRef);
		
		const stats: RouteStats = {
			total: 0,
			active: 0,
			draft: 0,
			inactive: 0,
			bySector: {},
			byOperator: {},
		};

		snapshot.docs.forEach((doc) => {
			const data = doc.data();
			stats.total++;
			
			if (data.status === "active") stats.active++;
			else if (data.status === "draft") stats.draft++;
			else if (data.status === "inactive") stats.inactive++;

			// Contar por setor
			if (data.primarySectorId) {
				stats.bySector[data.primarySectorId] = (stats.bySector[data.primarySectorId] || 0) + 1;
			}

			// Contar por operador
			if (data.assignedOperatorId) {
				stats.byOperator[data.assignedOperatorId] = (stats.byOperator[data.assignedOperatorId] || 0) + 1;
			}
		});

		return stats;
	} catch (error) {
		console.error("Erro ao obter estatísticas dos roteiros:", error);
		throw error;
	}
};
