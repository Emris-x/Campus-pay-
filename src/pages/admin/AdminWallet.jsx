import { useEffect, useState } from "react";
import { fetchWalletSummary, normalizeError } from "../../admin/services/adminService";

export default function AdminWallet() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchWalletSummary();
      setSummary(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load wallet data."));
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
          <p className="cp-admin-page__eyebrow">Wallet</p>
          <h1>Financial control</h1>
          <p className="cp-admin-page__sub">The existing project does not yet expose a real wallet ledger, so this module surfaces that state clearly and is ready for a secure ledger migration.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Preparing wallet view…</div>
      ) : summary?.unavailable ? (
        <div className="cp-card cp-admin-page__state">{summary.message}</div>
      ) : (
        <div className="cp-card">
          <p className="cp-admin-page__sub">Wallet ledger entries will appear here once the supporting migration is applied.</p>
          {summary?.rows?.length ? (
            <div className="cp-admin-list">
              {summary.rows.map((row) => (
                <div className="cp-admin-list__item" key={row.id}>
                  <div>
                    <p className="cp-admin-list__title">{row.entry_type}</p>
                    <p className="cp-admin-list__meta">{new Date(row.created_at).toLocaleString("en-NG")}</p>
                  </div>
                  <div className="cp-admin-list__right">
                    <span className="cp-admin-list__amount">₦{Number(row.amount || 0).toLocaleString("en-NG")}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
