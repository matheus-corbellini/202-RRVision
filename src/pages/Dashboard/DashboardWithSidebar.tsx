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
import "./DashboardWithSidebar.css";

export default function DashboardWithSidebar() {
  const [currentPage, setCurrentPage] = useState("orders");

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="dashboard-main">{renderCurrentPage()}</div>
    </div>
  );
}
