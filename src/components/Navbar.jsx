import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <header className="cp-navbar">
      <div className="cp-container cp-navbar__inner">
        <Link to="/" className="cp-navbar__brand">
          <img src="/logo.png" alt="" className="cp-navbar__logo" />
          <span>CampusPay</span>
        </Link>

        {session ? (
          <nav className="cp-navbar__actions">
            <span className="cp-navbar__hello">Hey, {profile?.full_name?.split(" ")[0] ?? "there"}</span>
            <button className="cp-btn cp-btn--ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </nav>
        ) : (
          <nav className="cp-navbar__actions">
            <Link to="/login" className="cp-btn cp-btn--ghost">
              Log in
            </Link>
            <Link to="/signup" className="cp-btn cp-btn--primary">
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
