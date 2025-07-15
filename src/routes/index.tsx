import LandingPage from "../pages/LandingPage/LandingPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import About from "../components/About/About";
import Contact from "../components/Contact/Contact";
import Features from "../components/Features/Features";
import { Routes, Route } from "react-router-dom";
import { path } from "./path";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={path.landing} element={<LandingPage />} />
      <Route path={path.login} element={<Login />} />
      <Route path={path.register} element={<Register />} />
      <Route path={path.about} element={<About />} />
      <Route path={path.contact} element={<Contact />} />
      <Route path={path.resources} element={<Features />} />
    </Routes>
  );
}
