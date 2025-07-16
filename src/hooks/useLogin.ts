import { useState } from "react";
import { useAuth } from "./useAuth";
import type { LoginData } from "../types";

export const useLogin = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
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
