import { FaTimes } from "react-icons/fa";
import "./NewNCModal.css";

interface NewNC {
  title: string;
  description: string;
  category: "quality" | "safety" | "process" | "equipment" | "material";
  severity: "low" | "medium" | "high" | "critical";
  stopProduction: boolean;
  sector: string;
  station: string;
  equipment: string;
  relatedTaskId: string;
}

interface NewNCModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newNC: NewNC;
  setNewNC: (nc: NewNC) => void;
}

export default function NewNCModal({
  showModal,
  onClose,
  onSubmit,
  newNC,
  setNewNC,
}: NewNCModalProps) {
  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Não Conformidade</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              value={newNC.title}
              onChange={(e) => setNewNC({ ...newNC, title: e.target.value })}
              placeholder="Descreva brevemente o problema"
            />
          </div>

          <div className="form-group">
            <label>Descrição detalhada:</label>
            <textarea
              value={newNC.description}
              onChange={(e) =>
                setNewNC({ ...newNC, description: e.target.value })
              }
              placeholder="Descreva detalhadamente o problema encontrado"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Categoria:</label>
              <select
                value={newNC.category}
                onChange={(e) =>
                  setNewNC({
                    ...newNC,
                    category: e.target.value as NewNC["category"],
                  })
                }
              >
                <option value="quality">Qualidade</option>
                <option value="safety">Segurança</option>
                <option value="process">Processo</option>
                <option value="equipment">Equipamento</option>
                <option value="material">Material</option>
              </select>
            </div>

            <div className="form-group">
              <label>Severidade:</label>
              <select
                value={newNC.severity}
                onChange={(e) =>
                  setNewNC({
                    ...newNC,
                    severity: e.target.value as NewNC["severity"],
                  })
                }
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Setor:</label>
              <input
                type="text"
                value={newNC.sector}
                onChange={(e) => setNewNC({ ...newNC, sector: e.target.value })}
                placeholder="Ex: Corte, Montagem, Acabamento"
              />
            </div>

            <div className="form-group">
              <label>Estação:</label>
              <input
                type="text"
                value={newNC.station}
                onChange={(e) =>
                  setNewNC({ ...newNC, station: e.target.value })
                }
                placeholder="Ex: Estação 01, Linha 02"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Equipamento (opcional):</label>
            <input
              type="text"
              value={newNC.equipment}
              onChange={(e) =>
                setNewNC({ ...newNC, equipment: e.target.value })
              }
              placeholder="Ex: Serra CNC-001, Compressor CP-005"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newNC.stopProduction}
                onChange={(e) =>
                  setNewNC({ ...newNC, stopProduction: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Parar produção imediatamente
            </label>
            <p className="checkbox-help">
              Marque esta opção se o problema requer interrupção imediata da
              produção
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={onSubmit}
            disabled={!newNC.title || !newNC.description}
          >
            Registrar Não Conformidade
          </button>
        </div>
      </div>
    </div>
  );
}
