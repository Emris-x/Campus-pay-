import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import "./AdminDashboard.css";

const FEE_LABELS = {
  school_fee: "School fee",
  admission_fee: "Admission fee",
  course_registration: "Course registration",
};

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*, students(full_name)")
      .order("created_at", { ascending: false });
    setTransactions(data ?? []);
    setLoading(false);
  }

  async function markVerified(id) {
    await supabase
      .from("transactions")
      .update({ status: "verified", verified_at: new Date().toISOString() })
      .eq("id", id);
    loadTransactions();
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.matric_number?.toLowerCase().includes(q) ||
        t.receipt_number?.toLowerCase().includes(q) ||
        t.faculty_name?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [transactions, query, statusFilter]);

  const totals = useMemo(() => {
    const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
    const pending = transactions.filter((t) => t.status === "pending").length;
    const verified = transactions.filter((t) => t.status === "verified").length;
    return { total, pending, verified };
  }, [transactions]);

  return (
    <div className="cp-container cp-admin">
      <h1>Admin dashboard</h1>
      <p className="cp-admin__sub">All transactions flowing through CampusPay, at a glance.</p>

      <section className="cp-admin__stats">
        <div className="cp-card cp-stat">
          <span className="cp-stat__label">Total volume</span>
          <span className="cp-stat__value">₦{totals.total.toLocaleString("en-NG")}</span>
        </div>
        <div className="cp-card cp-stat">
          <span className="cp-stat__label">Pending</span>
          <span className="cp-stat__value">{totals.pending}</span>
        </div>
        <div className="cp-card cp-stat">
          <span className="cp-stat__label">Verified</span>
          <span className="cp-stat__value">{totals.verified}</span>
        </div>
      </section>

      <div className="cp-admin__controls">
        <input
          type="text"
          placeholder="Search by matric no, receipt no, or faculty…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="cp-admin__search"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cp-admin__filter">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="cp-card cp-admin__table-wrap">
        {loading ? (
          <p className="cp-admin__empty">Loading transactions…</p>
        ) : filtered.length === 0 ? (
          <p className="cp-admin__empty">No transactions match that search.</p>
        ) : (
          <table className="cp-admin__table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Matric No.</th>
                <th>Fee</th>
                <th>Faculty</th>
                <th>Amount</th>
                <th>Receipt</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{t.students?.full_name ?? "—"}</td>
                  <td className="cp-mono">{t.matric_number}</td>
                  <td>{FEE_LABELS[t.fee_type] ?? t.fee_type}</td>
                  <td>{t.faculty_name ?? "—"}</td>
                  <td className="cp-mono">₦{Number(t.amount).toLocaleString("en-NG")}</td>
                  <td className="cp-mono">{t.receipt_number}</td>
                  <td><span className={`cp-pill cp-pill--${t.status}`}>{t.status}</span></td>
                  <td>
                    {t.status !== "verified" && (
                      <button className="cp-btn cp-btn--ghost" onClick={() => markVerified(t.id)}>
                        Mark verified
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
