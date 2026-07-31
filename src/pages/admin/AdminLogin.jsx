import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "../AuthPages.css";

// Admins are just Supabase auth users flagged in an `is_admin` column,
// checked via a policy on the server side — the anon key alone should
// never be trusted to grant admin data access (see supabase/schema.sql
// notes on using a service-role key / edge function for admin reads).
export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/admin");
    } catch (err) {
      setError(err.message ?? "Couldn't sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-auth">
      <div className="cp-auth__card cp-card">
        <h1>Admin sign in</h1>
        <p className="cp-auth__sub">CampusPay staff access only.</p>
        {error && <div className="cp-alert cp-alert--error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="cp-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="cp-btn cp-btn--primary cp-btn--full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
