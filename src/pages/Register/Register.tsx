"use client";
import "./Register.css";
import { useState } from "react";
import type React from "react";

import Header from "../../components/Header/Header";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigation } from "../../hooks/useNavigation";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const { goTo } = useNavigation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Senhas não coincidem");
      return;
    }
    console.log("Register attempt:", formData);
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
            <div className="form-row">
              <Input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={handleChange}
                required
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
              />
              <Input
                type="tel"
                name="phone"
                placeholder="Telefone"
                value={formData.phone}
                onChange={handleChange}
                required
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
              />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" required />
                <span className="checkmark"></span>
                Aceito os{" "}
                <span
                  style={{ cursor: "pointer", color: "#fbb040" }}
                  onClick={() => goTo("/terms")}
                >
                  termos de uso
                </span>{" "}
                e{" "}
                <span
                  style={{ cursor: "pointer", color: "#fbb040" }}
                  onClick={() => goTo("/privacy")}
                >
                  política de privacidade
                </span>
              </label>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Criar Conta
            </Button>
          </form>

          <div className="register-footer">
            <p>
              Já tem uma conta?{" "}
              <span
                style={{ cursor: "pointer", color: "#fbb040" }}
                onClick={() => goTo("/login")}
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
