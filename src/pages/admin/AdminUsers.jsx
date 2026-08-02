import { useEffect, useState } from "react";
import { fetchUsers, normalizeError } from "../../admin/services/adminService";

const PAGE_SIZE = 8;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers(nextPage = page) {
    try {
      setLoading(true);
      setError("");
      const result = await fetchUsers({ search, page: nextPage, pageSize: PAGE_SIZE });
      setUsers(result.data);
      setCount(result.count);
      setPage(nextPage);
    } catch (err) {
      setError(normalizeError(err, "We could not load users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadUsers(1);
  }

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Users</p>
          <h1>Student accounts</h1>
          <p className="cp-admin-page__sub">Search and review campus users and their profile data.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      <form className="cp-admin-controls" onSubmit={handleSearchSubmit}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="cp-admin-controls__input"
          placeholder="Search by name, matric number, or faculty"
        />
        <button className="cp-btn cp-btn--ghost" type="submit">Search</button>
      </form>

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading student accounts…</div>
      ) : users.length === 0 ? (
        <div className="cp-card cp-admin-page__state">No users match the current search.</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-page__section-head">
            <h2>Accounts</h2>
            <p className="cp-admin-page__hint">Showing {users.length} of {count}</p>
          </div>
          <div className="cp-admin-table-wrap">
            <table className="cp-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Matric</th>
                  <th>Registration</th>
                  <th>Faculty</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.matric_number}</td>
                    <td>{user.registration_number}</td>
                    <td>{user.faculty || "—"}</td>
                    <td>{new Date(user.created_at).toLocaleDateString("en-NG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cp-admin-pagination">
            <button className="cp-btn cp-btn--ghost" disabled={page <= 1} onClick={() => loadUsers(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pageCount}
            </span>
            <button className="cp-btn cp-btn--ghost" disabled={page >= pageCount} onClick={() => loadUsers(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
