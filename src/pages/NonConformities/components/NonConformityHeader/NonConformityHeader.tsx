import "./NonConformityHeader.css";

interface NonConformityHeaderProps {
  onNewNCClick: () => void;
}

export default function NonConformityHeader({
  onNewNCClick,
}: NonConformityHeaderProps) {
  return (
    <div className="nc-header">
      <div className="header-info">
        <h1>Não Conformidades</h1>
        <p>Gestão completa de ocorrências e ações corretivas</p>
      </div>
      <div className="header-actions">
        <button className="new-nc-btn" onClick={onNewNCClick}>
          ➕ Nova Não Conformidade
        </button>
      </div>
    </div>
  );
}
