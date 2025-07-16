import { useState } from "react";
import { useAuth } from "./useAuth";
import type { RegisterData } from "../types";

export const useRegister = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePasswords = (
    password: string,
    confirmPassword: string
  ): boolean => {
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return false;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return false;
    }

    return true;
  };

  const handleRegister = async (
    data: RegisterData & { confirmPassword: string }
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords
      if (!validatePasswords(data.password, data.confirmPassword)) {
        setLoading(false);
        return;
      }

      // Remove confirmPassword from data before sending to Firebase
      const registerData: RegisterData = {
        name: data.name,
        email: data.email,
        company: data.company,
        phone: data.phone,
        password: data.password,
      };
      await register(registerData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    handleRegister,
    loading,
    error,
    clearError,
  };
};
