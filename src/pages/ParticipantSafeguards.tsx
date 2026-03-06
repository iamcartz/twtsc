import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";

const PHONE = "(02) 9188 3644";
const EMAIL = "info@twt.com.au";

export default function ParticipantSafeguards() {
  useSeo({
    title: "Participant Safeguards | Together We Thrive",
    description:
      "Learn about participant rights, safeguards, incident management, and our complaints process. Clear, plain-English support aligned with NDIS expectations.",
  });

  return (
    <main className="page" id="main">
      <header className="page-header">
        <h1>Participant Safeguards</h1>
        <p className="muted">
          Clear, respectful support built on participant rights, safety, and
          accountability — in plain language.
        </p>

        <div className="cta-row" style={{ marginTop: ".75rem" }}>
          <Link to="/contact" className="btn primary">
            Talk to us
          </Link>
          <Link to="/services" className="btn ghost">
            View services
          </Link>
        </div>
      </header>

      {/* Rights */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>✅ Your rights as a participant</h2>
        <p className="muted">
          You should feel safe, respected, and in control of your supports. Your
          rights include:
        </p>
        <ul className="list">
          <li>
            <strong>Choice &amp; control</strong> over how, when, and by whom you
            are supported
          </li>
          <li>
            <strong>Dignity and respect</strong> — being heard and treated fairly
          </li>
          <li>
            <strong>Privacy and confidentiality</strong> of your personal
            information
          </li>
          <li>
            <strong>Clear information</strong> so you understand your supports
            and agreements
          </li>
          <li>
            <strong>The right to complain</strong> without fear of negative
            consequences
          </li>
        </ul>
      </section>

      {/* Governance */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>🛡 How we keep safeguards strong</h2>
        <p className="muted">
          Safeguards are the “behind the scenes” systems that protect
          participants and support quality care. Our approach focuses on
          governance, accountability, and respectful communication.
        </p>
        <ul className="list">
          <li>Clear policies and a Code of Conduct for staff</li>
          <li>Respectful, participant-first communication</li>
          <li>Incident awareness and responsible reporting pathways</li>
          <li>Support planning that aligns with your goals and wellbeing</li>
          <li>Plain-English service agreements and transparent processes</li>
        </ul>
      </section>

      {/* Emotional wellbeing */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>🤝 Emotional safety &amp; respectful support</h2>
        <p className="muted">
          We understand that behaviour and communication are often shaped by
          emotions, experiences, and environment. Our supports aim to reduce
          stress and help people feel safe and understood.
        </p>
        <ul className="list">
          <li>Calm responses during challenging moments</li>
          <li>Awareness of emotional regulation and communication styles</li>
          <li>Trauma-informed, respectful interaction (without clinical language)</li>
          <li>Consistent routines and predictable support where possible</li>
        </ul>
      </section>

      {/* Complaints */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>📝 Complaints &amp; feedback process</h2>
        <p className="muted">
          We welcome feedback because it helps us improve. If something doesn’t
          feel right, you can raise it with us in a way that feels safe and
          respectful.
        </p>

        <h3 style={{ marginTop: ".75rem" }}>Our simple pathway</h3>
        <ol className="list">
          <li>
            <strong>Talk to us</strong> — we’ll listen and try to resolve things
            quickly.
          </li>
          <li>
            <strong>Put it in writing</strong> (optional) — email works fine if
            you prefer a written record.
          </li>
          <li>
            <strong>Escalation</strong> — if needed, we’ll arrange a follow-up
            review and share next steps.
          </li>
          <li>
            <strong>External support</strong> — you can seek independent advice
            or raise concerns with the NDIS Quality and Safeguards Commission if
            appropriate.
          </li>
        </ol>

        <p className="muted" style={{ marginTop: ".75rem" }}>
          To share feedback or raise a concern, email{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call{" "}
          <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>.
        </p>
      </section>

      {/* Plain-English Agreements */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>📄 Plain-English service agreements</h2>
        <p className="muted">
          We aim to keep service agreements clear and fair — explained in plain
          language so participants and families feel confident about what to
          expect.
        </p>
        <ul className="list">
          <li>Clear inclusions and support expectations</li>
          <li>Transparent communication and boundaries</li>
          <li>Simple cancellation and changes guidance</li>
          <li>How to raise concerns or request changes</li>
        </ul>
      </section>

      {/* Final CTA */}
      <section className="contact-strip" style={{ marginTop: "1rem" }}>
        <div>
          <h2 style={{ margin: 0 }}>Need help or have a question?</h2>
          <p className="muted" style={{ marginTop: ".25rem" }}>
            We’re here to make things clear and supportive.
          </p>
          <p className="muted" style={{ marginTop: ".25rem" }}>
            {EMAIL} • Admin@twt.net.au • Phone: {PHONE}
          </p>
        </div>

        <div className="contact-strip-actions">
          <Link to="/contact" className="btn primary">
            Send an enquiry
          </Link>
          <Link to="/about" className="btn ghost">
            Back to About
          </Link>
        </div>
      </section>
    </main>
  );
}
