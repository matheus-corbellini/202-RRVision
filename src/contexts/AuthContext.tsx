import React, {
	createContext,
	useEffect,
	useReducer,
	useCallback,
	useMemo,
	type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../lib/firebaseconfig";
import {
	loginUser,
	registerUser,
	logoutUser,
	resetPassword,
	updateUserProfile,
	convertFirebaseUser,
} from "../services/authService";
import type { AuthContextType, AuthUser, RegisterData } from "../types";

// Define AuthState interface locally since it's not exported from types
interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	error: string | null;
}

// Initial state
const initialState: AuthState = {
	user: null,
	loading: true,
	error: null,
};

// Actions - Using const assertions for better type inference
const AUTH_ACTIONS = {
	SET_LOADING: "SET_LOADING",
	SET_USER: "SET_USER",
	SET_ERROR: "SET_ERROR",
	CLEAR_ERROR: "CLEAR_ERROR",
} as const;

type AuthAction =
	| { type: typeof AUTH_ACTIONS.SET_LOADING; payload: boolean }
	| { type: typeof AUTH_ACTIONS.SET_USER; payload: AuthUser | null }
	| { type: typeof AUTH_ACTIONS.SET_ERROR; payload: string | null }
	| { type: typeof AUTH_ACTIONS.CLEAR_ERROR };

// Reducer - Optimized with early returns and cleaner logic
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case AUTH_ACTIONS.SET_LOADING:
			return { ...state, loading: action.payload };

		case AUTH_ACTIONS.SET_USER:
			return {
				...state,
				user: action.payload,
				loading: false,
				error: null,
			};

		case AUTH_ACTIONS.SET_ERROR:
			return { ...state, error: action.payload, loading: false };

		case AUTH_ACTIONS.CLEAR_ERROR:
			return { ...state, error: null };

		default:
			return state;
	}
};

// Create context with better type safety
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
	children: ReactNode;
}

/**
 * AuthProvider - Gerencia o estado de autenticação da aplicação
 *
 * Funcionalidades principais:
 * - Mantém os dados do usuário logado em memória durante a sessão
 * - Persiste o estado de autenticação através do Firebase Auth
 * - Fornece funções para login, registro, logout e atualização de perfil
 * - Atualiza automaticamente o estado quando há mudanças na autenticação
 *
 * Os dados do usuário são mantidos em:
 * 1. Firebase Auth (credenciais e estado de autenticação)
 * 2. Firestore (dados do perfil do usuário)
 * 3. Contexto React (estado local para componentes)
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	// Memoized action creators to prevent unnecessary re-renders
	const setLoading = useCallback((loading: boolean) => {
		dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading });
	}, []);

	const setUser = useCallback((user: AuthUser | null) => {
		dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
	}, []);

	const setError = useCallback((error: string | null) => {
		dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error });
	}, []);

	const clearError = useCallback(() => {
		dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
	}, []);

	// Handle Firebase auth state changes - Optimized with useCallback
	const handleAuthStateChange = useCallback(
		async (firebaseUser: FirebaseUser | null) => {
			try {
				if (firebaseUser) {
					const user = await convertFirebaseUser(firebaseUser);
					setUser(user);
				} else {
					setUser(null);
				}
			} catch (error) {
				console.error("Error converting Firebase user:", error);
				setError("Failed to load user data");
				setUser(null);
			}
		},
		[setUser, setError]
	);

	// Handle Firebase auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
		return () => unsubscribe();
	}, [handleAuthStateChange]);

	// Login function - Memoized to prevent unnecessary re-renders
	const login = useCallback(
		async (email: string, password: string): Promise<AuthUser> => {
			setLoading(true);
			clearError();

			try {
				const user = await loginUser(email, password);
				setUser(user);
				return user;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Login failed";
				setError(errorMessage);
				throw error;
			}
		},
		[setLoading, clearError, setUser, setError]
	);

	// Register function - Memoized
	const register = useCallback(
		async (data: RegisterData): Promise<AuthUser> => {
			setLoading(true);
			clearError();

			try {
				const user = await registerUser(data);
				setUser(user);
				return user;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Registration failed";
				setError(errorMessage);
				throw error;
			}
		},
		[setLoading, clearError, setUser, setError]
	);

	// Logout function - Memoized
	const logout = useCallback(async (): Promise<void> => {
		setLoading(true);
		clearError();

		try {
			await logoutUser();
			setUser(null);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Logout failed";
			setError(errorMessage);
			throw error;
		}
	}, [setLoading, clearError, setUser, setError]);

	// Reset password function - Memoized
	const handleResetPassword = useCallback(
		async (email: string): Promise<void> => {
			clearError();

			try {
				await resetPassword(email);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Password reset failed";
				setError(errorMessage);
				throw error;
			}
		},
		[clearError, setError]
	);

	// Update profile function - Memoized
	const updateProfile = useCallback(
		async (userData: Partial<AuthUser>): Promise<void> => {
			clearError();

			try {
				await updateUserProfile(userData);

				// Update the user in context if currently logged in
				if (state.user) {
					const updatedUser = { ...state.user, ...userData };
					setUser(updatedUser);
				}
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Profile update failed";
				setError(errorMessage);
				throw error;
			}
		},
		[clearError, setError, setUser, state.user]
	);

	// Memoized context value to prevent unnecessary re-renders
	const contextValue = useMemo<AuthContextType>(
		() => ({
			user: state.user,
			loading: state.loading,
			login,
			register,
			logout,
		}),
		[state.user, state.loading, login, register, logout]
	);

	// Memoized utility functions
	const getCurrentUser = useCallback((): AuthUser | null => {
		return state.user;
	}, [state.user]);

	const isAuthenticated = useCallback((): boolean => {
		return state.user !== null;
	}, [state.user]);

	// Debug logging only in development
	if (process.env.NODE_ENV === "development") {
		console.log("AuthContext value updated:", {
			user: contextValue.user,
			loading: contextValue.loading,
			isAuthenticated: isAuthenticated(),
		});
	}

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

export default AuthContext;

/**
 * Hook personalizado para usar o AuthContext
 * Fornece tipagem melhorada e validação de uso
 */
export const useAuth = (): AuthContextType => {
	const context = React.useContext(AuthContext);

	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};

/**
 * Hook para verificar se o usuário está autenticado
 * Retorna um boolean indicando o status de autenticação
 */
export const useAuthStatus = (): boolean => {
	const { user } = useAuth();
	return user !== null;
};

/**
 * Hook para obter dados específicos do usuário
 * Retorna os dados do usuário ou null se não autenticado
 */
export const useUserData = (): AuthUser | null => {
	const { user } = useAuth();
	return user;
};

/**
 * EXEMPLOS DE USO:
 *
 * 1. useAuth() - Hook principal para acessar o contexto
 * 2. useAuthStatus() - Verifica se o usuário está autenticado
 * 3. useUserData() - Obtém os dados do usuário atual
 *
 * Os dados do usuário são automaticamente:
 * - Carregados quando a aplicação inicia
 * - Atualizados quando há mudanças na autenticação
 * - Mantidos em memória durante a sessão
 * - Limpos quando o usuário faz logout
 */
