import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AuthPages.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage(
      "If an account exists with that email, a password reset link has been sent."
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot Password?</h1>

        <p>
          Enter the email address connected to your Campus Pay account.
        </p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}

        {error && <p className="error-message">{error}</p>}

        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
}
