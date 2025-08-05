import { useNavigation } from "../../hooks/useNavigation";
import { scrollToSection } from "../../hooks/scrollToSection";
import "./Footer.css";
import { Footer } from "borderless";

export default function FooterNew() {
  const { goTo } = useNavigation();
  const handleNav = (path: string) => {
    if (path.startsWith("#")) {
      scrollToSection(path);
    } else {
      goTo(path);
    }
  };
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>RR Vision Brazil</h3>
            <p>
              Automatizando o controle de produção industrial com tecnologia e
              inovação.
            </p>
          </div>

          <div className="footer-section">
            <h4>Produto</h4>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#features")}
            >
              Recursos
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/pricing")}
            >
              Preços
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/demo")}
            >
              Demo
            </span>
          </div>

          <div className="footer-section">
            <h4>Empresa</h4>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#about")}
            >
              Sobre
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/careers")}
            >
              Carreiras
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#contact")}
            >
              Contato
            </span>
          </div>

          <div className="footer-section">
            <h4>Suporte</h4>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/help")}
            >
              Ajuda
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/docs")}
            >
              Documentação
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/support")}
            >
              Suporte Técnico
            </span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 RR Vision Brazil. Todos os direitos reservados.</p>
          <div className="footer-links">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/privacy")}
            >
              Privacidade
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("/terms")}
            >
              Termos de Uso
            </span>
          </div>
        </div>

        <Footer backgroundColor="transparent" theme="dark" />
      </div>
    </footer>
  );
}
