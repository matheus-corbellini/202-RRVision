import LandingPage from "../pages/LandingPage/LandingPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import RecoveryPassword from "../pages/RecoveryPassword/RecoveryPassword";
import DashboardWithSidebar from "../pages/Dashboard/DashboardWithSidebar";
import PriorityOptimization from "../pages/PriorityOptimization/PriorityOptimization";
import Settings from "../pages/Settings/Settings";
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { path } from "./path";
import { useAuth } from "../hooks/useAuth";
import Admin from "../pages/Admin/Admin";

function RequireAuth({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to={path.login} replace />;
	return <>{children}</>;
}

function RequireAdmin({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to={path.login} replace />;
	if (user.role !== "admin") return <Navigate to={path.dashboard} replace />;
	return <>{children}</>;
}

export default function AppRoutes() {
	return (
		<Routes>
			<Route path={path.landing} element={<LandingPage />} />
			<Route path={path.login} element={<Login />} />
			<Route path={path.register} element={<Register />} />
			<Route path={path.forgotPassword} element={<RecoveryPassword />} />

			<Route
				path={path.dashboard}
				element={
					<RequireAuth>
						<DashboardWithSidebar />
					</RequireAuth>
				}
			/>
			<Route
				path={path.admin}
				element={
					<RequireAdmin>
						<Admin />
					</RequireAdmin>
				}
			/>
			<Route
				path={path.priorityOptimization}
				element={
					<RequireAuth>
						<PriorityOptimization />
					</RequireAuth>
				}
			/>
			<Route
				path={path.settings}
				element={
					<RequireAuth>
						<Settings />
					</RequireAuth>
				}
			/>
		</Routes>
	);
}
