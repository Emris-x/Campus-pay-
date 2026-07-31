import { Link, useParams } from "react-router-dom";
import "./PaymentPages.css";

const CONFIG = {
  "school-fee": {
    title: "School fee",
    blurb:
      "School fees are paid on the university's own portal. CampusPay doesn't touch this one directly yet — but here's a shortcut so you don't have to go hunting for the link.",
    portalUrl: "https://portal.unical.edu.ng", // replace with the real portal URL
    portalLabel: "Go to the school fee portal",
  },
  "admission-fee": {
    title: "Admission fee",
    blurb:
      "Admission fees are paid on the university's admission portal. CampusPay doesn't process this one directly yet — here's a shortcut to get you there.",
    portalUrl: "https://admissions.unical.edu.ng", // replace with the real portal URL
    portalLabel: "Go to the admission portal",
  },
};

export default function RedirectPayment() {
  const { type } = useParams();
  const config = CONFIG[type];

  if (!config) {
    return (
      <div className="cp-container cp-payment-page">
        <p>We couldn't find that fee type.</p>
        <Link to="/dashboard" className="cp-btn cp-btn--ghost">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="cp-container cp-payment-page">
      <Link to="/dashboard" className="cp-payment-page__back">← Back to dashboard</Link>
      <div className="cp-card cp-payment-page__card">
        <h1>{config.title}</h1>
        <p className="cp-payment-page__blurb">{config.blurb}</p>
        <a href={config.portalUrl} target="_blank" rel="noreferrer" className="cp-btn cp-btn--primary">
          {config.portalLabel} ↗
        </a>
        <p className="cp-field-hint" style={{ marginTop: 16 }}>
          Once we have direct integration with the school's system, this fee will move fully into CampusPay too.
        </p>
      </div>
    </div>
  );
}
