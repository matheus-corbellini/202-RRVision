"use client";
import "./Register.css";
import { useState } from "react";
import type React from "react";
import {
  HiUser,
  HiMail,
  HiOfficeBuilding,
  HiPhone,
  HiLockClosed,
} from "react-icons/hi";

import Header from "../../components/Header/Header";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigation } from "../../hooks/useNavigation";
import { useRegister } from "../../hooks/useRegister";
import { path } from "../../routes/path";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { goTo } = useNavigation();
  const { handleRegister, loading, error, clearError } = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) clearError(); // Clear error when user starts typing
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert("Você deve aceitar os termos de uso e política de privacidade");
      return;
    }

    try {
      await handleRegister(formData);
      // On successful registration, navigate to dashboard or welcome page
      goTo(path.dashboard);
    } catch (err) {
      // Error is handled by the hook
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="register-page">
      <Header />
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Criar Conta</h1>
            <p>Cadastre-se no RR Vision Brazil</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
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

            <div className="form-row">
              <Input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
                icon={<HiUser />}
              />
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
            </div>

            <div className="form-row">
              <Input
                type="text"
                name="company"
                placeholder="Empresa"
                value={formData.company}
                onChange={handleChange}
                required
                disabled={loading}
                icon={<HiOfficeBuilding />}
              />
              <Input
                type="tel"
                name="phone"
                placeholder="Telefone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={loading}
                icon={<HiPhone />}
              />
            </div>

            <div className="form-row">
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
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                icon={<HiLockClosed />}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span className="checkmark"></span>
                Aceito os{" "}
                <span
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    color: "#fbb040",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onClick={() => !loading && goTo(path.terms)}
                >
                  termos de uso
                </span>{" "}
                e{" "}
                <span
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    color: "#fbb040",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onClick={() => !loading && goTo(path.privacy)}
                >
                  política de privacidade
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !acceptedTerms}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="register-footer">
            <p>
              Já tem uma conta?{" "}
              <span
                style={{
                  cursor: loading ? "not-allowed" : "pointer",
                  color: "#fbb040",
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={() => !loading && goTo(path.login)}
              >
                Faça login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
