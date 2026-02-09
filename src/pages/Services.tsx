import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { ReactNode } from "react";

import services from "../data/services.json";
import { serviceIcons } from "../components/ServiceIcons";
import { Seo } from "../components/Seo";
import useReveal from "../hooks/useReveal";
import "../styles/Services.css";

type Faq = { q: string; a: string };

type Service = {
  id: string;
  title: string;
  category: string;
  summary: string;
  bullets: string[];
  note?: string;
  icon: string;
  image: string;
  faqs?: Faq[];
};

export default function Services() {
  useReveal();

  const items = services as Service[];

  const iconFor = (key: string): ReactNode =>
    serviceIcons[key] || serviceIcons["people"];

  const isMentalHealthRelated = (s: Service) => {
    const hay = [
      s.title,
      s.category,
      s.summary,
      s.note || "",
      ...(s.bullets || []),
      ...(s.faqs ? s.faqs.map((f) => `${f.q} ${f.a}`) : []),
    ]
      .join(" ")
      .toLowerCase();

    return (
      hay.includes("mental health") ||
      hay.includes("psychosocial") ||
      hay.includes("wellbeing") ||
      hay.includes("well-being") ||
      hay.includes("anxiety") ||
      hay.includes("depression") ||
      hay.includes("trauma") ||
      hay.includes("coping")
    );
  };

  const pageTitle = "Services | Together We Thrive Support Co";
  const pageDesc =
    "Explore our supports including personal care, in-home support, community participation, and psychosocial (mental health) wellbeing support.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services",
    about: "NDIS disability support services",
    isPartOf: { "@type": "WebSite", name: "Together We Thrive Support Co" }
  };

  return (
    <main className="page" id="main-content">
      <Seo
        title={pageTitle}
        description={pageDesc}
        canonicalPath="/services"
        ogImage="/og-services.jpg"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="hero" aria-label="Services hero section">
        <div className="hero-content">
          <div className="hero-brand">
            <img
              className="hero-brand-logo"
              src="/logo.jpeg"
              alt="Together We Thrive Support Co logo"
            />
            <div className="hero-brand-text">
              <div className="hero-brand-title">Together We Thrive</div>
              <div className="hero-brand-subtitle">NDIS Disability Support</div>
            </div>
          </div>

          <h1>Our Services</h1>

          <p className="lead">
            Simple, caring supports designed to be easy to understand and access
            — at home and in the community.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            We also support participants with{" "}
            <strong>psychosocial disability</strong> through calm, practical{" "}
            <strong>mental health &amp; wellbeing</strong> supports.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            <strong>Registration status:</strong> NDIS registration is currently pending.
          </p>
        </div>

        <div className="hero-image">
          <img
            src="/images/services-hero.jpg"
            alt="Support worker with participant in a welcoming community setting"
          />
        </div>
      </section>

      {/* MENTAL HEALTH INTRO */}
      <section
        className="card"
        style={{ marginTop: "1.25rem" }}
        aria-label="Mental health and psychosocial disability support"
      >
        <h2>🧠 Psychosocial Disability &amp; Mental Wellbeing</h2>
        <p className="muted" style={{ marginTop: ".35rem" }}>
          We support people who experience mental health challenges to build routine,
          confidence, and community connection — at your pace, with calm and respectful support.
        </p>
        <ul className="list" style={{ marginTop: ".5rem" }}>
          <li>Support with daily routines and planning</li>
          <li>Confidence building for community access</li>
          <li>Step-by-step support to reach personal goals</li>
          <li>Support for families and carers (with consent)</li>
        </ul>
      </section>

      {/* SERVICES GRID */}
      <section
        className="svc-grid"
        aria-label="Our services"
        style={{ marginTop: "1.25rem" }}
      >
        {items.map((service) => {
          const mh = isMentalHealthRelated(service);

          return (
            <article className="svc-card reveal" key={service.id}>
              <div className="svc-body">
                <div className="svc-head">
                  <span className="svc-ico" aria-hidden="true">
                    <span className="svc-ico-inner">
                      {iconFor(service.icon)}
                    </span>
                  </span>

                  <div className="svc-head-text">
                    <div className="svc-cat">
                      {service.category || "Other"}
                      {mh && (
                        <span
                          style={{
                            marginLeft: ".5rem",
                            fontSize: ".85rem",
                            padding: ".15rem .5rem",
                            borderRadius: "999px",
                            border: "1px solid rgba(0,0,0,.12)",
                            background: "rgba(0,0,0,.04)"
                          }}
                        >
                          🧠 Mental health
                        </span>
                      )}
                    </div>

                    <h2 className="svc-title">{service.title}</h2>
                    <p className="svc-summary">{service.summary}</p>
                  </div>
                </div>

                <ul className="svc-list">
                  {service.bullets.slice(0, 4).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>

                {service.note && (
                  <p className="muted" style={{ marginTop: "0.75rem" }}>
                    <strong>Note:</strong> {service.note}
                  </p>
                )}

                <div className="cta-row">
                  <Link className="btn primary" to={`/services/${service.id}`}>
                    Learn more
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* HELP STRIP */}
      <section className="note reveal" aria-label="Need help choosing a service?">
        <h2 style={{ marginTop: 0 }}>Not sure what you need?</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Tell us a little about your situation and goals. We’ll help you understand your options and the next steps.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to="/contact">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}
