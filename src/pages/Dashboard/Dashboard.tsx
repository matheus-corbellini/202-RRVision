import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { path } from "../../routes/path";
import Button from "../../components/Button/Button";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const { goTo } = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      goTo(path.landing);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    goTo(path.login);
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard - RR Vision Brazil</h1>
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Bem-vindo, {user.name || user.displayName || user.email}!</h2>
          <p>Você está logado no sistema RR Vision Brazil.</p>
        </div>

        <div className="user-info">
          <h3>Informações do Usuário</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Nome:</strong>{" "}
              {user.name || user.displayName || "Não informado"}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="info-item">
              <strong>Empresa:</strong> {user.company || "Não informado"}
            </div>
            <div className="info-item">
              <strong>Telefone:</strong> {user.phone || "Não informado"}
            </div>
            <div className="info-item">
              <strong>Email Verificado:</strong>{" "}
              {user.emailVerified ? "Sim" : "Não"}
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <h3>Ações Disponíveis</h3>
          <div className="actions-grid">
            <Button variant="primary">Gerenciar Perfil</Button>
            <Button variant="secondary">Configurações</Button>
            <Button variant="secondary">Relatórios</Button>
            <Button variant="secondary">Suporte</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
