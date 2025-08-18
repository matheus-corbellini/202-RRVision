"use client";

import "./SecuritySettings.css";

interface SecuritySettingsProps {
  config: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
  };
  onConfigChange: (key: string, value: any) => void;
}

export default function SecuritySettings({
  config,
  onConfigChange,
}: SecuritySettingsProps) {
  return (
    <div className="security-settings">
      <h2>Configurações de Segurança</h2>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.twoFactorAuth}
            onChange={(e) => onConfigChange("twoFactorAuth", e.target.checked)}
          />
          Autenticação de dois fatores (2FA)
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tempo limite da sessão (minutos)</label>
          <input
            type="number"
            value={config.sessionTimeout}
            onChange={(e) =>
              onConfigChange("sessionTimeout", parseInt(e.target.value))
            }
            min="5"
            max="480"
          />
        </div>

        <div className="form-group">
          <label>Expiração de senha (dias)</label>
          <input
            type="number"
            value={config.passwordExpiry}
            onChange={(e) =>
              onConfigChange("passwordExpiry", parseInt(e.target.value))
            }
            min="30"
            max="365"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Tentativas de login permitidas</label>
        <input
          type="number"
          value={config.loginAttempts}
          onChange={(e) =>
            onConfigChange("loginAttempts", parseInt(e.target.value))
          }
          min="1"
          max="10"
        />
      </div>
    </div>
  );
}
