import "./Footer.css";

export default function Footer() {
  return (
    <footer className="cp-footer">
      <div className="cp-container cp-footer__inner">
        <div>
          <p className="cp-footer__brand">CampusPay</p>
          <p className="cp-footer__tag">A product of Emris Technology.</p>
        </div>
        <div className="cp-footer__links">
          <a href="/privacy.html">Privacy policy</a>
          <a href="/terms.html">Terms of service</a>
          <a href="mailto:support@campuspay.app">Support</a>
        </div>
      </div>
    </footer>
  );
}
