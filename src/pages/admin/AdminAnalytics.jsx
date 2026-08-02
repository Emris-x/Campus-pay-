import { useEffect, useState } from "react";
import { fetchAnalytics, normalizeError } from "../../admin/services/adminService";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load analytics data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Analytics</p>
          <h1>Transaction and payment insights</h1>
          <p className="cp-admin-page__sub">Real data derived from the current transaction table, with room for richer reporting later.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading analytics…</div>
      ) : !analytics ? (
        <div className="cp-card cp-admin-page__state">No analytics are available right now.</div>
      ) : (
        <div className="cp-admin-grid cp-admin-grid--two">
          <div className="cp-card">
            <h2>Status distribution</h2>
            <div className="cp-admin-list">
              {Object.entries(analytics.statusDistribution).map(([key, value]) => (
                <div className="cp-admin-list__item" key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
          <div className="cp-card">
            <h2>Fee mix</h2>
            <div className="cp-admin-list">
              {Object.entries(analytics.feeDistribution).map(([key, value]) => (
                <div className="cp-admin-list__item" key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
