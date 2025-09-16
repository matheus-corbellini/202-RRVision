"use client";

import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
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
// Novas páginas das ações rápidas
import Reports from "./Reports/Reports";
import Analytics from "./Analytics/Analytics";
import TeamManagement from "./TeamManagement/TeamManagement";
import Scheduling from "./Scheduling/Scheduling";
import DataSync from "./DataSync/DataSync";
import BlingTest from "./BlingTest/BlingTest";

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
    // Novas rotas das ações rápidas
    if (path === "/app/reports") return "reports";
    if (path === "/app/analytics") return "analytics";
    if (path === "/app/team-management") return "team-management";
    if (path === "/app/scheduling") return "scheduling";
    if (path === "/app/data-sync") return "data-sync";
    if (path === "/app/bling-test") return "bling-test";

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
      // Novas rotas das ações rápidas
      "reports": "/app/reports",
      "analytics": "/app/analytics",
      "team-management": "/app/team-management",
      "scheduling": "/app/scheduling",
      "data-sync": "/app/data-sync",
      "bling-test": "/app/bling-test",
    };

    const route = routeMap[page] || "/app";
    navigate(route);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentPage={getCurrentPage()}
        onPageChange={handlePageChange}
        variant="default"
      />
      <div className="dashboard-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<OperatorSchedule />} />
          <Route path="productivity" element={<ProductivityPanel />} />
          <Route path="nonconformities" element={<NonConformities />} />
          <Route path="alerts" element={<AlertsPanel />} />
          <Route path="control" element={<ControlPanel />} />
          <Route path="priority-optimization" element={<PriorityOptimization />} />
          <Route path="operators-list" element={<OperatorSchedule />} />
          <Route path="bling-integration" element={<BlingIntegration />} />
          <Route path="operational-routes" element={<OperationalRoutes />} />
          <Route path="operational-routes-list" element={<OperationalRoutesList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user-creation" element={<UserCreation />} />
          <Route path="product-management" element={<ProductManagement />} />
          <Route path="admin-users" element={<Admin />} />
          {/* Novas rotas das ações rápidas */}
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="team-management" element={<TeamManagement />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="data-sync" element={<DataSync />} />
          <Route path="bling-test" element={<BlingTest />} />
        </Routes>
      </div>
    </div>
  );
}
