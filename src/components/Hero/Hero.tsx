import Button from "../Button/Button";
import { useNavigation } from "../../hooks/useNavigation";
import { scrollToSection } from "../../hooks/scrollToSection";
import "./Hero.css";

export default function Hero() {
  const { goTo } = useNavigation();
  const handleNav = (path: string) => {
    if (path.startsWith("#")) {
      scrollToSection(path);
    } else {
      goTo(path);
    }
  };
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Automatize seu Controle de Produção Industrial
            </h1>
            <p className="hero-description">
              Integre dados do ERP Bling com processos internos, otimize a
              alocação de operadores e monitore a eficiência em tempo real com
              dashboards dinâmicos e alertas automáticos.
            </p>
            <div className="hero-actions">
              <Button
                variant="primary"
                size="large"
                onClick={() => handleNav("/register")}
              >
                Começar Agora
              </Button>
              <Button
                variant="outline"
                size="large"
                onClick={() => handleNav("#features")}
              >
                Conhecer Recursos
              </Button>
            </div>
          </div>
          <div className="hero-image">
            <div className="dashboard-preview">
              <div className="dashboard-header">
                <div className="dashboard-tabs">
                  <div className="tab active">Dashboard</div>
                  <div className="tab">Produção</div>
                  <div className="tab">Operadores</div>
                </div>
              </div>
              <div className="dashboard-content">
                <div className="metric-card">
                  <div className="metric-value">87%</div>
                  <div className="metric-label">Eficiência</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">24</div>
                  <div className="metric-label">Ordens Ativas</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">156</div>
                  <div className="metric-label">Operadores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
