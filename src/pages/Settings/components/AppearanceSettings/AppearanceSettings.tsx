"use client";

import "./AppearanceSettings.css";

interface AppearanceSettingsProps {
  config: {
    theme: "light" | "dark" | "auto";
    fontSize: "small" | "medium" | "large";
    compactMode: boolean;
    showAnimations: boolean;
  };
  onConfigChange: (key: string, value: any) => void;
}

export default function AppearanceSettings({
  config,
  onConfigChange,
}: AppearanceSettingsProps) {
  return (
    <div className="appearance-settings">
      <h2>Configurações de Aparência</h2>

      <div className="form-group">
        <label>Tema</label>
        <select
          value={config.theme}
          onChange={(e) => onConfigChange("theme", e.target.value)}
        >
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
          <option value="auto">Automático</option>
        </select>
      </div>

      <div className="form-group">
        <label>Tamanho da Fonte</label>
        <select
          value={config.fontSize}
          onChange={(e) => onConfigChange("fontSize", e.target.value)}
        >
          <option value="small">Pequeno</option>
          <option value="medium">Médio</option>
          <option value="large">Grande</option>
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.compactMode}
            onChange={(e) => onConfigChange("compactMode", e.target.checked)}
          />
          Modo compacto
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.showAnimations}
            onChange={(e) => onConfigChange("showAnimations", e.target.checked)}
          />
          Mostrar animações
        </label>
      </div>
    </div>
  );
}
