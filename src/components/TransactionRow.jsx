import "./TransactionRow.css";

const FEE_LABELS = {
  school_fee: "School fee",
  admission_fee: "Admission fee",
  course_registration: "Course registration",
};

export default function TransactionRow({ transaction }) {
  const date = new Date(transaction.created_at).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="cp-txn-row">
      <div className="cp-txn-row__main">
        <p className="cp-txn-row__title">{FEE_LABELS[transaction.fee_type] ?? transaction.fee_type}</p>
        <p className="cp-txn-row__meta">
          {transaction.receipt_number} · {date}
          {transaction.faculty_name ? ` · ${transaction.faculty_name}` : ""}
        </p>
      </div>
      <div className="cp-txn-row__amount">
        <span>₦{Number(transaction.amount).toLocaleString("en-NG")}</span>
        <span className={`cp-pill cp-pill--${transaction.status}`}>{transaction.status}</span>
      </div>
    </div>
  );
}
