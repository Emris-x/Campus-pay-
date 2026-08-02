import { useEffect, useState } from "react";
import { fetchPaymentsSummary, normalizeError } from "../../admin/services/adminService";

const FEE_LABELS = {
  school_fee: "School fee",
  admission_fee: "Admission fee",
  course_registration: "Course registration",
};

export default function AdminPayments() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPaymentsSummary();
      setSummary(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load payment summaries."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Payments & Dues</p>
          <h1>Fee categories and payment activity</h1>
          <p className="cp-admin-page__sub">Review totals, pending work, and the current payment mix across campus fees.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading payment summaries…</div>
      ) : !summary ? (
        <div className="cp-card cp-admin-page__state">No payment data is currently available.</div>
      ) : (
        <>
          <section className="cp-admin-grid cp-admin-grid--stats">
            <article className="cp-card cp-admin-card">
              <p className="cp-admin-card__label">Total volume</p>
              <p className="cp-admin-card__value">₦{Number(summary.totalVolume || 0).toLocaleString("en-NG")}</p>
              <p className="cp-admin-card__hint">Across all recorded payment attempts</p>
            </article>
          </section>

          <div className="cp-card">
            <div className="cp-admin-page__section-head">
              <h2>Payment categories</h2>
            </div>
            <div className="cp-admin-table-wrap">
              <table className="cp-admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th>Total</th>
                    <th>Pending</th>
                    <th>Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summary.byType).map(([key, value]) => (
                    <tr key={key}>
                      <td>{FEE_LABELS[key] || key}</td>
                      <td>{value.count}</td>
                      <td>₦{Number(value.total || 0).toLocaleString("en-NG")}</td>
                      <td>{value.pending}</td>
                      <td>{value.verified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
