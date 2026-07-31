import { Link } from "react-router-dom";
import "./FeeCard.css";

const ACCENTS = {
  green: "var(--cp-green)",
  purple: "var(--cp-purple)",
  blue: "var(--cp-blue)",
};

export default function FeeCard({ title, description, note, to, accent = "green", icon }) {
  return (
    <Link to={to} className="cp-fee-card" style={{ "--accent": ACCENTS[accent] }}>
      <div className="cp-fee-card__icon">{icon}</div>
      <div className="cp-fee-card__body">
        <h3>{title}</h3>
        <p>{description}</p>
        {note && <span className="cp-fee-card__note">{note}</span>}
      </div>
      <span className="cp-fee-card__arrow">→</span>
    </Link>
  );
}
