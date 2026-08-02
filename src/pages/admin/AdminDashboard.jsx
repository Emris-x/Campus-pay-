import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAdminOverview, normalizeError } from "../../admin/services/adminService";
import "./AdminDashboard.css";

const FEE_LABELS = {
  school_fee: "School fee",
  admission_fee: "Admission fee",
  course_registration: "Course registration",
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOverview() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminOverview();
      setOverview(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load the overview metrics."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOverview();
  }, []);

  const summaryCards = useMemo(() => {
    if (!overview) return [];

    return [
      { label: "Students", value: overview.studentCount.toLocaleString("en-NG"), hint: "Registered accounts" },
      { label: "Transactions", value: overview.transactionCount.toLocaleString("en-NG"), hint: "Recorded attempts" },
      { label: "Volume", value: `₦${Number(overview.totalVolume || 0).toLocaleString("en-NG")}`, hint: "Total payment value" },
      { label: "Pending", value: overview.pendingCount.toLocaleString("en-NG"), hint: "Awaiting review" },
      { label: "Verified", value: overview.verifiedCount.toLocaleString("en-NG"), hint: "Approved payments" },
      { label: "Failed", value: overview.failedCount.toLocaleString("en-NG"), hint: "Needs follow-up" },
    ];
  }, [overview]);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Overview</p>
          <h1>Campus Pay Command Center</h1>
          <p className="cp-admin-page__sub">Monitor student activity, payment flow, and administration health from a single secure surface.</p>
        </div>
        <button className="cp-btn cp-btn--primary" onClick={loadOverview} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading dashboard metrics…</div>
      ) : overview ? (
        <>
          <section className="cp-admin-grid cp-admin-grid--stats">
            {summaryCards.map((card) => (
              <article className="cp-card cp-admin-card" key={card.label}>
                <p className="cp-admin-card__label">{card.label}</p>
                <p className="cp-admin-card__value">{card.value}</p>
                <p className="cp-admin-card__hint">{card.hint}</p>
              </article>
            ))}
          </section>

          <section className="cp-admin-grid cp-admin-grid--two">
            <div className="cp-card">
              <div className="cp-admin-page__section-head">
                <h2>Recent transactions</h2>
                <Link to="/admin/transactions" className="cp-admin-page__link">View all</Link>
              </div>

              {overview.recentTransactions.length === 0 ? (
                <p className="cp-admin-page__empty">No transactions have been recorded yet.</p>
              ) : (
                <div className="cp-admin-list">
                  {overview.recentTransactions.map((transaction) => (
                    <div className="cp-admin-list__item" key={transaction.id}>
                      <div>
                        <p className="cp-admin-list__title">{transaction.students?.full_name || transaction.matric_number || "Student"}</p>
                        <p className="cp-admin-list__meta">
                          {transaction.receipt_number} • {FEE_LABELS[transaction.fee_type] || transaction.fee_type}
                        </p>
                      </div>
                      <div className="cp-admin-list__right">
                        <span className={`cp-pill cp-pill--${transaction.status}`}>{transaction.status}</span>
                        <span className="cp-admin-list__amount">₦{Number(transaction.amount || 0).toLocaleString("en-NG")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cp-card">
              <div className="cp-admin-page__section-head">
                <h2>Operations</h2>
              </div>
              <div className="cp-admin-stack">
                <Link className="cp-admin-stack__item" to="/admin/users">
                  <span>Users</span>
                  <strong>Review student accounts</strong>
                </Link>
                <Link className="cp-admin-stack__item" to="/admin/payments">
                  <span>Payments & Dues</span>
                  <strong>Track fee categories and totals</strong>
                </Link>
                <Link className="cp-admin-stack__item" to="/admin/audit-logs">
                  <span>Audit Logs</span>
                  <strong>Inspect admin activity</strong>
                </Link>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
