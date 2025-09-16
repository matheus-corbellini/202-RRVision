import LandingPage from "../pages/LandingPage/LandingPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import RecoveryPassword from "../pages/RecoveryPassword/RecoveryPassword";
import BlingCallback from "../pages/BlingCallback/BlingCallback";
import Layout from "../pages/Layout";
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { path } from "./path";
import { useAuth } from "../hooks/useAuth";

function RequireAuth({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();
	if (loading) return null;
	if (!user) return <Navigate to={path.login} replace />;
	return <>{children}</>;
}

export default function AppRoutes() {
	return (
		<Routes>
			{/* Rotas públicas - sem autenticação */}
			<Route path={path.landing} element={<LandingPage />} />
			<Route path={path.login} element={<Login />} />
			<Route path={path.register} element={<Register />} />
			<Route path={path.forgotPassword} element={<RecoveryPassword />} />
			<Route path="/bling/callback" element={<BlingCallback />} />

			{/* Rotas protegidas - com Layout e Sidebar */}
			<Route
				path="/app/*"
				element={
					<RequireAuth>
						<Layout />
					</RequireAuth>
				}
			/>

			{/* Redirecionamento padrão */}
			<Route path="*" element={<Navigate to={path.landing} replace />} />
		</Routes>
	);
}
