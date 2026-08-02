import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../pages/admin/AdminDashboard.css";

const navItems = [
  { label: "Overview", path: "/admin" },
  { label: "Users", path: "/admin/users" },
  { label: "Transactions", path: "/admin/transactions" },
  { label: "Payments & Dues", path: "/admin/payments" },
  { label: "Wallet", path: "/admin/wallet" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Notifications", path: "/admin/notifications" },
  { label: "Admins & Roles", path: "/admin/admins" },
  { label: "Audit Logs", path: "/admin/audit-logs" },
  { label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, adminProfile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  const identity = session?.user?.email || "Signed-in administrator";
  const roleLabel = adminProfile?.role?.replace(/_/g, " ") || "Pending access";

  return (
    <div className="cp-admin-shell">
      <aside className={`cp-admin-shell__sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="cp-admin-shell__brand">
          <div className="cp-admin-shell__brand-mark">CP</div>
          <div>
            <p className="cp-admin-shell__eyebrow">Campus Pay</p>
            <h2>Admin Command Center</h2>
          </div>
        </div>

        <nav className="cp-admin-shell__nav" aria-label="Admin sections">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: linkActive }) => `cp-admin-shell__nav-link ${linkActive ? "is-active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="cp-admin-shell__sidebar-footer">
          <p className="cp-admin-shell__eyebrow">Signed in as</p>
          <p className="cp-admin-shell__identity">{identity}</p>
          <p className="cp-admin-shell__role">{roleLabel}</p>
        </div>
      </aside>

      {mobileOpen ? <button className="cp-admin-shell__backdrop" onClick={() => setMobileOpen(false)} aria-label="Close menu" /> : null}

      <div className="cp-admin-shell__main">
        <header className="cp-admin-shell__topbar">
          <button className="cp-admin-shell__menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            ☰
          </button>
          <div>
            <p className="cp-admin-shell__eyebrow">Operations</p>
            <h1>Campus Pay Administration</h1>
          </div>
          <div className="cp-admin-shell__topbar-actions">
            <span className="cp-admin-shell__status-pill">Secure access</span>
            <button className="cp-btn cp-btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="cp-admin-shell__content">{children}</main>
      </div>
    </div>
  );
}
