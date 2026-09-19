import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchTransactions } from "../lib/payments";
import FeeCard from "../components/FeeCard";
import TransactionRow from "../components/TransactionRow";
import "./Dashboard.css";

export default function Dashboard() {
  const { profile, session } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!session?.user?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await fetchTransactions(session.user.id);

      setTransactions(data ?? []);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const handleFocus = () => {
      loadTransactions();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadTransactions();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadTransactions]);

  const validTransactions = transactions.filter(
    (transaction) => transaction.status !== "failed"
  );

  const totalPaid = validTransactions.reduce(
    (sum, transaction) => {
      const totalAmount =
        Number(transaction.total_amount) ||
        Number(transaction.amount) ||
        0;

      return sum + totalAmount;
    },
    0
  );

  const pendingCount = transactions.filter(
    (transaction) => transaction.status === "pending"
  ).length;

  const verifiedCount = transactions.filter(
    (transaction) => transaction.status === "verified"
  ).length;

  return (
    <div className="cp-container cp-dashboard">
      <section className="cp-dashboard__hero">
        <div>
          <p className="cp-dashboard__eyebrow">
            Your home base
          </p>

          <h1>
            Hey, {profile?.full_name?.split(" ")[0] ?? "there"}.
          </h1>

          <p className="cp-dashboard__matric">
            {profile?.matric_number}
          </p>
        </div>
      </section>

      <section className="cp-dashboard__stats">
        <div className="cp-card cp-stat">
          <span className="cp-stat__label">
            Total this session
          </span>

          <span className="cp-stat__value">
            ₦{totalPaid.toLocaleString("en-NG")}
          </span>
        </div>

        <div className="cp-card cp-stat">
          <span className="cp-stat__label">
            Pending payments
          </span>

          <span className="cp-stat__value">
            {pendingCount}
          </span>
        </div>

        <div className="cp-card cp-stat">
          <span className="cp-stat__label">
            Verified payments
          </span>

          <span className="cp-stat__value">
            {verifiedCount}
          </span>
        </div>

        <div className="cp-card cp-stat">
          <span className="cp-stat__label">
            Transactions on file
          </span>

          <span className="cp-stat__value">
            {transactions.length}
          </span>
        </div>
      </section>

      <section className="cp-dashboard__section">
        <div className="cp-dashboard__section-head">
          <h2>What are you paying for?</h2>

          <span className="cp-pillars">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </div>

        <div className="cp-dashboard__fees">
          <FeeCard
            title="School fee"
            description="Pay through the university's existing fee portal."
            note="Handled by the school's portal"
            to="/pay/school-fee"
            accent="blue"
            icon="🎓"
          />

          <FeeCard
            title="Admission fee"
            description="Pay through the university's admission portal."
            note="Handled by the school's portal"
            to="/pay/admission-fee"
            accent="purple"
            icon="🏛️"
          />

          <FeeCard
            title="Course registration"
            description="No more standing at the bank. Pay your faculty directly from here."
            note="Fully handled by CampusPay"
            to="/pay/course-registration"
            accent="green"
            icon="📚"
          />
        </div>
      </section>

      <section className="cp-dashboard__section">
        <div className="cp-dashboard__section-head">
          <h2>Recent activity</h2>
        </div>

        <div className="cp-card">
          {loading ? (
            <p className="cp-dashboard__empty">
              Loading your transactions…
            </p>
          ) : transactions.length === 0 ? (
            <p className="cp-dashboard__empty">
              Nothing here yet. Once you make a payment,
              it'll show up in this list with a receipt you
              can pull up any time.
            </p>
          ) : (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
