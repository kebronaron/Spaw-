import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./Component/Login.tsx";
import Register from "./Component/Register.tsx";
import Dashboard from "./Component/Dashboard.tsx";
import SpawHome from "./Component/SpawHome.tsx";
import ForgotPassword from "./Component/ForgotPassword.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  {/* Home */}
  <Route path="/" element={<SpawHome />} />

        {/* Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* (Optional) catch-all -> /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
