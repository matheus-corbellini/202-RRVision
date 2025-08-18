"use client";

import { useState } from "react";
import {
  FaCog,
  FaUser,
  FaBell,
  FaPalette,
  FaShieldAlt,
  FaSave,
  FaUndo,
  FaTimes,
} from "react-icons/fa";
import {
  ProfileSettings,
  NotificationSettings,
  AppearanceSettings,
  SecuritySettings,
  SystemSettings,
} from "../../components/SettingsComponents/index";
import "./Settings.css";

interface SettingsConfig {
  // Configurações de Usuário
  userName: string;
  email: string;
  language: string;
  timezone: string;

  // Configurações de Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertSounds: boolean;
  notificationFrequency: string;

  // Configurações de Interface
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  showAnimations: boolean;

  // Configurações de Segurança
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;

  // Configurações de Sistema
  autoSave: boolean;
  backupFrequency: string;
  dataRetention: number;
  debugMode: boolean;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [config, setConfig] = useState<SettingsConfig>({
    // Configurações de Usuário
    userName: "João Silva",
    email: "joao.silva@empresa.com",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",

    // Configurações de Notificações
    emailNotifications: true,
    pushNotifications: true,
    alertSounds: false,
    notificationFrequency: "immediate",

    // Configurações de Interface
    theme: "light",
    fontSize: "medium",
    compactMode: false,
    showAnimations: true,

    // Configurações de Segurança
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 3,

    // Configurações de Sistema
    autoSave: true,
    backupFrequency: "daily",
    dataRetention: 365,
    debugMode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Simular salvamento
    console.log("Salvando configurações:", config);
    setHasChanges(false);
    // Aqui você implementaria a lógica real de salvamento
  };

  const handleReset = () => {
    // Resetar para configurações padrão
    setConfig({
      userName: "João Silva",
      email: "joao.silva@empresa.com",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      emailNotifications: true,
      pushNotifications: true,
      alertSounds: false,
      notificationFrequency: "immediate",
      theme: "light",
      fontSize: "medium",
      compactMode: false,
      showAnimations: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 3,
      autoSave: true,
      backupFrequency: "daily",
      dataRetention: 365,
      debugMode: false,
    });
    setHasChanges(false);
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: <FaUser /> },
    { id: "notifications", label: "Notificações", icon: <FaBell /> },
    { id: "appearance", label: "Aparência", icon: <FaPalette /> },
    { id: "security", label: "Segurança", icon: <FaShieldAlt /> },
    { id: "system", label: "Sistema", icon: <FaCog /> },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileSettings
            config={{
              userName: config.userName,
              email: config.email,
              language: config.language,
              timezone: config.timezone,
            }}
            onConfigChange={handleConfigChange}
          />
        );
      case "notifications":
        return (
          <NotificationSettings
            config={{
              emailNotifications: config.emailNotifications,
              pushNotifications: config.pushNotifications,
              alertSounds: config.alertSounds,
              notificationFrequency: config.notificationFrequency,
            }}
            onConfigChange={handleConfigChange}
          />
        );
      case "appearance":
        return (
          <AppearanceSettings
            config={{
              theme: config.theme,
              fontSize: config.fontSize,
              compactMode: config.compactMode,
              showAnimations: config.showAnimations,
            }}
            onConfigChange={handleConfigChange}
          />
        );
      case "security":
        return (
          <SecuritySettings
            config={{
              twoFactorAuth: config.twoFactorAuth,
              sessionTimeout: config.sessionTimeout,
              passwordExpiry: config.passwordExpiry,
              loginAttempts: config.loginAttempts,
            }}
            onConfigChange={handleConfigChange}
          />
        );
      case "system":
        return (
          <SystemSettings
            config={{
              autoSave: config.autoSave,
              backupFrequency: config.backupFrequency,
              dataRetention: config.dataRetention,
              debugMode: config.debugMode,
            }}
            onConfigChange={handleConfigChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Configurações</h1>
          <p>Gerencie suas preferências e configurações do sistema</p>
        </div>

        <div className="settings-content">
          {/* Sidebar de Abas */}
          <div className="settings-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo das Configurações */}
          <div className="settings-main">{renderActiveTab()}</div>
        </div>

        {/* Barra de Ações */}
        <div className="settings-actions">
          <button
            className="action-btn secondary"
            onClick={handleReset}
            disabled={!hasChanges}
          >
            <FaUndo />
            Restaurar Padrão
          </button>
          <div className="action-buttons">
            <button
              className="action-btn cancel"
              onClick={() => setHasChanges(false)}
              disabled={!hasChanges}
            >
              <FaTimes />
              Cancelar
            </button>
            <button
              className="action-btn save"
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <FaSave />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
