import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTransaction, fetchFaculties } from "../lib/payments";
import "./PaymentPages.css";

export default function CourseRegistrationPayment() {
  const { profile, session } = useAuth();
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [facultyAccountNumber, setFacultyAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchFaculties()
      .then(setFaculties)
      .catch(() => setFaculties([])); // table may be empty until the bursary list is loaded
  }, []);

  // As the student types an account number, surface faculties whose
  // account number matches or is close — this is the "did you mean...?"
  // safety net for mistyped digits, once the faculty list is populated.
  const suggestions =
    facultyAccountNumber.length >= 4
      ? faculties.filter((f) => f.account_number.includes(facultyAccountNumber))
      : [];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!facultyAccountNumber.trim()) {
      setError("Enter the faculty account number your course rep gave you.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setBusy(true);
    try {
      const matchedFaculty = faculties.find((f) => f.account_number === facultyAccountNumber.trim());
      const txn = await createTransaction({
        studentId: session.user.id,
        matricNumber: profile.matric_number,
        registrationNumber: profile.registration_number,
        feeType: "course_registration",
        facultyName: matchedFaculty?.name ?? null,
        facultyAccountNumber: facultyAccountNumber.trim(),
        amount: Number(amount),
      });
      navigate(`/receipt/${txn.id}`);
    } catch (err) {
      setError(err.message ?? "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-container cp-payment-page">
      <Link to="/dashboard" className="cp-payment-page__back">← Back to dashboard</Link>
      <div className="cp-card cp-payment-page__card">
        <h1>Course registration</h1>
        <p className="cp-payment-page__blurb">
          No bank queue this time. Fill in what's on the teller you'd normally use, and we'll get you a receipt to
          take to your faculty.
        </p>

        {error && <div className="cp-alert cp-alert--error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="cp-field">
            <label>Full name</label>
            <input value={profile?.full_name ?? ""} disabled />
          </div>
          <div className="cp-field">
            <label>Matric number</label>
            <input value={profile?.matric_number ?? ""} disabled />
          </div>
          <div className="cp-field">
            <label>Registration number</label>
            <input value={profile?.registration_number ?? ""} disabled />
          </div>
          <div className="cp-field">
            <label htmlFor="facultyAccount">Faculty account number</label>
            <input
              id="facultyAccount"
              type="text"
              placeholder="Given to you by your course rep"
              value={facultyAccountNumber}
              onChange={(e) => setFacultyAccountNumber(e.target.value)}
              required
            />
            {suggestions.length > 0 && (
              <div className="cp-payment-page__suggestions">
                {suggestions.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    className="cp-payment-page__suggestion"
                    onClick={() => setFacultyAccountNumber(f.account_number)}
                  >
                    {f.name} · {f.account_number}
                  </button>
                ))}
              </div>
            )}
            <span className="cp-field-hint">
              We'll cross-check this against the bank's records once that integration is live, so typos get caught
              before you pay.
            </span>
          </div>
          <div className="cp-field">
            <label htmlFor="amount">Amount (₦)</label>
            <input
              id="amount"
              type="number"
              min="1"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="cp-btn cp-btn--primary cp-btn--full" disabled={busy}>
            {busy ? "Preparing your payment…" : "Continue to pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
