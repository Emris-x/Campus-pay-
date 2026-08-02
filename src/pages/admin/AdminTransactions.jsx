import { useEffect, useMemo, useState } from "react";
import { fetchTransactions, normalizeError, verifyTransaction } from "../../admin/services/adminService";

const PAGE_SIZE = 10;
const FEE_LABELS = {
  school_fee: "School fee",
  admission_fee: "Admission fee",
  course_registration: "Course registration",
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [feeType, setFeeType] = useState("all");
  const [faculty, setFaculty] = useState("all");
  const [busyId, setBusyId] = useState("");

  const facultyOptions = useMemo(() => {
    return Array.from(new Set(transactions.map((row) => row.faculty_name).filter(Boolean))).sort();
  }, [transactions]);

  async function loadTransactions(nextPage = page) {
    try {
      setLoading(true);
      setError("");
      const result = await fetchTransactions({ search, status, feeType, faculty, page: nextPage, pageSize: PAGE_SIZE });
      setTransactions(result.data);
      setCount(result.count);
      setPage(nextPage);
    } catch (err) {
      setError(normalizeError(err, "We could not load transactions."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  async function handleVerify(transactionId) {
    try {
      setBusyId(transactionId);
      await verifyTransaction(transactionId);
      await loadTransactions(page);
    } catch (err) {
      setError(normalizeError(err, "We could not verify that transaction."));
    } finally {
      setBusyId("");
    }
  }

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function handleFilterSubmit(e) {
    e.preventDefault();
    loadTransactions(1);
  }

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Transactions</p>
          <h1>Payment review queue</h1>
          <p className="cp-admin-page__sub">Filter, verify, and inspect payment activity across the platform.</p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      <form className="cp-admin-controls cp-admin-controls--grid" onSubmit={handleFilterSubmit}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="cp-admin-controls__input" placeholder="Search by receipt or matric" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="cp-admin-controls__input">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="verified">Verified</option>
          <option value="failed">Failed</option>
        </select>
        <select value={feeType} onChange={(e) => setFeeType(e.target.value)} className="cp-admin-controls__input">
          <option value="all">All fees</option>
          <option value="school_fee">School fee</option>
          <option value="admission_fee">Admission fee</option>
          <option value="course_registration">Course registration</option>
        </select>
        <select value={faculty} onChange={(e) => setFaculty(e.target.value)} className="cp-admin-controls__input">
          <option value="all">All faculties</option>
          {facultyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button className="cp-btn cp-btn--ghost" type="submit">Apply</button>
      </form>

      {loading ? (
        <div className="cp-card cp-admin-page__state">Loading transactions…</div>
      ) : transactions.length === 0 ? (
        <div className="cp-card cp-admin-page__state">No transactions match the filters.</div>
      ) : (
        <div className="cp-card">
          <div className="cp-admin-page__section-head">
            <h2>Transactions</h2>
            <p className="cp-admin-page__hint">{count} total</p>
          </div>
          <div className="cp-admin-table-wrap">
            <table className="cp-admin-table">
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Student</th>
                  <th>Fee</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Faculty</th>
                  <th>Verified</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.receipt_number}</td>
                    <td>{transaction.students?.full_name || transaction.matric_number}</td>
                    <td>{FEE_LABELS[transaction.fee_type] || transaction.fee_type}</td>
                    <td>₦{Number(transaction.amount || 0).toLocaleString("en-NG")}</td>
                    <td><span className={`cp-pill cp-pill--${transaction.status}`}>{transaction.status}</span></td>
                    <td>{transaction.faculty_name || "—"}</td>
                    <td>{transaction.verified_at ? new Date(transaction.verified_at).toLocaleDateString("en-NG") : "—"}</td>
                    <td>
                      {transaction.status !== "verified" ? (
                        <button className="cp-btn cp-btn--ghost" onClick={() => handleVerify(transaction.id)} disabled={busyId === transaction.id}>
                          {busyId === transaction.id ? "Working…" : "Verify"}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cp-admin-pagination">
            <button className="cp-btn cp-btn--ghost" disabled={page <= 1} onClick={() => loadTransactions(page - 1)}>
              Previous
            </button>
            <span>Page {page} of {pageCount}</span>
            <button className="cp-btn cp-btn--ghost" disabled={page >= pageCount} onClick={() => loadTransactions(page + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
