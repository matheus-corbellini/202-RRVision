import {
	createUserWithEmailAndPassword,
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
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { auth, db } from "../lib/firebaseconfig";
import type { User, UserRoleType } from "../types";

// Interface para dados de criação de usuário
export interface CreateUserData {
	email: string;
	name: string;
	displayName?: string;
	company?: string;
	phone?: string;
	password: string;
	userType: string;
	role: UserRoleType;
}

// Interface para dados de atualização de usuário
export interface UpdateUserData {
	name?: string;
	displayName?: string;
	company?: string;
	phone?: string;
	userType?: string;
	role?: UserRoleType;
}

// Interface para resposta da criação
export interface CreateUserResponse {
	success: boolean;
	userId?: string;
	error?: string;
	user?: User;
}

/**
 * Verifica se um email já está em uso
 */
export const isEmailAlreadyUsed = async (email: string): Promise<boolean> => {
	try {
		const usersRef = collection(db, "users");
		const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
		const querySnapshot = await getDocs(q);
		
		return !querySnapshot.empty;
	} catch (error) {
		console.error("Erro ao verificar email:", error);
		throw new Error("Erro ao verificar disponibilidade do email");
	}
};

/**
 * Valida os dados de criação de usuário
 */
export const validateUserData = async (userData: CreateUserData): Promise<{ isValid: boolean; errors: string[] }> => {
	const errors: string[] = [];

	// Validações básicas
	if (!userData.email || !userData.email.trim()) {
		errors.push("E-mail é obrigatório");
	} else {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(userData.email)) {
			errors.push("E-mail inválido");
		}
	}

	if (!userData.name || !userData.name.trim()) {
		errors.push("Nome é obrigatório");
	}

	if (!userData.password || userData.password.length < 6) {
		errors.push("Senha deve ter pelo menos 6 caracteres");
	}

	if (!userData.userType || !userData.userType.trim()) {
		errors.push("Tipo de usuário é obrigatório");
	}

	if (!userData.role || !userData.role.trim()) {
		errors.push("Papel/função é obrigatório");
	}

	// Verificar se email já existe
	if (userData.email && userData.email.trim()) {
		try {
			const emailExists = await isEmailAlreadyUsed(userData.email);
			if (emailExists) {
				errors.push("E-mail já está em uso");
			}
		} catch (error) {
			errors.push("Erro ao verificar disponibilidade do email");
		}
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

/**
 * Cria um usuário no Firebase Auth e Firestore
 */
export const createUser = async (userData: CreateUserData): Promise<CreateUserResponse> => {
	try {
		// Validar dados
		const validation = await validateUserData(userData);
		if (!validation.isValid) {
			return {
				success: false,
				error: validation.errors.join(", ")
			};
		}

		// Criar usuário no Firebase Auth
		const userCredential: UserCredential = await createUserWithEmailAndPassword(
			auth,
			userData.email.trim().toLowerCase(),
			userData.password
		);

		const firebaseUser = userCredential.user;
		const userId = firebaseUser.uid;

		// Atualizar perfil do Firebase Auth
		await updateProfile(firebaseUser, {
			displayName: userData.displayName || userData.name,
		});

		// Preparar dados para o Firestore
		const firestoreData = {
			id: userId,
			uid: userId,
			email: userData.email.trim().toLowerCase(),
			name: userData.name.trim(),
			displayName: userData.displayName?.trim() || userData.name.trim(),
			company: userData.company?.trim() || "",
			phone: userData.phone?.trim() || "",
			photoURL: null,
			emailVerified: false,
			userType: userData.userType,
			role: userData.role,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		// Criar documento no Firestore
		const userRef = doc(db, "users", userId);
		await setDoc(userRef, firestoreData);

		// Fazer logout do usuário criado (para não afetar o usuário admin logado)
		await auth.signOut();

		// Criar objeto User para retorno
		const createdUser: User = {
			id: userId,
			email: firestoreData.email,
			name: firestoreData.name,
			displayName: firestoreData.displayName,
			company: firestoreData.company,
			phone: firestoreData.phone,
			photoURL: firestoreData.photoURL,
			emailVerified: firestoreData.emailVerified,
			userType: firestoreData.userType,
			role: firestoreData.role,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return {
			success: true,
			userId,
			user: createdUser
		};

	} catch (error: any) {
		console.error("Erro ao criar usuário:", error);
		
		// Fazer logout em caso de erro
		try {
			await auth.signOut();
		} catch (logoutError) {
			console.error("Erro ao fazer logout:", logoutError);
		}

		// Mapear erros do Firebase
		let errorMessage = "Erro ao criar usuário";
		
		if (error.code === "auth/email-already-in-use") {
			errorMessage = "E-mail já está em uso";
		} else if (error.code === "auth/weak-password") {
			errorMessage = "Senha muito fraca";
		} else if (error.code === "auth/invalid-email") {
			errorMessage = "E-mail inválido";
		} else if (error.message) {
			errorMessage = error.message;
		}

		return {
			success: false,
			error: errorMessage
		};
	}
};

/**
 * Atualiza um usuário existente
 */
export const updateUser = async (userId: string, updateData: UpdateUserData): Promise<CreateUserResponse> => {
	try {
		const userRef = doc(db, "users", userId);
		
		// Verificar se o usuário existe
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			return {
				success: false,
				error: "Usuário não encontrado"
			};
		}

		// Preparar dados de atualização
		const updateFields: any = {
			updatedAt: serverTimestamp(),
		};

		if (updateData.name) updateFields.name = updateData.name.trim();
		if (updateData.displayName) updateFields.displayName = updateData.displayName.trim();
		if (updateData.company) updateFields.company = updateData.company.trim();
		if (updateData.phone) updateFields.phone = updateData.phone.trim();
		if (updateData.userType) updateFields.userType = updateData.userType;
		if (updateData.role) updateFields.role = updateData.role;

		// Atualizar no Firestore
		await updateDoc(userRef, updateFields);

		// Buscar dados atualizados
		const updatedSnap = await getDoc(userRef);
		const userData = updatedSnap.data();

		const updatedUser: User = {
			id: userId,
			email: userData?.email || "",
			name: userData?.name || "",
			displayName: userData?.displayName || "",
			company: userData?.company || "",
			phone: userData?.phone || "",
			photoURL: userData?.photoURL || null,
			emailVerified: userData?.emailVerified || false,
			userType: userData?.userType || "user",
			role: userData?.role || "user",
			createdAt: userData?.createdAt?.toDate?.()?.toISOString() || userData?.createdAt || new Date().toISOString(),
			updatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || userData?.updatedAt || new Date().toISOString(),
		};

		return {
			success: true,
			userId,
			user: updatedUser
		};

	} catch (error: any) {
		console.error("Erro ao atualizar usuário:", error);
		
		return {
			success: false,
			error: error.message || "Erro ao atualizar usuário"
		};
	}
};

/**
 * Busca um usuário por ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
	try {
		const userRef = doc(db, "users", userId);
		const userSnap = await getDoc(userRef);

		if (!userSnap.exists()) {
			return null;
		}

		const userData = userSnap.data();
		
		return {
			id: userId,
			email: userData?.email || "",
			name: userData?.name || "",
			displayName: userData?.displayName || "",
			company: userData?.company || "",
			phone: userData?.phone || "",
			photoURL: userData?.photoURL || null,
			emailVerified: userData?.emailVerified || false,
			userType: userData?.userType || "user",
			role: userData?.role || "user",
			createdAt: userData?.createdAt?.toDate?.()?.toISOString() || userData?.createdAt || new Date().toISOString(),
			updatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || userData?.updatedAt || new Date().toISOString(),
		};

	} catch (error) {
		console.error("Erro ao buscar usuário:", error);
		return null;
	}
};

/**
 * Lista todos os usuários
 */
export const listAllUsers = async (): Promise<User[]> => {
	try {
		const usersRef = collection(db, "users");
		const snapshot = await getDocs(usersRef);
		
		return snapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				id: doc.id,
				email: data.email || "",
				name: data.name || "",
				displayName: data.displayName || "",
				company: data.company || "",
				phone: data.phone || "",
				photoURL: data.photoURL || null,
				emailVerified: data.emailVerified || false,
				userType: data.userType || "user",
				role: data.role || "user",
				createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
				updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
			} as User;
		});
	} catch (error) {
		console.error("Erro ao listar usuários:", error);
		throw error;
	}
};

/**
 * Remove um usuário
 */
export const deleteUser = async (userId: string): Promise<CreateUserResponse> => {
	try {
		const userRef = doc(db, "users", userId);
		
		// Verificar se o usuário existe
		const userSnap = await getDoc(userRef);
		if (!userSnap.exists()) {
			return {
				success: false,
				error: "Usuário não encontrado"
			};
		}

		// Remover do Firestore
		await setDoc(userRef, { deleted: true, deletedAt: serverTimestamp() }, { merge: true });

		return {
			success: true,
			userId
		};

	} catch (error: any) {
		console.error("Erro ao remover usuário:", error);
		
		return {
			success: false,
			error: error.message || "Erro ao remover usuário"
		};
	}
};
