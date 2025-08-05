"use client";
import "./Login.css";
import { useState } from "react";
import type React from "react";
import { HiMail, HiLockClosed } from "react-icons/hi";

import Header from "../../components/Header/Header";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigation } from "../../hooks/useNavigation";
import { useLogin } from "../../hooks/useLogin";
import { path } from "../../routes/path";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { goTo } = useNavigation();
  const { handleLogin, loading, error, clearError } = useLogin();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError();
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleLogin(formData);
      // On successful login, navigate to dashboard or home
      goTo(path.dashboard);
    } catch (err) {
      // Error is handled by the hook
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Entrar no Sistema</h1>
            <p>Acesse sua conta RR Vision Brazil</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div
                className="error-message"
                style={{
                  color: "#e53e3e",
                  backgroundColor: "#fed7d7",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1rem",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <Input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              icon={<HiMail />}
            />

            <Input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              icon={<HiLockClosed />}
            />

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" disabled={loading} />
                Lembrar de mim
              </label>
              <span
                className="forgot-link"
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={() => !loading && goTo(path.forgotPassword)}
              >
                Esqueceu a senha?
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="login-footer">
            <p>
              Não tem uma conta?{" "}
              <span
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  color: "#fbb040",
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={() => !loading && goTo(path.register)}
              >
                Cadastre-se
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
