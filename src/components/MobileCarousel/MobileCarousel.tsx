import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { path } from '../../routes/path';
import { 
  FaChartBar,
  FaClipboardList, 
  FaCalendarAlt, 
  FaBolt, 
  FaExclamationTriangle, 
  FaBox, 
  FaRoute, 
  FaFlask,
  FaCog
} from 'react-icons/fa';
import './MobileCarousel.css';

interface MobileCarouselProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

export default function MobileCarousel({
  currentPage,
  onPageChange,
}: MobileCarouselProps) {
  const { goTo } = useNavigation();

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <FaChartBar className="carousel-icon" />,
      path: path.dashboard,
    },
    {
      id: "orders",
      title: "Pedidos",
      icon: <FaClipboardList className="carousel-icon" />,
      path: path.orders,
    },
    {
      id: "schedule",
      title: "Agenda",
      icon: <FaCalendarAlt className="carousel-icon" />,
      path: path.schedule,
    },
    {
      id: "productivity",
      title: "Produtividade",
      icon: <FaBolt className="carousel-icon" />,
      path: path.productivity,
    },
    {
      id: "nonconformities",
      title: "Não Conformidades",
      icon: <FaExclamationTriangle className="carousel-icon" />,
      path: path.nonConformities,
    },
    {
      id: "products",
      title: "Produtos",
      icon: <FaBox className="carousel-icon" />,
      path: path.products,
    },
    {
      id: "operational-routes",
      title: "Rotas Operacionais",
      icon: <FaRoute className="carousel-icon" />,
      path: path.operationalRoutes,
    },
    {
      id: "bling-integration",
      title: "Integração Bling",
      icon: <FaFlask className="carousel-icon" />,
      path: path.blingIntegration,
    },
    {
      id: "settings",
      title: "Configurações",
      icon: <FaCog className="carousel-icon" />,
      path: path.settings,
    },
  ];

  const handleItemClick = (item: MenuItem) => {
    goTo(item.path);
    onPageChange(item.id);
  };

  return (
    <div className="mobile-carousel">
      <div className="carousel-container">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`carousel-item ${currentPage === item.id ? "active" : ""}`}
            onClick={() => handleItemClick(item)}
            title={item.title}
          >
            <div className="carousel-icon-wrapper">
              {item.icon}
            </div>
            <span className="carousel-label">{item.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
