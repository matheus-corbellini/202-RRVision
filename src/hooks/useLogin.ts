import { useState } from "react";
import { useAuth } from "./useAuth";
import type { LoginData, AuthUser } from "../types";

export const useLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginData): Promise<AuthUser> => {
    setLoading(true);
    setError(null);

    try {
      const user = await login(data.email, data.password);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    handleLogin,
    loading,
    error,
    clearError,
  };
};
