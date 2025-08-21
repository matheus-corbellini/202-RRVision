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
	type DocumentData,
	getDoc,
} from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import type { User } from "../types";
import type { Operator } from "../types";

export interface SearchOptions {
	searchTerm?: string;
	field?: string;
	orderByField?: string;
	orderDirection?: "asc" | "desc";
	limitCount?: number;
	lastDoc?: DocumentSnapshot;
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

// Search users by various criteria
export const searchUsers = async (
	options: SearchOptions
): Promise<SearchResult<User>> => {
	try {
		const {
			searchTerm,
			field = "name",
			orderByField = "createdAt",
			orderDirection = "desc",
			limitCount = 10,
			lastDoc,
		} = options;

		const usersRef = collection(db, "users");
		const constraints: QueryConstraint[] = [];

		// Add search constraint if provided
		if (searchTerm && field) {
			// For text search, we use range queries (limited but works for prefixes)
			constraints.push(
				where(field, ">=", searchTerm),
				where(field, "<=", searchTerm + "\uf8ff")
			);
		}

		// Add ordering
		constraints.push(orderBy(orderByField, orderDirection));

		// Add pagination
		if (lastDoc) {
			constraints.push(startAfter(lastDoc));
		}

		// Add limit
		constraints.push(limit(limitCount + 1)); // Get one extra to check if there's more

		const q = query(usersRef, ...constraints);
		const querySnapshot = await getDocs(q);

		const users: User[] = [];
		const docs = querySnapshot.docs;

		// Check if there are more results
		const hasMore = docs.length > limitCount;
		const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

		dataToReturn.forEach((docSnap) => {
			const data = docSnap.data() as DocumentData;
			users.push({
				...(data as unknown as Partial<User>),
				uid: docSnap.id,
			} as User);
		});

		return {
			data: users,
			lastDoc: dataToReturn[dataToReturn.length - 1],
			hasMore,
		};
	} catch (error) {
		console.error("Error searching users:", error);
		throw error;
	}
};

// Search users by email
export const searchUsersByEmail = async (email: string): Promise<User[]> => {
	try {
		const result = await searchUsers({
			searchTerm: email.toLowerCase(),
			field: "email",
			limitCount: 5,
		});
		return result.data;
	} catch (error) {
		console.error("Error searching users by email:", error);
		throw error;
	}
};

// Search users by name
export const searchUsersByName = async (name: string): Promise<User[]> => {
	try {
		const result = await searchUsers({
			searchTerm: name.toLowerCase(),
			field: "name",
			limitCount: 10,
		});
		return result.data;
	} catch (error) {
		console.error("Error searching users by name:", error);
		throw error;
	}
};

// Search users by company
export const searchUsersByCompany = async (
	company: string
): Promise<User[]> => {
	try {
		const result = await searchUsers({
			searchTerm: company.toLowerCase(),
			field: "company",
			limitCount: 20,
		});
		return result.data;
	} catch (error) {
		console.error("Error searching users by company:", error);
		throw error;
	}
};

// Generic search function for any collection
export const searchData = async <T>(
	collectionName: string,
	options: SearchOptions
): Promise<SearchResult<T>> => {
	try {
		const {
			searchTerm,
			field,
			orderByField = "createdAt",
			orderDirection = "desc",
			limitCount = 10,
			lastDoc,
		} = options;

		const collectionRef = collection(db, collectionName);
		const constraints: QueryConstraint[] = [];

		// Add search constraint if provided
		if (searchTerm && field) {
			constraints.push(
				where(field, ">=", searchTerm),
				where(field, "<=", searchTerm + "\uf8ff")
			);
		}

		// Add ordering
		constraints.push(orderBy(orderByField, orderDirection));

		// Add pagination
		if (lastDoc) {
			constraints.push(startAfter(lastDoc));
		}

		// Add limit
		constraints.push(limit(limitCount + 1));

		const q = query(collectionRef, ...constraints);
		const querySnapshot = await getDocs(q);

		const data: T[] = [];
		const docs = querySnapshot.docs;

		const hasMore = docs.length > limitCount;
		const dataToReturn = hasMore ? docs.slice(0, -1) : docs;

		dataToReturn.forEach((doc) => {
			data.push({ id: doc.id, ...doc.data() } as T);
		});

		return {
			data,
			lastDoc: dataToReturn[dataToReturn.length - 1],
			hasMore,
		};
	} catch (error) {
		console.error(`Error searching ${collectionName}:`, error);
		throw error;
	}
};

// Admin: list all users
export const listAllUsers = async (): Promise<User[]> => {
	const usersRef = collection(db, "users");
	const snapshot = await getDocs(usersRef);
	return snapshot.docs.map((d) => {
		const data = d.data() as Record<string, unknown>;
		return {
			id: d.id,
			email: data.email as string || "",
			name: data.name as string || "",
			displayName: data.displayName as string,
			company: data.company as string,
			phone: data.phone as string,
			photoURL: data.photoURL as string | null,
			emailVerified: data.emailVerified as boolean || false,
			userType: data.userType as string || "user",
			role: data.role as string || "user",
			createdAt: data.createdAt as string || new Date().toISOString(),
			updatedAt: data.updatedAt as string || new Date().toISOString(),
			operatorData: data.operatorData as User["operatorData"],
		} as User;
	});
};

// Admin: create user document (does not create auth account)
export const createUserRecord = async (
	user: Omit<User, "uid" | "createdAt" | "updatedAt"> & { uid?: string }
): Promise<string> => {
	if (!user.email) {
		throw new Error("E-mail é obrigatório");
	}
	const normalized = removeUndefined({
		...user,
		email: user.email.trim().toLowerCase(),
	});

	if (normalized.uid) {
		const ref = doc(db, "users", normalized.uid);
		await setDoc(
			ref,
			removeUndefined({
				...(normalized as Record<string, unknown>),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			})
		);
		return normalized.uid;
	}
	const usersRef = collection(db, "users");
	const docRef = await addDoc(
		usersRef,
		removeUndefined({
			...(normalized as Record<string, unknown>),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
	);
	// ensure 'uid' field exists in the document for consistency
	await updateDoc(docRef, { uid: docRef.id });
	return docRef.id;
};

// Admin: update user document
export const updateUserRecord = async (
	uid: string,
	updates: Partial<User>
): Promise<void> => {
	const userRef = doc(db, "users", uid);
	await updateDoc(
		userRef,
		removeUndefined({
			...updates,
			updatedAt: new Date().toISOString(),
		})
	);
};

// Admin: delete user document
export const deleteUserRecord = async (uid: string): Promise<void> => {
	const userRef = doc(db, "users", uid);
	await deleteDoc(userRef);
};

// Operator management functions
export const createOperatorRecord = async (
	operator: Omit<Operator, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> => {
	if (!operator.code) {
		throw new Error("Matrícula é obrigatória");
	}
	if (!operator.userId) {
		throw new Error("ID do usuário é obrigatório");
	}
	if (!operator.primarySectorId) {
		throw new Error("Setor principal é obrigatório");
	}

	const normalized = removeUndefined({
		...operator,
		code: operator.code.trim(),
	});

	if (normalized.id) {
		const ref = doc(db, "operators", normalized.id);
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

	const operatorsRef = collection(db, "operators");
	const docRef = await addDoc(
		operatorsRef,
		removeUndefined({
			...(normalized as Record<string, unknown>),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		})
	);

	// ensure 'id' field exists in the document for consistency
	await updateDoc(docRef, { id: docRef.id });
	return docRef.id;
};

export const updateOperatorRecord = async (
	id: string,
	updates: Partial<Operator>
): Promise<void> => {
	const operatorRef = doc(db, "operators", id);
	await updateDoc(
		operatorRef,
		removeUndefined({
			...updates,
			updatedAt: new Date().toISOString(),
		})
	);
};

export const deleteOperatorRecord = async (id: string): Promise<void> => {
	const operatorRef = doc(db, "operators", id);
	await deleteDoc(operatorRef);
};

export const getOperatorById = async (id: string): Promise<Operator | null> => {
	try {
		const operatorRef = doc(db, "operators", id);
		const operatorSnap = await getDoc(operatorRef);

		if (operatorSnap.exists()) {
			return { id: operatorSnap.id, ...operatorSnap.data() } as Operator;
		}
		return null;
	} catch (error) {
		console.error("Error getting operator:", error);
		return null;
	}
};

export const listAllOperators = async (): Promise<Operator[]> => {
	const operatorsRef = collection(db, "operators");
	const snapshot = await getDocs(operatorsRef);
	return snapshot.docs.map((d) => ({
		...(d.data() as Record<string, unknown>),
		id: d.id,
	})) as Operator[];
};

export const searchOperators = async (
	options: SearchOptions
): Promise<SearchResult<Operator>> => {
	return searchData<Operator>("operators", options);
};
