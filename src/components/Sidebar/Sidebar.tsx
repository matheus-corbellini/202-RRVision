"use client";

import { useState } from "react";
import {
	FaClipboardList,
	FaCalendarAlt,
	FaChartBar,
	FaExclamationTriangle,
	FaCog,
	FaSignOutAlt,
	FaChevronLeft,
	FaChevronRight,
	FaUsersCog,
	FaRoute,
	FaUserEdit,
	FaBox,
	FaFlask,
	FaChevronRight as FaChevronRightSmall,
} from "react-icons/fa";
import { useNavigation } from "../../hooks/useNavigation";
import { useAuth } from "../../hooks/useAuth";
import { path } from "../../routes/path";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./Sidebar.css";

interface SidebarProps {
	currentPage: string;
	onPageChange: (page: string) => void;
	variant?: "default" | "admin";
}

interface MenuItem {
	id: string;
	title: string;
	icon: React.ReactNode;
	description: string;
	badge: string | null;
	access: string[];
	subItems?: SubMenuItem[];
}

interface SubMenuItem {
	id: string;
	title: string;
	description?: string;
}

export default function Sidebar({
	currentPage,
	onPageChange,
	variant = "default",
}: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
	const authData = useAuth();
	const { user, logout } = authData;
	const { goTo } = useNavigation();

	// Debug: Log user data
	console.log("Sidebar Auth Data:", authData);
	console.log("Sidebar User Data:", {
		name: user?.name,
		email: user?.email,
		role: user?.role,
		id: user?.id,
	});
	console.log("Full user object in Sidebar:", user);
	console.log("User type:", typeof user);
	console.log("User is null?", user === null);
	console.log("User is undefined?", user === undefined);

	const baseMenuItems = [
		{
			id: "orders",
			title: "Dashboard",
			icon: <FaClipboardList />,
			description: "Visão Geral do Sistema",
			badge: null,
			access: ["admin"],
		},
		{
			id: "user-creation",
			title: "Usuário",
			icon: <FaUserEdit />,
			description: "Gerenciar Usuários",
			badge: null,
			access: ["admin"],
		},
		{
			id: "product-management",
			title: "Gerenciar Produtos",
			icon: <FaBox />,
			description: "Cadastro e Gestão de Produtos",
			badge: null,
			access: ["admin"],
		},
		{
			id: "operational-routes-list",
			title: "Lista de Roteiros",
			icon: <FaRoute />,
			description: "Visualizar Todos os Roteiros",
			badge: null,
			access: ["admin"],
		},
		{
			id: "schedule",
			title: "Agenda",
			icon: <FaCalendarAlt />,
			description: "Agenda do Operador",
			badge: null,
			access: ["admin", "operator"],
		},
		{
			id: "productivity",
			title: "Produtividade",
			icon: <FaChartBar />,
			description: "Painel de Produtividade",
			badge: null,
			access: ["admin"],
		},
		{
			id: "nonconformities",
			title: "Não Conformidades",
			icon: <FaExclamationTriangle />,
			description: "Controle de Qualidade",
			badge: "2",
			access: ["admin"],
		},
		// {
		// 	id: "alerts",
		// 	title: "Alertas",
		// 	icon: <FaExclamationCircle />,
		// 	description: "Alertas e Notificações",
		// 	badge: "5",
		// 	access: ["admin"],
		// },
		// {
		// 	id: "control",
		// 	title: "Painel de Controle",
		// 	icon: <FaCog />,
		// 	description: "Monitoramento do Sistema",
		// 	badge: null,
		// 	access: ["admin"],
		// },
		{
			id: "bling-test",
			title: "Teste Bling",
			icon: <FaFlask />,
			description: "Testar Integração Bling",
			badge: null,
			access: ["user", "admin"],
		},
		{
			id: "products",
			title: "Produtos",
			icon: <FaBox />,
			description: "Gestão de Produtos",
			badge: null,
			access: ["user", "admin"],
			subItems: [
				{ id: "accessory", title: "Accessory" },
				{ id: "aviation-plug", title: "Aviation plug" },
				{ id: "hvc", title: "HVC" },
				{ id: "connector", title: "Connector" },
				{ id: "fuse-relay-box", title: "Fuse and relay box" },
				{ id: "terminal", title: "Terminal" },
				{ id: "rubber-parts", title: "Rubber Parts" },
				{ id: "backshell", title: "Backshell" },
				{ id: "manifolds", title: "Manifolds" },
				{ id: "wire-harness", title: "Wire harness" },
				{ id: "pcb-connector", title: "PCB connector" },
			],
		},
		// {
		// 	id: "priority-optimization",
		// 	title: "Otimização",
		// 	icon: <FaSync />,
		// 	description: "Otimização de Prioridades",
		// 	badge: "1",
		// 	access: ["admin"],
		// },
		// {
		// 	id: "operator-registration",
		// 	title: "Cadastro de Operadores",
		// 	icon: <FaUserPlus />,
		// 	description: "Gestão de Operadores",
		// 	badge: null,
		// 	access: ["admin"],
		// },
		// {
		// 	id: "bling-integration",
		// 	title: "Integração Bling",
		// 	icon: <FaPlug />,
		// 	description: "API e Importação de Ordens",
		// 	badge: null,
		// 	access: ["admin"],
		// },
		{
			id: "operational-routes",
			title: "Roteiros Operacionais",
			icon: <FaRoute />,
			description: "Cadastro de Roteiros de Produção",
			badge: null,
			access: ["admin"],
		},
	];

	const adminOnlyItems: MenuItem[] = [
		{
			id: "admin-users",
			title: "Gerenciar Usuários",
			icon: <FaUsersCog />,
			description: "Administração do Sistema",
			badge: null,
			access: ["admin"],
		},
	];

	// Filtrar itens baseado no tipo de usuário
	const getFilteredMenuItems = () => {
		if (variant === "admin") {
			return adminOnlyItems;
		}

		// Se for operador, mostrar apenas Agenda
		if (user?.userType === "operator" || user?.role === "operator") {
			return baseMenuItems.filter(item => item.id === "schedule");
		}

		// Para outros usuários, filtrar baseado no role
		const userRole = user?.role || "user";
		const allItems = [...baseMenuItems, ...(userRole === "admin" ? adminOnlyItems : [])];

		return allItems.filter(item =>
			item.access.includes(userRole) ||
			item.access.includes("admin") ||
			userRole === "admin"
		);
	};

	const menuItems = getFilteredMenuItems();

	const handlePageChange = (page: string) => {
		// Se for uma página externa (admin), navega para ela
		if (page === "admin-users") {
			goTo(path.admin);
			return;
		}
		// Se for uma página interna, chama a função onPageChange
		onPageChange(page);
	};

	const handleProductCategoryNavigation = (categoryId: string) => {
		// Mapear IDs das categorias para as rotas específicas
		const categoryRoutes: { [key: string]: string } = {
			"accessory": path.productAccessory,
			"aviation-plug": path.productAviationPlug,
			"hvc": path.productHvc,
			"connector": path.productConnector,
			"fuse-relay-box": path.productFuseRelayBox,
			"terminal": path.productTerminal,
			"rubber-parts": path.productRubberParts,
			"backshell": path.productBackshell,
			"manifolds": path.productManifolds,
			"wire-harness": path.productWireHarness,
			"pcb-connector": path.productPcbConnector,
		};

		const route = categoryRoutes[categoryId];
		if (route) {
			goTo(route);
		} else {
			// Fallback para a página geral de produtos
			goTo(path.products);
		}
		setHoveredItem(null);
	};

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
								<div className="logo-title-section">
									<span className="logo-text">RR Vision</span>
									<span className="logo-subtitle">Brazil</span>
								</div>
								<NotificationBell />
							</>
						)}
					</div>
					<div className="sidebar-header-actions">
						<button
							className="sidebar-toggle"
							onClick={() => setIsCollapsed(!isCollapsed)}
							title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
						>
							{isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
						</button>
					</div>
				</div>

				{isCollapsed && (
					<div className="collapsed-notification-bell">
						<NotificationBell />
					</div>
				)}

				<nav className="sidebar-nav">
					<div className="nav-section">
						{menuItems.map((item) => (
							<div
								key={item.id}
								className="nav-item-wrapper"
								onMouseEnter={(e) => {
									setHoveredItem(item.id);
									if (item.subItems) {
										const rect = e.currentTarget.getBoundingClientRect();
										setDropdownPosition({
											top: rect.top - 120, // Posiciona 120px mais acima
											left: rect.right + 8
										});
									}
								}}
								onMouseLeave={() => setHoveredItem(null)}
							>
								<button
									className={`nav-item ${currentPage === item.id ? "nav-item-active" : ""
										}`}
									onClick={() => handlePageChange(item.id)}
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
											{item.subItems && (
												<span className="nav-chevron">
													<FaChevronRightSmall />
												</span>
											)}
										</>
									)}
								</button>

								{/* Dropdown menu */}
								{item.subItems && hoveredItem === item.id && !isCollapsed && (
									<div
										className="nav-dropdown"
										style={{
											top: `${dropdownPosition.top}px`,
											left: `${dropdownPosition.left}px`
										}}
									>
										<div className="dropdown-header">
											<span className="dropdown-title">Products</span>
										</div>
										<div className="dropdown-content">
											{item.subItems.map((subItem) => (
												<button
													key={subItem.id}
													className="dropdown-item"
													onClick={() => handleProductCategoryNavigation(subItem.id)}
												>
													{subItem.title}
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</nav>

				<div className="sidebar-footer">
					{variant !== "admin" && (
						<>
							<button
								className="footer-item"
								title="Configurações"
								onClick={() => onPageChange("settings")}
							>
								<span className="footer-icon">
									<FaCog />
								</span>
								{!isCollapsed && <span>Configurações</span>}
							</button>
						</>
					)}
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
