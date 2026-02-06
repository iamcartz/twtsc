import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="page" id="main">
      <header className="page-header">
        <h1>About Us</h1>
        <p className="muted">
          Together We Thrive Support Co is an NDIS disability support provider based in
          South Western Sydney, with the aim to support participants across NSW as we grow.
        </p>
      </header>

      <section className="grid-2" aria-label="About Together We Thrive">
        <div className="card">
          <h2>Our Mission</h2>
          <p>
            We provide warm, respectful support that helps people live safely,
            confidently, and independently—at home and in the community.
          </p>
        </div>

        <div className="card">
          <h2>Our Approach</h2>
          <ul className="list">
            <li>Clear communication and simple planning</li>
            <li>Support tailored to goals and preferences</li>
            <li>Respect, privacy, and dignity in every interaction</li>
            <li>Inclusive support for participants, families, and coordinators</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginTop: "1rem" }} aria-label="Registration status">
        <h2>NDIS Registration Status</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          NDIS registration is currently pending. We will update our website once registration is confirmed.
        </p>
      </section>

      <section className="contact-strip" aria-label="Next steps">
        <div>
          <h2 style={{ margin: 0 }}>Want to talk to us?</h2>
          <p className="muted" style={{ margin: ".25rem 0 0" }}>
            We’re happy to answer questions and help you understand the next steps.
          </p>
        </div>

        <div className="contact-strip-actions">
          <Link className="btn primary" to="/contact">Enquire</Link>
          <Link className="btn ghost" to="/services">View Services</Link>
        </div>
      </section>
    </main>
  );
}
