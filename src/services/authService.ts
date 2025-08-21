import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	sendPasswordResetEmail,
	updateProfile,
	type User as FirebaseUser,
	type UserCredential,
} from "firebase/auth";
import {
	doc,
	setDoc,
	getDoc,
	updateDoc,
	serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { deleteDoc } from "firebase/firestore";
import type { UserRoleType } from "../types";

// Interface para usuário
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
	role: UserRoleType;
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

// Interface para usuário autenticado
export interface AuthUser {
	id: string;
	email: string;
	displayName?: string;
	photoURL?: string | null;
	emailVerified: boolean;
	name?: string;
	company?: string;
	phone?: string;
	createdAt?: string;
	updatedAt?: string;
	role: UserRoleType;
	userType: string;
	accessToken: string;
}

// Interface para dados de registro
export interface RegisterData {
	email: string;
	name: string;
	company?: string;
	phone?: string;
	password: string;
}

// Interface para operador (compatível com User)
export interface Operator extends User {
	code: string;
	primarySectorId: string;
	secondarySectorIds: string[];
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
	userId: string;
}

// Mock de dados - Em produção, isso viria de uma API real
const mockUsers: User[] = [];

export interface OperatorRegistrationData extends RegisterData {
	// Campos adicionais do usuário
	displayName?: string;

	// Dados específicos do operador
	code: string;
	primarySectorId: string;
	secondarySectorIds: string[];
	skills: string[];
	status: "active" | "inactive" | "suspended" | "on_leave";
	admissionDate: string;
	lastTrainingDate?: string;
	nextTrainingDate?: string;
	contractType: "clt" | "pj" | "temporary" | "intern";
	workSchedule: "day" | "night" | "rotating" | "flexible";
	weeklyHours: number;
	supervisorId?: string;
	teamId?: string;
}

// Convert Firebase User to our User type
export const convertFirebaseUser = async (
	firebaseUser: FirebaseUser
): Promise<AuthUser> => {
	console.log("convertFirebaseUser called with:", {
		uid: firebaseUser.uid,
		email: firebaseUser.email,
		displayName: firebaseUser.displayName,
	});

	const userDoc = await getUserDocument(firebaseUser.uid);
	console.log("User document from Firestore:", userDoc);

	const convertedUser = {
		id: firebaseUser.uid,
		email: firebaseUser.email || "",
		displayName: firebaseUser.displayName || undefined,
		photoURL: firebaseUser.photoURL || undefined,
		emailVerified: firebaseUser.emailVerified,
		name: userDoc?.name,
		company: userDoc?.company,
		phone: userDoc?.phone,
		createdAt: userDoc?.createdAt,
		updatedAt: userDoc?.updatedAt,
		role: userDoc?.role || "user",
		userType: userDoc?.userType || "operator",
		accessToken: await firebaseUser.getIdToken(),
	};

	console.log("Converted user object:", convertedUser);
	console.log("Converted user name:", convertedUser.name);
	console.log("Converted user role:", convertedUser.role);
	console.log("Converted user name type:", typeof convertedUser.name);
	console.log("Converted user role type:", typeof convertedUser.role);

	return convertedUser;
};

// Get user document from Firestore
export const getUserDocument = async (uid: string): Promise<User | null> => {
	try {
		console.log("getUserDocument called for uid:", uid);
		const userRef = doc(db, "users", uid);
		console.log("User reference created:", userRef.path);

		const userSnap = await getDoc(userRef);
		console.log("User snapshot exists:", userSnap.exists());

		if (userSnap.exists()) {
			const userData = userSnap.data() as User;
			console.log("User data retrieved:", userData);
			console.log("User data keys:", Object.keys(userData));
			console.log("User data values:", Object.values(userData));
			console.log("User name type:", typeof userData.name);
			console.log("User role type:", typeof userData.role);
			return userData;
		}
		console.log("User document does not exist");
		return null;
	} catch (error) {
		console.error("Error getting user document:", error);
		return null;
	}
};

// Create user document in Firestore
export const createUserDocument = async (
	uid: string,
	userData: Partial<RegisterData>
): Promise<void> => {
	try {
		const userRef = doc(db, "users", uid);
		await setDoc(userRef, {
			id: uid,
			email: userData.email,
			name: userData.name,
			company: userData.company,
			phone: userData.phone,
			role: "user",
			userType: "operator",
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error("Error creating user document:", error);
		throw error;
	}
};

// Register new user
export const registerUser = async (
	userData: RegisterData
): Promise<AuthUser> => {
	try {
		const { email, password, ...profileData } = userData;

		// Create user with email and password
		const userCredential: UserCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);

		const user = userCredential.user;

		// Update profile with display name
		await updateProfile(user, {
			displayName: profileData.name,
		});

		// Create user document in Firestore
		await createUserDocument(user.uid, userData);

		// Return converted user
		return await convertFirebaseUser(user);
	} catch (error) {
		console.error("Error registering user:", error);
		throw error;
	}
};

// Login user
export const loginUser = async (
	email: string,
	password: string
): Promise<AuthUser> => {
	try {
		const userCredential: UserCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);

		return await convertFirebaseUser(userCredential.user);
	} catch (error) {
		console.error("Error logging in:", error);
		throw error;
	}
};

// Logout user
export const logoutUser = async (): Promise<void> => {
	try {
		await signOut(auth);
	} catch (error) {
		console.error("Error logging out:", error);
		throw error;
	}
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
	try {
		await sendPasswordResetEmail(auth, email);
	} catch (error) {
		console.error("Error resetting password:", error);
		throw error;
	}
};

// Update user profile
export const updateUserProfile = async (
	userData: Partial<User>
): Promise<void> => {
	try {
		const currentUser = auth.currentUser;
		if (!currentUser) {
			throw new Error("No authenticated user");
		}

		// Update Firebase Auth profile
		if (userData.name) {
			await updateProfile(currentUser, {
				displayName: userData.name,
			});
		}

		// Update Firestore document
		const userRef = doc(db, "users", currentUser.uid);
		await updateDoc(userRef, {
			...userData,
			updatedAt: serverTimestamp(),
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		throw error;
	}
};

export class AuthService {
	// Criar usuário operador com dados específicos
	static async createOperatorWithUser(
		data: OperatorRegistrationData
	): Promise<{ user: User; operator: Operator }> {
		try {
			// 1. Criar uma instância separada do Firebase Auth para não afetar o usuário atual
			const tempAuth = getAuth();

			// 2. Criar o usuário no Firebase Auth usando a instância temporária
			const userCredential = await createUserWithEmailAndPassword(
				tempAuth,
				data.email,
				data.password
			);

			const firebaseUser = userCredential.user;
			const userId = firebaseUser.uid;

			// 3. Fazer logout apenas da instância temporária
			await signOut(tempAuth);

			// 4. Criar o documento do usuário operador no Firestore
			const newOperator: Operator = {
				id: userId,
				email: data.email,
				name: data.name,
				displayName: data.displayName || data.name,
				company: data.company || "",
				phone: data.phone || "",
				photoURL: null,
				emailVerified: false,
				userType: "operator",
				role: "user",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),

				// Dados específicos do operador
				code: data.code,
				primarySectorId: data.primarySectorId,
				secondarySectorIds: data.secondarySectorIds || [],
				skills: data.skills || [],
				status: data.status,
				admissionDate: data.admissionDate,
				lastTrainingDate: data.lastTrainingDate || "",
				nextTrainingDate: data.nextTrainingDate || "",
				contractType: data.contractType,
				workSchedule: data.workSchedule,
				weeklyHours: data.weeklyHours,
				supervisorId: data.supervisorId || "",
				teamId: data.teamId || "",
				userId: userId,
				operatorData: {
					code: data.code,
					primarySectorId: data.primarySectorId,
					secondarySectorIds: data.secondarySectorIds || [],
					trainedActivities: [],
					skills: data.skills || [],
					status: data.status,
					admissionDate: data.admissionDate,
					lastTrainingDate: data.lastTrainingDate || "",
					nextTrainingDate: data.nextTrainingDate || "",
					contractType: data.contractType,
					workSchedule: data.workSchedule,
					weeklyHours: data.weeklyHours,
					supervisorId: data.supervisorId || "",
					teamId: data.teamId || "",
				},
			};

			// 5. Preparar dados para o Firestore (estrutura simplificada)
			const firestoreData = {
				// Dados básicos do usuário
				email: newOperator.email,
				name: newOperator.name,
				displayName: newOperator.displayName || "",
				company: newOperator.company || "",
				phone: newOperator.phone || "",
				photoURL: null,
				emailVerified: false,
				userType: "operator",
				role: "user",

				// Dados específicos do operador (não aninhados)
				code: newOperator.code,
				primarySectorId: newOperator.primarySectorId,
				secondarySectorIds: newOperator.secondarySectorIds || [],
				skills: newOperator.skills || [],
				status: newOperator.status,
				admissionDate: newOperator.admissionDate,
				lastTrainingDate: newOperator.lastTrainingDate || "",
				nextTrainingDate: newOperator.nextTrainingDate || "",
				contractType: newOperator.contractType,
				workSchedule: newOperator.workSchedule,
				weeklyHours: newOperator.weeklyHours,
				supervisorId: newOperator.supervisorId || "",
				teamId: newOperator.teamId || "",

				// Timestamps
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			};

			// Log para debug
			console.log("Dados para Firestore:", firestoreData);

			// 6. Salvar usuário operador no Firestore
			const userRef = doc(db, "users", userId);
			await setDoc(userRef, firestoreData);

			// 7. Atualizar o mock local para sincronização
			mockUsers.push(newOperator);

			// 8. Retornar o usuário operador criado
			return { user: newOperator, operator: newOperator };
		} catch (error) {
			console.error("Erro ao criar usuário operador:", error);
			throw new Error("Falha ao criar usuário operador");
		}
	}

	// Buscar operador por ID do usuário
	static async getOperatorByUserId(userId: string): Promise<Operator | null> {
		try {
			// Buscar usuário no Firestore
			const userRef = doc(db, "users", userId);
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				const user = userSnap.data() as User;
				if (user.userType === "operator" && user.operatorData) {
					return user as Operator;
				}
			}

			// Fallback para mock local
			const user = mockUsers.find((u) => u.id === userId);
			return user && user.userType === "operator" && user.operatorData
				? (user as Operator)
				: null;
		} catch (error) {
			console.error("Erro ao buscar operador por userId:", error);
			// Fallback para mock local
			const user = mockUsers.find((u) => u.id === userId);
			return user && user.userType === "operator" && user.operatorData
				? (user as Operator)
				: null;
		}
	}

	// Buscar usuário por ID do operador (agora é o mesmo ID)
	static async getUserByOperatorId(operatorId: string): Promise<User | null> {
		try {
			// Buscar usuário no Firestore
			const userRef = doc(db, "users", operatorId);
			const userSnap = await getDoc(userRef);

			if (userSnap.exists()) {
				return userSnap.data() as User;
			}

			// Fallback para mock local
			return mockUsers.find((user) => user.id === operatorId) || null;
		} catch (error) {
			console.error("Erro ao buscar usuário por operatorId:", error);
			// Fallback para mock local
			return mockUsers.find((user) => user.id === operatorId) || null;
		}
	}

	// Verificar se um usuário é operador
	static isOperator(user: User): boolean {
		return user.userType === "operator" && user.operatorData !== undefined;
	}

	// Listar todos os operadores com seus usuários
	static async getAllOperatorsWithUsers(): Promise<
		Array<{ operator: Operator; user: User }>
	> {
		try {
			// Buscar todos os usuários operadores no Firestore
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("userType", "==", "operator"));
			const usersSnapshot = await getDocs(q);

			const operatorsWithUsers: Array<{ operator: Operator; user: User }> = [];

			for (const userDoc of usersSnapshot.docs) {
				const userData = userDoc.data();
				const userId = userDoc.id;
				
				// Criar objeto User com dados do Firestore
				const user: User = {
					id: userId,
					email: userData.email || "",
					name: userData.name || "",
					displayName: userData.displayName || "",
					company: userData.company || "",
					phone: userData.phone || "",
					photoURL: userData.photoURL || null,
					emailVerified: userData.emailVerified || false,
					userType: userData.userType || "operator",
					role: userData.role || "user",
					createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt || new Date().toISOString(),
					updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt || new Date().toISOString(),
					operatorData: {
						code: userData.code || "",
						primarySectorId: userData.primarySectorId || "",
						secondarySectorIds: userData.secondarySectorIds || [],
						trainedActivities: userData.trainedActivities || [],
						skills: userData.skills || [],
						status: userData.status || "active",
						admissionDate: userData.admissionDate || "",
						lastTrainingDate: userData.lastTrainingDate || "",
						nextTrainingDate: userData.nextTrainingDate || "",
						contractType: userData.contractType || "clt",
						workSchedule: userData.workSchedule || "day",
						weeklyHours: userData.weeklyHours || 40,
						supervisorId: userData.supervisorId || "",
						teamId: userData.teamId || "",
					}
				};

				// Criar objeto Operator
				const operator: Operator = {
					...user,
					code: userData.code || "",
					primarySectorId: userData.primarySectorId || "",
					secondarySectorIds: userData.secondarySectorIds || [],
					skills: userData.skills || [],
					status: userData.status || "active",
					admissionDate: userData.admissionDate || "",
					lastTrainingDate: userData.lastTrainingDate || "",
					nextTrainingDate: userData.nextTrainingDate || "",
					contractType: userData.contractType || "clt",
					workSchedule: userData.workSchedule || "day",
					weeklyHours: userData.weeklyHours || 40,
					supervisorId: userData.supervisorId || "",
					teamId: userData.teamId || "",
					userId: userId,
				};

				operatorsWithUsers.push({ operator, user });
			}

			// Sincronizar com mock local
			mockUsers.length = 0;
			operatorsWithUsers.forEach(({ user }) => {
				mockUsers.push(user);
			});

			console.log("Operadores encontrados:", operatorsWithUsers.length);
			return operatorsWithUsers;
		} catch (error) {
			console.error("Erro ao buscar operadores com usuários:", error);
			// Fallback para mock local
			return mockUsers
				.filter((user) => user.userType === "operator" && user.operatorData)
				.map((user) => {
					return { operator: user as Operator, user };
				});
		}
	}

	// Atualizar operador
	static async updateOperator(
		operatorId: string,
		data: Partial<Operator>
	): Promise<Operator> {
		try {
			// Atualizar no Firestore (coleção "users")
			const userRef = doc(db, "users", operatorId);
			await updateDoc(userRef, {
				...data,
				updatedAt: serverTimestamp(),
			});

			// Buscar o operador atualizado
			const updatedSnap = await getDoc(userRef);
			if (!updatedSnap.exists()) {
				throw new Error("Operador não encontrado");
			}

			const userData = updatedSnap.data();
			const updatedOperator: Operator = {
				id: operatorId,
				email: userData.email || "",
				name: userData.name || "",
				displayName: userData.displayName || "",
				company: userData.company || "",
				phone: userData.phone || "",
				photoURL: userData.photoURL || null,
				emailVerified: userData.emailVerified || false,
				userType: userData.userType || "operator",
				role: userData.role || "user",
				createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt || new Date().toISOString(),
				updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt || new Date().toISOString(),
				code: userData.code || "",
				primarySectorId: userData.primarySectorId || "",
				secondarySectorIds: userData.secondarySectorIds || [],
				skills: userData.skills || [],
				status: userData.status || "active",
				admissionDate: userData.admissionDate || "",
				lastTrainingDate: userData.lastTrainingDate || "",
				nextTrainingDate: userData.nextTrainingDate || "",
				contractType: userData.contractType || "clt",
				workSchedule: userData.workSchedule || "day",
				weeklyHours: userData.weeklyHours || 40,
				supervisorId: userData.supervisorId || "",
				teamId: userData.teamId || "",
				userId: operatorId,
				operatorData: {
					code: userData.code || "",
					primarySectorId: userData.primarySectorId || "",
					secondarySectorIds: userData.secondarySectorIds || [],
					trainedActivities: userData.trainedActivities || [],
					skills: userData.skills || [],
					status: userData.status || "active",
					admissionDate: userData.admissionDate || "",
					lastTrainingDate: userData.lastTrainingDate || "",
					nextTrainingDate: userData.nextTrainingDate || "",
					contractType: userData.contractType || "clt",
					workSchedule: userData.workSchedule || "day",
					weeklyHours: userData.weeklyHours || 40,
					supervisorId: userData.supervisorId || "",
					teamId: userData.teamId || "",
				}
			};

			// Atualizar mock local
			const index = mockUsers.findIndex((user) => user.id === operatorId);
			if (index !== -1) {
				mockUsers[index] = updatedOperator;
			}

			return updatedOperator;
		} catch (error) {
			console.error("Erro ao atualizar operador:", error);
			throw error;
		}
	}

	// Excluir operador e usuário
	static async deleteOperatorAndUser(operatorId: string): Promise<void> {
		try {
			// Como os operadores estão na coleção "users", vamos excluir diretamente
			const userRef = doc(db, "users", operatorId);
			const userSnap = await getDoc(userRef);

			if (!userSnap.exists()) {
				throw new Error("Operador não encontrado");
			}

			const userData = userSnap.data();
			if (userData.userType !== "operator") {
				throw new Error("Usuário não é um operador");
			}

			// Excluir o usuário operador do Firestore
			await deleteDoc(userRef);

			console.log("Operador excluído com sucesso do Firestore");

			// Atualizar mock local
			const userIndex = mockUsers.findIndex((u) => u.id === operatorId);
			if (userIndex !== -1) {
				mockUsers.splice(userIndex, 1);
			}
		} catch (error) {
			console.error("Erro ao excluir operador e usuário:", error);
			throw error;
		}
	}

	// Buscar operador por código
	static async getOperatorByCode(code: string): Promise<Operator | null> {
		try {
			// Buscar no Firestore
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("userType", "==", "operator"));
			const querySnapshot = await getDocs(q);

			for (const userDoc of querySnapshot.docs) {
				const userData = userDoc.data();
				const userId = userDoc.id;
				
				if (userData.code === code) {
					// Criar objeto Operator
					const operator: Operator = {
						id: userId,
						email: userData.email || "",
						name: userData.name || "",
						displayName: userData.displayName || "",
						company: userData.company || "",
						phone: userData.phone || "",
						photoURL: userData.photoURL || null,
						emailVerified: userData.emailVerified || false,
						userType: userData.userType || "operator",
						role: userData.role || "user",
						createdAt: userData.createdAt?.toDate?.()?.toISOString() || userData.createdAt || new Date().toISOString(),
						updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || userData.updatedAt || new Date().toISOString(),
						code: userData.code || "",
						primarySectorId: userData.primarySectorId || "",
						secondarySectorIds: userData.secondarySectorIds || [],
						skills: userData.skills || [],
						status: userData.status || "active",
						admissionDate: userData.admissionDate || "",
						lastTrainingDate: userData.lastTrainingDate || "",
						nextTrainingDate: userData.nextTrainingDate || "",
						contractType: userData.contractType || "clt",
						workSchedule: userData.workSchedule || "day",
						weeklyHours: userData.weeklyHours || 40,
						supervisorId: userData.supervisorId || "",
						teamId: userData.teamId || "",
						userId: userId,
						operatorData: {
							code: userData.code || "",
							primarySectorId: userData.primarySectorId || "",
							secondarySectorIds: userData.secondarySectorIds || [],
							trainedActivities: userData.trainedActivities || [],
							skills: userData.skills || [],
							status: userData.status || "active",
							admissionDate: userData.admissionDate || "",
							lastTrainingDate: userData.lastTrainingDate || "",
							nextTrainingDate: userData.nextTrainingDate || "",
							contractType: userData.contractType || "clt",
							workSchedule: userData.workSchedule || "day",
							weeklyHours: userData.weeklyHours || 40,
							supervisorId: userData.supervisorId || "",
							teamId: userData.teamId || "",
						}
					};
					
					return operator;
				}
			}

			// Fallback para mock local
			return (
				(mockUsers.find(
					(user) =>
						user.userType === "operator" &&
						user.operatorData &&
						user.operatorData.code === code
				) as Operator) || null
			);
		} catch (error) {
			console.error("Erro ao buscar operador por código:", error);
			// Fallback para mock local
			return (
				(mockUsers.find(
					(user) =>
						user.userType === "operator" &&
						user.operatorData &&
						user.operatorData.code === code
				) as Operator) || null
			);
		}
	}

	// Verificar se código já existe
	static async isCodeAlreadyUsed(code: string): Promise<boolean> {
		try {
			// Verificar no Firestore
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("userType", "==", "operator"));
			const querySnapshot = await getDocs(q);

			for (const userDoc of querySnapshot.docs) {
				const userData = userDoc.data();
				if (userData.code === code) {
					return true;
				}
			}

			// Fallback para mock local
			return mockUsers.some(
				(user) =>
					user.userType === "operator" &&
					user.operatorData &&
					user.operatorData.code === code
			);
		} catch (error) {
			console.error("Erro ao verificar código:", error);
			// Fallback para mock local
			return mockUsers.some(
				(user) =>
					user.userType === "operator" &&
					user.operatorData &&
					user.operatorData.code === code
			);
		}
	}

	// Verificar se email já existe
	static async isEmailAlreadyUsed(email: string): Promise<boolean> {
		try {
			// Verificar no Firestore
			const usersRef = collection(db, "users");
			const q = query(usersRef, where("email", "==", email));
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				return true;
			}

			// Fallback para mock local
			return mockUsers.some((user) => user.email === email);
		} catch (error) {
			console.error("Erro ao verificar email:", error);
			// Fallback para mock local
			return mockUsers.some((user) => user.email === email);
		}
	}
}

// Funções de conveniência para uso direto
export const createOperatorWithUser = AuthService.createOperatorWithUser;
export const getOperatorByUserId = AuthService.getOperatorByUserId;
export const getUserByOperatorId = AuthService.getUserByOperatorId;
export const isOperator = AuthService.isOperator;
export const getAllOperatorsWithUsers = AuthService.getAllOperatorsWithUsers;
export const updateOperator = AuthService.updateOperator;
export const deleteOperatorAndUser = AuthService.deleteOperatorAndUser;
export const getOperatorByCode = AuthService.getOperatorByCode;
export const isCodeAlreadyUsed = AuthService.isCodeAlreadyUsed;
export const isEmailAlreadyUsed = AuthService.isEmailAlreadyUsed;
