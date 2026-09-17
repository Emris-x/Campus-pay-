import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AdminFaculties() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    account_number: "",
    bank_name: "",
  });

  async function loadFaculties() {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("faculties")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;

      setFaculties(data || []);
    } catch (err) {
      setError(err.message || "Unable to load faculty accounts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFaculties();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const accountNumber = form.account_number.trim();
    const bankName = form.bank_name.trim();

    if (!name || !accountNumber || !bankName) {
      setError("Please fill in all faculty account fields.");
      return;
    }

    if (!/^\d{10,}$/.test(accountNumber)) {
      setError("Enter a valid bank account number.");
      return;
    }

    try {
      setSaving(true);

      
const { error: insertError } = await supabase.rpc(
  "admin_create_faculty",
  {
    p_name: name,
    p_account_number: accountNumber,
    p_bank_name: bankName,
  }
);
      if (insertError) throw insertError;

      setForm({
        name: "",
        account_number: "",
        bank_name: "",
      });

      setSuccess("Faculty account added successfully.");
      await loadFaculties();
    } catch (err) {
      setError(err.message || "Unable to add faculty account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cp-admin-page">
      <div className="cp-admin-page__header">
        <div>
          <p className="cp-admin-page__eyebrow">Faculty Accounts</p>
          <h1>Official Faculty Accounts</h1>
          <p className="cp-admin-page__sub">
            Manage the official bank accounts students will use for faculty
            payments.
          </p>
        </div>
      </div>

      {error ? <div className="cp-alert cp-alert--error">{error}</div> : null}

      {success ? (
        <div className="cp-alert cp-alert--success">{success}</div>
      ) : null}

      <section className="cp-card">
        <div className="cp-admin-page__section-head">
          <div>
            <h2>Add Faculty Account</h2>
            <p>
              Enter the official account details supplied by the school.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cp-admin-grid">
            <div>
              <label htmlFor="faculty-name">Faculty / Department</label>
              <input
                id="faculty-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Computer Engineering"
                className="cp-input"
              />
            </div>

            <div>
              <label htmlFor="bank-name">Bank</label>
              <input
                id="bank-name"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                placeholder="e.g. UNICAL Microfinance Bank"
                className="cp-input"
              />
            </div>

            <div>
              <label htmlFor="account-number">Official Account Number</label>
              <input
                id="account-number"
                name="account_number"
                value={form.account_number}
                onChange={handleChange}
                placeholder="Enter account number"
                inputMode="numeric"
                maxLength={10}
                className="cp-input"
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="submit"
              className="cp-btn cp-btn--primary"
              disabled={saving}
            >
              {saving ? "Saving…" : "Add Faculty Account"}
            </button>
          </div>
        </form>
      </section>

      <section className="cp-card" style={{ marginTop: "24px" }}>
        <div className="cp-admin-page__section-head">
          <div>
            <h2>Faculty Directory</h2>
            <p>Official accounts currently stored in Campus Pay.</p>
          </div>
        </div>

        {loading ? (
          <div className="cp-admin-page__state">
            Loading faculty accounts…
          </div>
        ) : faculties.length === 0 ? (
          <div className="cp-admin-page__state">
            No faculty accounts have been added yet.
          </div>
        ) : (
          <div className="cp-admin-table-wrap">
            <table className="cp-admin-table">
              <thead>
                <tr>
                  <th>Faculty / Department</th>
                  <th>Bank</th>
                  <th>Account Number</th>
                </tr>
              </thead>

              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>{faculty.name}</td>
                    <td>{faculty.bank_name || "—"}</td>
                    <td>{faculty.account_number || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
