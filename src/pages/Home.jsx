import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="cp-home">
      <section className="cp-home__hero">
        <div className="cp-container cp-home__hero-inner">
          <img src="/logo.png" alt="CampusPay crest" className="cp-home__crest" />
          <p className="cp-home__eyebrow">Built for UNICAL students</p>
          <h1>
            Your fees, sorted <span className="cp-home__accent">— from your room.</span>
          </h1>
          <p className="cp-home__sub">
            School fees, admission fees and course registration, without standing in line at the bank. CampusPay
            gets you a receipt, not a headache.
          </p>
          <div className="cp-home__cta">
            <Link to="/signup" className="cp-btn cp-btn--primary">Create your account</Link>
            <Link to="/login" className="cp-btn cp-btn--ghost">I already have one</Link>
          </div>
        </div>
      </section>

      <section className="cp-container cp-home__pillars-section">
        <div className="cp-pillars"><span></span><span></span><span></span></div>
        <h2>Three fees. One place.</h2>
        <div className="cp-home__grid">
          <div className="cp-card cp-home__grid-item">
            <span className="cp-home__grid-tag" style={{ color: "var(--cp-blue)" }}>School fee</span>
            <p>Straight to the university's own portal — we just get you there faster.</p>
          </div>
          <div className="cp-card cp-home__grid-item">
            <span className="cp-home__grid-tag" style={{ color: "var(--cp-purple)" }}>Admission fee</span>
            <p>Same thing — the school's portal, one tap away, no searching required.</p>
          </div>
          <div className="cp-card cp-home__grid-item">
            <span className="cp-home__grid-tag" style={{ color: "var(--cp-green)" }}>Course registration</span>
            <p>This one's fully ours. Fill the form, pay your faculty, get a receipt. No teller, no queue.</p>
          </div>
        </div>
      </section>

      <section className="cp-container cp-home__closing">
        <div className="cp-card cp-home__closing-card">
          <h2>Home base for your campus money moves.</h2>
          <p>Sign up once with your matric number. Everything after that takes a few taps.</p>
          <Link to="/signup" className="cp-btn cp-btn--primary">Get started</Link>
        </div>
      </section>
    </div>
  );
}
