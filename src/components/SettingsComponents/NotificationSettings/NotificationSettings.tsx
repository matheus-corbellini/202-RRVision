"use client";

import "./NotificationSettings.css";

interface NotificationSettingsProps {
  config: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    alertSounds: boolean;
    notificationFrequency: string;
  };
  onConfigChange: (key: string, value: any) => void;
}

export default function NotificationSettings({
  config,
  onConfigChange,
}: NotificationSettingsProps) {
  return (
    <div className="notification-settings">
      <h2>Configurações de Notificações</h2>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.emailNotifications}
            onChange={(e) =>
              onConfigChange("emailNotifications", e.target.checked)
            }
          />
          Receber notificações por e-mail
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.pushNotifications}
            onChange={(e) =>
              onConfigChange("pushNotifications", e.target.checked)
            }
          />
          Notificações push no navegador
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.alertSounds}
            onChange={(e) => onConfigChange("alertSounds", e.target.checked)}
          />
          Sons de alerta
        </label>
      </div>

      <div className="form-group">
        <label>Frequência de Notificações</label>
        <select
          value={config.notificationFrequency}
          onChange={(e) =>
            onConfigChange("notificationFrequency", e.target.value)
          }
        >
          <option value="immediate">Imediata</option>
          <option value="hourly">A cada hora</option>
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
        </select>
      </div>
    </div>
  );
}
