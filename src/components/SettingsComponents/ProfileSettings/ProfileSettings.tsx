"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ProfileSettings.css";

interface ProfileSettingsProps {
  config: {
    userName: string;
    email: string;
    language: string;
    timezone: string;
  };
  onConfigChange: (key: string, value: any) => void;
}

export default function ProfileSettings({
  config,
  onConfigChange,
}: ProfileSettingsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="profile-settings">
      <h2>Configurações de Perfil</h2>

      <div className="form-group">
        <label>Nome do Usuário</label>
        <input
          type="text"
          value={config.userName}
          onChange={(e) => onConfigChange("userName", e.target.value)}
          placeholder="Digite seu nome"
        />
      </div>

      <div className="form-group">
        <label>E-mail</label>
        <input
          type="email"
          value={config.email}
          onChange={(e) => onConfigChange("email", e.target.value)}
          placeholder="seu@email.com"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Idioma</label>
          <select
            value={config.language}
            onChange={(e) => onConfigChange("language", e.target.value)}
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </select>
        </div>

        <div className="form-group">
          <label>Fuso Horário</label>
          <select
            value={config.timezone}
            onChange={(e) => onConfigChange("timezone", e.target.value)}
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/Manaus">Manaus (GMT-4)</option>
            <option value="America/Belem">Belém (GMT-3)</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Nova Senha</label>
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua nova senha"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
    </div>
  );
}
