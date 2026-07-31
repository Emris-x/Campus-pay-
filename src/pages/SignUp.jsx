import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AuthPages.css";

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    matricNumber: "",
    registrationNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Your password needs to be at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      await signUp(form);
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
        <h1>Create your account</h1>
        <p className="cp-auth__sub">Takes less than a minute. No queue involved.</p>

        {error && <div className="cp-alert cp-alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" type="text" placeholder="As it appears on your school ID" value={form.fullName} onChange={update("fullName")} required />
          </div>
          <div className="cp-field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={update("email")} required />
          </div>
          <div className="cp-field">
            <label htmlFor="matricNumber">Matric number</label>
            <input id="matricNumber" type="text" placeholder="e.g. 21/CPE/0142" value={form.matricNumber} onChange={update("matricNumber")} required />
          </div>
          <div className="cp-field">
            <label htmlFor="registrationNumber">Registration number</label>
            <input id="registrationNumber" type="text" placeholder="Your reg. number" value={form.registrationNumber} onChange={update("registrationNumber")} required />
          </div>
          <div className="cp-field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} required />
            <span className="cp-field-hint">You'll use this with your matric number to log in.</span>
          </div>
          <button type="submit" className="cp-btn cp-btn--primary cp-btn--full" disabled={busy}>
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="cp-auth__foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
