import { Link } from "react-router-dom";

const PHONE = "+61 433 883 614";
const EMAIL = "info@twt.net.au";

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
                NDIS support services • Mental Health &amp; Wellbeing Support
              </p>
            </div>
          </div>

          <p className="footer-text">
            Person-centred disability support with a calm focus on{" "}
            <strong>psychosocial disability support</strong> and{" "}
            <strong>mental health &amp; wellbeing</strong> — helping people build
            routine, confidence, and community connection.
          </p>

          <div className="footer-contact" aria-label="Footer contact details">
            <p className="footer-small" style={{ marginTop: ".75rem" }}>
              <strong>Phone:</strong>{" "}
              <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
              <br />
              <strong>Email:</strong>{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </p>

            <div className="footer-actions" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <a className="btn ghost" href={`tel:${PHONE.replace(/\s/g, "")}`}>
                Call
              </a>
              <a className="btn ghost" href={`mailto:${EMAIL}`}>
                Email
              </a>
              <Link className="btn primary" to="/contact">
                Send enquiry
              </Link>
            </div>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/services">Services</Link>
            </li>
            <li>
              <Link to="/how-we-help">How We Help</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        {/* LEGAL */}
        <div className="footer-col">
          <h3>Legal</h3>
          <ul className="footer-links">
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Use</Link>
            </li>
            <li>
              <Link to="/accessibility">Accessibility Statement</Link>
            </li>
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-col">
          <h3>Our Services</h3>
          <ul className="footer-links">
            <li>Mental Health &amp; Wellbeing Support</li>
            <li>Psychosocial disability support</li>
            <li>NDIS daily living support</li>
            <li>NDIS in-home support</li>
            <li>NDIS personal care support</li>
            <li>NDIS community participation</li>
          </ul>

          <p className="footer-small" style={{ marginTop: ".75rem" }}>
            Supports are provided in line with NDIS guidelines and within the
            scope of our registration.
          </p>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Together We Thrive Support Co</p>

        <p>
          ACN: <strong>695 039 751</strong> &nbsp;|&nbsp; ABN:{" "}
          <strong>87 695 039 751</strong>
        </p>

        <p className="footer-small">NDIS registration pending</p>
      </div>
    </footer>
  );
}
