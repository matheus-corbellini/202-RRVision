"use client";

import { useState } from "react";
import {
  FaClipboardList,
  FaCalendarAlt,
  FaChartBar,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
} from "react-icons/fa";
import { useNavigation } from "../../hooks/useNavigation";
import { useAuth } from "../../hooks/useAuth";
import { path } from "../../routes/path";
import "./Sidebar.css";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { goTo } = useNavigation();

  const menuItems = [
    {
      id: "orders",
      title: "Pedidos",
      icon: <FaClipboardList />,
      description: "Ordens de Produção",
      badge: "3",
    },
    {
      id: "schedule",
      title: "Agenda",
      icon: <FaCalendarAlt />,
      description: "Agenda do Operador",
      badge: null,
    },
    {
      id: "productivity",
      title: "Produtividade",
      icon: <FaChartBar />,
      description: "Painel de Produtividade",
      badge: null,
    },
    {
      id: "nonconformities",
      title: "Não Conformidades",
      icon: <FaExclamationTriangle />,
      description: "Controle de Qualidade",
      badge: "2",
    },
    {
      id: "alerts",
      title: "Alertas",
      icon: <FaExclamationCircle />,
      description: "Alertas e Notificações",
      badge: "5",
    },
    {
      id: "control",
      title: "Painel de Controle",
      icon: <FaCog />,
      description: "Configurações do Sistema",
      badge: null,
    },
    {
      id: "priority-optimization",
      title: "Otimização",
      icon: <FaSync />,
      description: "Otimização de Prioridades",
      badge: "1",
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      goTo(path.landing);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className={`sidebar ${isCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {!isCollapsed && (
              <>
                <span className="logo-text">RR Vision</span>
                <span className="logo-subtitle">Brazil</span>
              </>
            )}
            {isCollapsed && <span className="logo-icon">RR</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className="user-info">
              <div className="user-name">
                {user?.name || user?.displayName || "Usuário"}
              </div>
              <div className="user-role">Operador</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && (
              <div className="nav-section-title">Menu Principal</div>
            )}
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${
                  currentPage === item.id ? "nav-item-active" : ""
                }`}
                onClick={() => onPageChange(item.id)}
                title={isCollapsed ? item.title : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <div className="nav-content">
                      <span className="nav-title">{item.title}</span>
                      <span className="nav-description">
                        {item.description}
                      </span>
                    </div>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="footer-item" title="Configurações">
            <span className="footer-icon">
              <FaCog />
            </span>
            {!isCollapsed && <span>Configurações</span>}
          </button>
          <button className="footer-item" title="Ajuda">
            <span className="footer-icon">
              <FaQuestionCircle />
            </span>
            {!isCollapsed && <span>Ajuda</span>}
          </button>
          <button
            className="footer-item logout-btn"
            onClick={handleLogout}
            title="Sair"
          >
            <span className="footer-icon">
              <FaSignOutAlt />
            </span>
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="sidebar-overlay" onClick={() => setIsCollapsed(true)} />
      )}
    </>
  );
}
