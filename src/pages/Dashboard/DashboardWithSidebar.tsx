"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Dashboard from "../../components/DashboardComponents/Dashboard";
import OperatorSchedule from "../OperatorSchedule/OperatorSchedule";
import ProductivityPanel from "../ProductivityPanel/ProductivityPanel";
import NonConformities from "../NonConformities/NonConformities";
import AlertsPanel from "../AlertsPanel/AlertsPanel";
import ControlPanel from "../ControlPanel/ControlPanel";
import PriorityOptimization from "../PriorityOptimization/PriorityOptimization";
import OperatorRegistration from "../OperatorRegistration/OperatorRegistration";
import OperatorsList from "../OperatorsList/OperatorsList";
import BlingIntegration from "../BlingIntegration/BlingIntegration";
import Settings from "../Settings/Settings";
import "./DashboardWithSidebar.css";

export default function DashboardWithSidebar() {
	const [currentPage, setCurrentPage] = useState("orders");

	const handlePageChange = (page: string) => {
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
			case "operator-registration":
				return <OperatorRegistration />;
			case "operators-list":
				return <OperatorsList />;
			case "bling-integration":
				return <BlingIntegration />;
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
