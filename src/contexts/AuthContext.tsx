import React, {
  createContext,
  useEffect,
  useReducer,
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
import type {
  AuthContextType,
  AuthState,
  AuthUser,
  RegisterData,
} from "../types";

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Actions
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: AuthUser | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_ERROR" };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            const user = await convertFirebaseUser(firebaseUser);
            dispatch({ type: "SET_USER", payload: user });
          } else {
            dispatch({ type: "SET_USER", payload: null });
          }
        } catch (error) {
          console.error("Error converting Firebase user:", error);
          dispatch({ type: "SET_ERROR", payload: "Failed to load user data" });
          dispatch({ type: "SET_USER", payload: null });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<AuthUser> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const user = await loginUser(email, password);
      dispatch({ type: "SET_USER", payload: user });
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<AuthUser> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      const user = await registerUser(data);
      dispatch({ type: "SET_USER", payload: user });
      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERROR" });

    try {
      await logoutUser();
      dispatch({ type: "SET_USER", payload: null });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Reset password function
  const handleResetPassword = async (email: string): Promise<void> => {
    dispatch({ type: "CLEAR_ERROR" });

    try {
      await resetPassword(email);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Password reset failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<AuthUser>): Promise<void> => {
    dispatch({ type: "CLEAR_ERROR" });

    try {
      await updateUserProfile(userData);

      // Update the user in context if currently logged in
      if (state.user) {
        const updatedUser = { ...state.user, ...userData };
        dispatch({ type: "SET_USER", payload: updatedUser });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Profile update failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Context value
  const value: AuthContextType = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    resetPassword: handleResetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
