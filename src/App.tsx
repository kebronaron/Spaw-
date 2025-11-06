import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./Component/Login";
import Register from "./Component/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect base "/" to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* (Optional) catch-all -> /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
