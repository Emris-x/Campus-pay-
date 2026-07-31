import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="cp-container" style={{ padding: "80px 24px", textAlign: "center", color: "var(--cp-text-dim)" }}>Loading…</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
