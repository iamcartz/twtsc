import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Footer">
      <div className="footer-inner">

        {/* BRAND */}
        <div className="footer-col">
          <div className="footer-brand">
            <img
              src="/logo.jpeg"
              alt="Together We Thrive Support Co logo"
              className="footer-logo"
            />
            <div>
              <strong>Together We Thrive Support Co</strong>
              <p className="footer-tagline">
                NDIS Disability Support Provider
              </p>
            </div>
          </div>

          <p className="footer-text">
            Warm, respectful disability support helping people live safely,
            confidently, and independently.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/how-we-help">How We Help</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="footer-col">
          <h3>Legal</h3>
          <ul className="footer-links">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
            <li><Link to="/accessibility">Accessibility Statement</Link></li>
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-col">
          <h3>Our Services</h3>
          <ul className="footer-links">
            <li>In-home Supports</li>
            <li>Personal Care</li>
            <li>Social & Community Participation</li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Together We Thrive Support Co</p>

        <p>
          ACN: <strong>695 039 751</strong> &nbsp;|&nbsp;
          ABN: <strong>87 695 039 751</strong>
        </p>

        <p className="footer-small">
          NDIS registration pending
        </p>
      </div>
    </footer>
  );
}
