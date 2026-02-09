import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { useEffect, useState } from "react";
import "../styles/About.css";

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

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return reduced;
}

export default function About() {
  useSeo({
    title: "About | Together We Thrive Support Co",
    description:
      "Learn about Together We Thrive Support Co — who we are, who we support, and our NDIS support services including psychosocial disability and mental health support.",
  });

  const reducedMotion = usePrefersReducedMotion();

  return (
    <main className="page" id="main">

      {/* HERO */}
      <div className={`hero ${reducedMotion ? "" : "hero-animate"}`}>
        <div className="hero-content">
          <div className="hero-brand">
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

          <h1>About Us</h1>

          <p className="lead">
            Empowering Ability. Supporting Independence. Building Meaningful Lives.
          </p>

          <div className="cta-row">
            <Link to="/contact" className="btn primary">
              Contact Us
            </Link>
            <Link to="/services" className="btn ghost">
              View Services
            </Link>
          </div>

          <p className="muted hero-helper">
            Based in <strong>South Western Sydney</strong> • Expanding across{" "}
            <strong>NSW</strong> as we grow
          </p>

          <div className="pill-row">
            <span className="pill">In-home supports</span>
            <span className="pill">Personal care</span>
            <span className="pill">Community participation</span>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/about-hero.png"
            alt="Support worker assisting a participant in the community"
          />
        </div>
      </div>

      {/* 👥 WHO WE ARE */}
      <section className="card" style={{ marginTop: "1.25rem" }}>
        <h2>👥 Who We Are</h2>
        <p className="muted">
          Together We Thrive Support Co supports people living with disability
          to live with dignity, independence, and purpose. We provide
          personalised, compassionate support to help participants achieve
          their goals and stay connected with community.
        </p>
        <p className="muted">
          We believe support should go beyond basic care — it should inspire
          confidence, promote growth, and help every individual truly thrive.
        </p>
      </section>

      {/* SERVICES + WHO WE SUPPORT */}
      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card">
          <h2>🧩 Our NDIS Support Services</h2>
          <ul className="list">
            <li>Assistance with Daily Living &amp; Personal Care</li>
            <li>Community Participation &amp; Social Support</li>
            <li>Capacity Building &amp; Life Skills Development</li>
            <li>Support Coordination &amp; Individualised Plans</li>
            <li><strong>Mental Health &amp; Wellbeing Support</strong></li>
          </ul>
          <p className="muted">
            Services can be customised based on participant plans and support
            requirements.
          </p>
        </div>

        <div className="card">
          <h2>🧑‍🦽 Who We Support</h2>
          <ul className="list">
            <li>NDIS participants of all ages</li>
            <li>Individuals living with physical or intellectual disabilities</li>
            <li>
              People living with <strong>psychosocial disability</strong> (mental health support needs)
            </li>
            <li>
              People seeking greater independence, social connection, and improved quality of life
            </li>
            <li>Families and carers looking for reliable support</li>
          </ul>
          <p className="muted" style={{ marginTop: ".5rem" }}>
            We offer calm, respectful support that promotes routine, confidence, and community connection.
          </p>
        </div>
      </section>

      {/* 🤝 OUR APPROACH */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>🤝 Our Approach</h2>
        <ul className="list">
          <li>Respectful, inclusive, and culturally sensitive support</li>
          <li>Flexible services tailored to individual goals</li>
          <li>Focus on independence, confidence, and skill development</li>
          <li>Collaborative partnerships with families</li>
          <li>Consistent, professional, compassionate support workers</li>
        </ul>
      </section>

      {/* 🧠 MENTAL HEALTH & WELLBEING */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>🧠 Mental Health &amp; Wellbeing Support</h2>
        <p className="muted">
          We support participants with psychosocial disability in a calm, practical way —
          focusing on daily routines, community connection, and building confidence at your pace.
        </p>
        <ul className="list">
          <li>Support with daily routines and planning</li>
          <li>Encouragement to attend appointments and community activities</li>
          <li>Skill-building to improve confidence and independence</li>
          <li>Respectful support for families and carers</li>
        </ul>
      </section>

      {/* 🎯 MISSION & 🌟 VISION */}
      <section className="grid-2" style={{ marginTop: "1rem" }}>
        <div className="card">
          <h2>🎯 Mission</h2>
          <p className="muted">
            To empower people living with disability to live confidently,
            independently, and meaningfully through compassionate, high-quality
            support.
          </p>
        </div>

        <div className="card">
          <h2>🌟 Vision</h2>
          <p className="muted">
            A future where every individual is supported to thrive, fully
            participate in community life, and achieve their personal goals
            without barriers.
          </p>
        </div>
      </section>

      {/* ✅ NDIS COMMITMENT */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>✅ NDIS Commitment</h2>
        <p className="muted">
          We are committed to maintaining high standards aligned with the NDIS,
          focusing on quality, safety, accountability, and participant wellbeing.
        </p>
      </section>

      {/* 💚 WHY CHOOSE US */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>💚 Why Choose Together We Thrive</h2>
        <ul className="list">
          <li>Genuine passion for disability support</li>
          <li>Highly personalised, participant-focused services</li>
          <li>Compassionate and professional support workers</li>
          <li>Strong commitment to inclusion and empowerment</li>
          <li>Reliable, responsive, quality-driven care</li>
        </ul>
      </section>

      {/* 📍 LOCATIONS */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>📍 Service Locations</h2>
        <ul className="list">
          <li>Suite 1/1840 The Horsley Drive, Horsley Park NSW</li>
          <li>Suite 420/49 Queens Road, Five Dock NSW</li>
        </ul>
      </section>

      {/* 📝 REGISTRATION */}
      <section className="card" style={{ marginTop: "1rem" }}>
        <h2>📝 NDIS Registration Status</h2>
        <p className="muted">
          NDIS registration is currently pending. We will update our website
          once registration is confirmed.
        </p>
      </section>

      {/* CONTACT STRIP */}
      <section className="contact-strip">
        <div>
          <h2 style={{ margin: 0 }}>Let’s Thrive Together</h2>
          <p className="muted" style={{ marginTop: ".25rem" }}>
            Info@twt.net.au • Admin@twt.net.au • Phone number coming soon
          </p>
        </div>

        <div className="contact-strip-actions">
          <Link to="/contact" className="btn primary">
            Send an enquiry
          </Link>
          <Link to="/services" className="btn ghost">
            View Services
          </Link>
        </div>
      </section>

    </main>
  );
}
