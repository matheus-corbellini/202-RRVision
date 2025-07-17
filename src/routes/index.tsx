import LandingPage from "../pages/LandingPage/LandingPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import DashboardWithSidebar from "../pages/Dashboard/DashboardWithSidebar";
import { Routes, Route } from "react-router-dom";
import { path } from "./path";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={path.landing} element={<LandingPage />} />
      <Route path={path.login} element={<Login />} />
      <Route path={path.register} element={<Register />} />
      <Route path={path.dashboard} element={<DashboardWithSidebar />} />
    </Routes>
  );
}
