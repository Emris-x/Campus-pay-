import { Routes, Route } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
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
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </AuthProvider>
  );
}
