import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useState } from "react";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);

    setReduced(media.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    // Fallback for older browsers
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

export default function Home() {
  useSeo({
    title: "Together We Thrive Support Co | NDIS Disability Support",
    description:
      "Together We Thrive Support Co provides warm and respectful NDIS disability support across South Western Sydney, including in-home supports, personal care, and community participation.",
  });

  const reducedMotion = usePrefersReducedMotion();

  return (
    <section className="page">
      {/* HERO */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          {/* Subtle brand row */}
          <div className="hero-brand" aria-label="Together We Thrive Support Co">
            <img
              className="hero-brand-logo"
              src="/logo.jpeg"
              alt="Together We Thrive Support Co logo"
            />
            <div className="hero-brand-text">
              <span className="hero-brand-title">Together We Thrive</span>
              <span className="hero-brand-subtitle">Support Co</span>
            </div>
          </div>

          <h1>Warm, respectful NDIS disability support</h1>

          <p className="lead">
            We support people with disability to live safely, confidently, and
            independently. We keep communication clear and provide support at
            your pace.
          </p>

          {/* CTA BUTTONS */}
          <div className="cta-row" aria-label="Primary actions">
            <Link to="/contact" className="btn primary">
              Contact Us
            </Link>

            <Link to="/services" className="btn ghost">
              View Services
            </Link>
          </div>

          {/* Quick reassurance */}
          <p className="muted hero-helper">
            Based in <strong>South Western Sydney</strong> • Expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          {/* Key supports */}
          <div className="pill-row" aria-label="Key supports offered">
            <span className="pill">In-home supports</span>
            <span className="pill">Personal care</span>
            <span className="pill">Community participation</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/hero.png"
            alt="Support worker assisting a participant in the community"
          />
        </div>
      </div>

      {/* TRUST / REASSURANCE (no registration claim) */}
      <div className="trust-row" aria-label="Trust and service information">
        <div className="trust-card">
          <h2>Clear & respectful communication</h2>
          <p className="muted">
            We keep information simple and direct — helpful for participants,
            families, and coordinators.
          </p>
        </div>

        <div className="trust-card">
          <h2>Participant safety & dignity</h2>
          <p className="muted">
            Support is delivered with privacy, respect, and careful attention to
            individual needs.
          </p>
        </div>

        <div className="trust-card">
          <h2>NDIS support types</h2>
          <p className="muted">
            We can support <strong>self-managed</strong> and{" "}
            <strong>plan-managed</strong> participants. (If you are NDIA-managed,
            contact us and we’ll guide you on options.)
          </p>
        </div>
      </div>

      {/* CONVERSION SECTION: "What do you need help with?" */}
      <header className="page-header" style={{ marginTop: "1.5rem" }}>
        <h2>How can we help you today?</h2>
        <p className="muted">
          Choose what you need. We’ll respond with clear next steps.
        </p>
      </header>

      <div className="cards">
        <article className="service-card">
          <img
            src="/images/inhome.jpg"
            alt="Support worker assisting an older man using a walker at home"
          />
          <div className="service-body">
            <h3>Support at home</h3>
            <p className="muted">
              Help with daily routines, household tasks, and building
              independence at home.
            </p>
            <Link className="text-link" to="/services">
              See in-home supports →
            </Link>
          </div>
        </article>

        <article className="service-card">
          <img
            src="/images/community.jpg"
            alt="Two women enjoying coffee outdoors, smiling and talking together"
          />
          <div className="service-body">
            <h3>Community participation</h3>
            <p className="muted">
              Support to go out, join activities, build confidence, and stay
              connected.
            </p>
            <Link className="text-link" to="/services">
              See community supports →
            </Link>
          </div>
        </article>

        <article className="service-card">
            <img
            src="/images/personal-care.jpg"
            alt="Support worker assisting a participant with personal care"
          />
          <div className="service-body">
            <h3>Personal care</h3>
            <p className="muted">
              Respectful support with hygiene, dressing, grooming, and daily
              self-care — with dignity and privacy.
            </p>
            <Link className="text-link" to="/services">
              See personal care →
            </Link>
          </div>
        </article>
      </div>

      {/* CONTACT STRIP */}
      <div className="contact-strip" aria-label="Quick contact options">
        <div className="contact-strip-left">
          <h2>Ready to talk?</h2>
          <p className="muted">
            Call us or send a message. We’ll respond as soon as possible.
          </p>
        </div>

        <div className="contact-strip-actions">
          <a className="btn ghost" href="tel:0400000000">
            Call 0400 000 000
          </a>

          <Link className="btn primary" to="/contact">
            Send an enquiry
          </Link>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h2>Where we work</h2>
          <p className="muted">
            We’re currently supporting people in{" "}
            <strong>South Western Sydney</strong>. Our goal is to expand across{" "}
            <strong>NSW</strong> as we grow.
          </p>
        </div>

        <div className="card">
          <h2>Who we support</h2>
          <ul className="list">
            <li>NDIS participants</li>
            <li>People with intellectual disabilities</li>
            <li>People with cognitive impairments</li>
            <li>Families, carers, and support coordinators</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
