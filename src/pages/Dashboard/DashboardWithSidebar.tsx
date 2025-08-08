"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Dashboard from "./Dashboard";
import OperatorSchedule from "../OperatorSchedule/OperatorSchedule";
import ProductivityPanel from "../ProductivityPanel/ProductivityPanel";
import NonConformities from "../NonConformities/NonConformities";
import AlertsPanel from "../AlertsPanel/AlertsPanel";
import ControlPanel from "../ControlPanel/ControlPanel";
import PriorityOptimization from "../PriorityOptimization/PriorityOptimization";
import Settings from "../Settings/Settings";
import "./DashboardWithSidebar.css";
import { useNavigation } from "../../hooks/useNavigation";
import { path } from "../../routes/path";

export default function DashboardWithSidebar() {
  const [currentPage, setCurrentPage] = useState("orders");
  const { goTo } = useNavigation();

  const handlePageChange = (page: string) => {
    if (page === "admin-users") {
      goTo(path.admin);
      return;
    }
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
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
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
      <div className="dashboard-main">{renderCurrentPage()}</div>
    </div>
  );
}
