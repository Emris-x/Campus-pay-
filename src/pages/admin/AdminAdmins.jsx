import { useEffect, useState } from "react";
import { fetchAdmins, normalizeError } from "../../admin/services/adminService";

export default function AdminAdmins() {
  const [admins, setAdmins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load admin records."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Admins & Roles</p>
          <h1>Administrative access</h1>
          <p className="cp-admin-page__sub">Review role-based access and admin account status without exposing auth secrets.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading admin directory…</div>
      ) : admins?.unavailable ? (
        <div className="cp-card cp-admin-page__state">{admins.message}</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-list">
            {(admins?.rows ?? []).map((admin) => (
              <div className="cp-admin-list__item" key={admin.id}>
                <div>
                  <p className="cp-admin-list__title">{admin.role}</p>
                  <p className="cp-admin-list__meta">{admin.status}</p>
                </div>
                <div className="cp-admin-list__right">
                  <span className="cp-pill cp-pill--verified">{admin.status}</span>
                  <span className="cp-admin-list__amount">{new Date(admin.created_at).toLocaleDateString("en-NG")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
