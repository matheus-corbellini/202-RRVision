"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
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
import OperationalRoutes from "../OperationalRoutes/OperationalRoutes";
import OperationalRoutesList from "../OperationalRoutesList/OperationalRoutesList";
import Settings from "../Settings/Settings";
import UserCreation from "../UserCreation/UserCreation";
import ProductManagement from "../ProductManagement/ProductManagement";
import "./DashboardWithSidebar.css";

export default function DashboardWithSidebar() {
	const { user } = useAuth();
	
	// Determinar a página padrão baseada no tipo de usuário
	const getDefaultPage = () => {
		if (user?.userType === "operator") {
			return "schedule"; // Operadores vão direto para agenda
		}
		return "orders"; // Outros usuários vão para dashboard
	};
	
	const [currentPage, setCurrentPage] = useState(getDefaultPage());

	// Atualizar a página padrão quando o usuário for carregado
	useEffect(() => {
		if (user) {
			const defaultPage = getDefaultPage();
			if (currentPage !== defaultPage) {
				setCurrentPage(defaultPage);
			}
		}
	}, [user]);

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
			// case "operator-registration":
			// 	return <OperatorRegistration />;
			case "operators-list":
				return <OperatorsList />;
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
