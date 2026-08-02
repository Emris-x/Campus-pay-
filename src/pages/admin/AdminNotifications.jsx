import { useEffect, useState } from "react";
import { fetchNotifications, normalizeError } from "../../admin/services/adminService";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(normalizeError(err, "We could not load notifications."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Notifications</p>
          <h1>Announcements and delivery workflows</h1>
          <p className="cp-admin-page__sub">This module is ready for a real notification system and currently reflects the database state clearly.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading notifications…</div>
      ) : notifications?.unavailable ? (
        <div className="cp-card cp-admin-page__state">{notifications.message}</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-list">
            {(notifications?.rows ?? []).map((notification) => (
              <div className="cp-admin-list__item" key={notification.id}>
                <div>
                  <p className="cp-admin-list__title">{notification.title}</p>
                  <p className="cp-admin-list__meta">{notification.body}</p>
                </div>
                <span className="cp-pill cp-pill--pending">{notification.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
