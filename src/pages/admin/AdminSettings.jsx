import { useEffect, useState } from "react";
import { fetchSettings, normalizeError } from "../../admin/services/adminService";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchSettings();
      setSettings(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load system settings."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Settings</p>
          <h1>System configuration</h1>
          <p className="cp-admin-page__sub">A secure settings surface for maintenance, notifications, and platform preferences.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading settings…</div>
      ) : settings?.unavailable ? (
        <div className="cp-card cp-admin-page__state">{settings.message}</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-list">
            {(settings?.rows ?? []).map((setting) => (
              <div className="cp-admin-list__item" key={setting.id}>
                <div>
                  <p className="cp-admin-list__title">{setting.key}</p>
                  <p className="cp-admin-list__meta">{JSON.stringify(setting.value)}</p>
                </div>
                <span className="cp-admin-list__amount">{new Date(setting.updated_at).toLocaleDateString("en-NG")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
