import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createTransaction, fetchFaculties } from "../lib/payments";
import "./PaymentPages.css";

export default function CourseRegistrationPayment() {
  const { profile, session } = useAuth();
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultySearch, setFacultySearch] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchFaculties()
      .then(setFaculties)
      .catch(() => setFaculties([]));
  }, []);

  const filteredFaculties = faculties.filter((faculty) =>
  faculty.name.toLowerCase().includes(facultySearch.toLowerCase())
);
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedFaculty) {
      setError("Select your faculty or department.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    setBusy(true);

    try {
      const txn = await createTransaction({
        studentId: session.user.id,
        matricNumber: profile.matric_number,
        registrationNumber: profile.registration_number,
        feeType: "course_registration",
        facultyName: selectedFaculty.name,
        facultyAccountNumber: selectedFaculty.account_number,
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
      <Link to="/dashboard" className="cp-payment-page__back">
        ← Back to dashboard
      </Link>

      <div className="cp-card cp-payment-page__card">
        <h1>Course registration</h1>

        <p className="cp-payment-page__blurb">
          Select your faculty or department and enter your course registration
          amount.
        </p>

        {error && (
          <div className="cp-alert cp-alert--error">
            {error}
          </div>
        )}

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
            <label htmlFor="faculty">
              Faculty / Department
            </label>

          <div className="cp-field">
  <label htmlFor="facultySearch">
    Faculty / Department
  </label>

  <input
    id="facultySearch"
    type="text"
    placeholder="Search faculty or department"
    value={facultySearch}
    onChange={(e) => {
      setFacultySearch(e.target.value);
      setSelectedFaculty(null);
    }}
    required={!selectedFaculty}
  />

  {facultySearch && filteredFaculties.length > 0 && (
    <div className="cp-payment-page__suggestions">
      {filteredFaculties.map((faculty) => (
        <button
          type="button"
          key={faculty.id}
          className="cp-payment-page__suggestion"
          onClick={() => {
            setSelectedFaculty(faculty);
            setFacultySearch(faculty.name);
          }}
        >
          {faculty.name}
        </button>
      ))}
    </div>
  )}

  {facultySearch && filteredFaculties.length === 0 && (
    <span className="cp-field-hint">
      No matching faculty or department found.
    </span>
  )}
</div>
              required
            >
              <option value="">
                Select your faculty / department
              </option>

              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFaculty && (
            <div className="cp-field">
              <label>Official faculty account</label>

              <input
                value={selectedFaculty.account_number}
                disabled
              />

              {selectedFaculty.bank_name && (
                <span className="cp-field-hint">
                  Bank: {selectedFaculty.bank_name}
                </span>
              )}
            </div>
          )}

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

          <button
            type="submit"
            className="cp-btn cp-btn--primary cp-btn--full"
            disabled={busy}
          >
            {busy ? "Preparing your payment…" : "Continue to pay"}
          </button>
        </form>
      </div>
    </div>
  );
}
