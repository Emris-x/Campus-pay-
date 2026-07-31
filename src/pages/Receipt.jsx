import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./PaymentPages.css";
import "./Receipt.css";

export default function Receipt() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => setTransaction(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="cp-container cp-payment-page">Loading your receipt…</div>;
  }

  if (!transaction) {
    return (
      <div className="cp-container cp-payment-page">
        <p>We couldn't find that receipt.</p>
        <Link to="/dashboard" className="cp-btn cp-btn--ghost">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="cp-container cp-payment-page">
      <Link to="/dashboard" className="cp-payment-page__back">← Back to dashboard</Link>
      <div className="cp-card cp-receipt">
        <div className="cp-receipt__header">
          <img src="/logo.png" alt="" className="cp-receipt__logo" />
          <span className={`cp-pill cp-pill--${transaction.status}`}>{transaction.status}</span>
        </div>

        <h1>Payment receipt</h1>
        <p className="cp-receipt__number">{transaction.receipt_number}</p>

        <div className="cp-receipt__rows">
          <Row label="Fee type" value="Course registration" />
          <Row label="Full name" value={transaction.matric_number ? undefined : "—"} hide />
          <Row label="Matric number" value={transaction.matric_number} />
          <Row label="Registration number" value={transaction.registration_number} />
          <Row label="Faculty account" value={transaction.faculty_account_number} />
          {transaction.faculty_name && <Row label="Faculty" value={transaction.faculty_name} />}
          <Row label="Amount" value={`₦${Number(transaction.amount).toLocaleString("en-NG")}`} />
          <Row label="Date" value={new Date(transaction.created_at).toLocaleString("en-NG")} />
        </div>

        <div className="cp-alert cp-alert--success" style={{ marginTop: 20 }}>
          Take this receipt — along with your bank payment confirmation — to your faculty office for stamping and
          verification.
        </div>

        <button className="cp-btn cp-btn--ghost cp-btn--full" onClick={() => window.print()} style={{ marginTop: 12 }}>
          Print / save as PDF
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, hide }) {
  if (hide) return null;
  return (
    <div className="cp-receipt__row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
