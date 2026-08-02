import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import RedirectPayment from "./pages/RedirectPayment";
import CourseRegistrationPayment from "./pages/CourseRegistrationPayment";
import Receipt from "./pages/Receipt";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRoutes from "./pages/admin/AdminRoutes";

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay/course-registration"
          element={
            <ProtectedRoute>
              <CourseRegistrationPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pay/:type"
          element={
            <ProtectedRoute>
              <RedirectPayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipt/:id"
          element={
            <ProtectedRoute>
              <Receipt />
            </ProtectedRoute>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/log" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
