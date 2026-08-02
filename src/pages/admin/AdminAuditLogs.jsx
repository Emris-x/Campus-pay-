import { useEffect, useState } from "react";
import { fetchAuditLogs, normalizeError } from "../../admin/services/adminService";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAuditLogs();
      setLogs(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load audit logs."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Audit Logs</p>
          <h1>Administrative activity trail</h1>
          <p className="cp-admin-page__sub">Track privileged actions and prepare the platform for a fully audited operations workflow.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading audit trail…</div>
      ) : logs?.unavailable ? (
        <div className="cp-card cp-admin-page__state">{logs.message}</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-list">
            {(logs?.rows ?? []).map((log) => (
              <div className="cp-admin-list__item" key={log.id}>
                <div>
                  <p className="cp-admin-list__title">{log.action}</p>
                  <p className="cp-admin-list__meta">{log.entity_type} • {log.entity_id || "n/a"}</p>
                </div>
                <span className="cp-admin-list__amount">{new Date(log.created_at).toLocaleString("en-NG")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
