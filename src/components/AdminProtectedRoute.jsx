import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminProtectedRoute({ children }) {
  const { session, loading, adminProfile, adminLoading, isAdmin } = useAuth();

  if (loading || adminLoading) {
    return (
      <div className="cp-container" style={{ padding: "80px 24px", textAlign: "center", color: "var(--cp-text-dim)" }}>
        Verifying administrator access…
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin || !adminProfile || adminProfile.status !== "active") {
    return (
      <div className="cp-container" style={{ padding: "80px 24px" }}>
        <div className="cp-card" style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h1>Access restricted</h1>
          <p style={{ marginTop: "10px", color: "var(--cp-text-dim)" }}>
            Your account is signed in, but it is not currently authorized for the Campus Pay admin command center.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
