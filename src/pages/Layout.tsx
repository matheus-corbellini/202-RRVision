"use client";

import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import "./Layout.css";
import Dashboard from "./Dashboard/DashboardWithSidebar";
import OperatorSchedule from "./OperatorSchedule/OperatorSchedule";
import ProductivityPanel from "./ProductivityPanel/ProductivityPanel";
import NonConformities from "./NonConformities/NonConformities";
import AlertsPanel from "./AlertsPanel/AlertsPanel";
import ControlPanel from "./ControlPanel/ControlPanel";
import PriorityOptimization from "./PriorityOptimization/PriorityOptimization";
import BlingIntegration from "./BlingIntegration/BlingIntegration";
import OperationalRoutes from "./OperationalRoutes/OperationalRoutes";
import OperationalRoutesList from "./OperationalRoutesList/OperationalRoutesList";
import Settings from "./Settings/Settings";
import UserCreation from "./UserCreation/UserCreation";
import ProductManagement from "./ProductManagement/ProductManagement";
import Admin from "./Admin/Admin";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === "/app" || path === "/app/") return "orders";
    if (path === "/app/schedule") return "schedule";
    if (path === "/app/productivity") return "productivity";
    if (path === "/app/nonconformities") return "nonconformities";
    if (path === "/app/alerts") return "alerts";
    if (path === "/app/control") return "control";
    if (path === "/app/priority-optimization") return "priority-optimization";
    if (path === "/app/operators-list") return "operators-list";
    if (path === "/app/bling-integration") return "bling-integration";
    if (path === "/app/operational-routes") return "operational-routes";
    if (path === "/app/operational-routes-list") return "operational-routes-list";
    if (path === "/app/settings") return "settings";
    if (path === "/app/user-creation") return "user-creation";
    if (path === "/app/product-management") return "product-management";
    if (path === "/app/admin-users") return "admin-users";
    return "orders";
  };

  const handlePageChange = (page: string) => {
    const routeMap: { [key: string]: string } = {
      "orders": "/app",
      "schedule": "/app/schedule",
      "productivity": "/app/productivity",
      "nonconformities": "/app/nonconformities",
      "alerts": "/app/alerts",
      "control": "/app/control",
      "priority-optimization": "/app/priority-optimization",
      "operators-list": "/app/operators-list",
      "bling-integration": "/app/bling-integration",
      "operational-routes": "/app/operational-routes",
      "operational-routes-list": "/app/operational-routes-list",
      "settings": "/app/settings",
      "user-creation": "/app/user-creation",
      "product-management": "/app/product-management",
      "admin-users": "/app/admin-users",
    };
    
    const route = routeMap[page] || "/app";
    navigate(route);
  };

  const renderCurrentPage = () => {
    const currentPage = getCurrentPage();
    switch (currentPage) {
      case "orders":
        return <Dashboard />;
      case "schedule":
        return <OperatorSchedule />;
      case "productivity":
        return <ProductivityPanel />;
      case "nonconformities":
        return <NonConformities />;
      case "alerts":
        return <AlertsPanel />;
      case "control":
        return <ControlPanel />;
      case "priority-optimization":
        return <PriorityOptimization />;
      case "bling-integration":
        return <BlingIntegration />;
      case "operational-routes":
        return <OperationalRoutes />;
      case "operational-routes-list":
        return <OperationalRoutesList />;
      case "settings":
        return <Settings />;
      case "user-creation":
        return <UserCreation />;
      case "product-management":
        return <ProductManagement />;
      case "admin-users":
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
        variant="default"
      />
      <div className="dashboard-main">
        {renderCurrentPage()}
      </div>
    </div>
  );
}
