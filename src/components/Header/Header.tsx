"use client";
import { useState } from "react";
import Button from "../Button/Button";
import { useNavigation } from "../../hooks/useNavigation";
import { scrollToSection } from "../../hooks/scrollToSection";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { goTo } = useNavigation();

  const handleNav = (path: string) => {
    if (path.startsWith("#")) {
      scrollToSection(path);
    } else {
      goTo(path);
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <span
            className="logo"
            style={{ cursor: "pointer" }}
            onClick={() => handleNav("/")}
          >
            <span className="logo-text">RR Vision Brazil</span>
          </span>

          <nav className={`nav ${isMenuOpen ? "nav-open" : ""}`}>
            <span
              className="nav-link"
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#features")}
            >
              Recursos
            </span>
            <span
              className="nav-link"
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#about")}
            >
              Sobre
            </span>
            <span
              className="nav-link"
              style={{ cursor: "pointer" }}
              onClick={() => handleNav("#contact")}
            >
              Contato
            </span>
          </nav>

          <div className="header-actions">
            <Button variant="outline" onClick={() => handleNav("/login")}>
              Entrar
            </Button>
            <Button variant="primary" onClick={() => handleNav("/register")}>
              Cadastrar
            </Button>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
