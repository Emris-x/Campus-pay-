import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function Login() {
  const { signInWithMatric } = useAuth();
  const navigate = useNavigate();
  const [matric, setMatric] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithMatric(matric.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-auth">
      <div className="cp-auth__card cp-card">
        <div className="cp-pillars" style={{ marginBottom: 20 }}>
          <span></span><span></span><span></span>
        </div>
        <h1>Welcome back</h1>
        <p className="cp-auth__sub">Log in with your matric number to see your fees.</p>

        {error && <div className="cp-alert cp-alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label htmlFor="matric">Matric number</label>
            <input
              id="matric"
              type="text"
              placeholder="e.g. 21/CPE/0142"
              value={matric}
              onChange={(e) => setMatric(e.target.value)}
              required
            />
          </div>
          <div className="cp-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="cp-btn cp-btn--primary cp-btn--full" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="cp-auth__foot">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
