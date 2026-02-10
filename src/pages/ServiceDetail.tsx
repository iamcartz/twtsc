import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";

import services from "../data/services.json";
import { Seo } from "../components/Seo";
import useReveal from "../hooks/useReveal";

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

export default function ServiceDetail() {
  useReveal();

  const { id } = useParams();
  const items = services as Service[];

  const service = useMemo(() => items.find((s) => s.id === id), [items, id]);

  if (!service) {
    return (
      <main className="page" id="main-content">
        <h1>Service not found</h1>
        <p className="muted">Sorry — we couldn’t find that service.</p>
        <div className="cta-row" style={{ marginTop: "1rem" }}>
          <Link className="btn primary" to="/services">Back to Services</Link>
        </div>
      </main>
    );
  }

  const pageTitle = `${service.title} | Together We Thrive Support Co`;
  const pageDesc = service.summary;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: "Together We Thrive Support Co" },
    areaServed: "NSW, Australia",
  };

  return (
    <main className="page" id="main-content">
      <Seo
        title={pageTitle}
        description={pageDesc}
        canonicalPath={`/services/${service.id}`}
        ogImage={service.image || "/og-services.jpg"}
        jsonLd={jsonLd}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="reveal" style={{ marginBottom: "1rem" }}>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
          <li><Link className="text-link" to="/">Home</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link className="text-link" to="/services">Services</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" style={{ fontWeight: 900 }}>{service.title}</li>
        </ol>
      </nav>

      {/* HERO */}
      <section className="hero reveal" aria-label={`${service.title} overview`}>
        <div className="hero-content">
          <div className="pill" style={{ display: "inline-flex" }}>
            {service.category || "Other"}
          </div>

          <h1 style={{ marginTop: ".6rem" }}>{service.title}</h1>
          <p className="lead">{service.summary}</p>

          {service.note ? (
            <p className="muted" style={{ marginTop: ".5rem" }}>
              <strong>Note:</strong> {service.note}
            </p>
          ) : null}

          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <Link className="btn ghost" to="/services">Back to Services</Link>
            <Link className="btn primary" to="/contact">Contact Us</Link>
          </div>
        </div>

        <div className="hero-image" aria-hidden="true">
          <img
            src={service.image}
            alt=""
            loading="eager"
            style={{
              width: "100%",
              height: 420,
              objectFit: "cover",
              borderRadius: "var(--radius)",
              border: "1px solid rgba(31, 41, 55, 0.10)",
              display: "block",
            }}
          />
        </div>
      </section>

      {/* CONTENT */}
      <section className="grid-2" aria-label="Service details" style={{ marginTop: "1.25rem" }}>
        <article className="card reveal">
          <h2 style={{ marginTop: 0 }}>What this support can include</h2>
          <ul className="list">
            {service.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </article>

        <article className="card reveal">
          <h2 style={{ marginTop: 0 }}>How we help</h2>
          <ol className="steps">
            <li>
              We listen first
              <span>We keep questions simple and take our time.</span>
            </li>
            <li>
              We match support to goals
              <span>We focus on what matters most to you.</span>
            </li>
            <li>
              We keep it clear
              <span>Easy steps, easy language, and consistent support.</span>
            </li>
          </ol>

          <div className="cta-row" style={{ marginTop: "1rem" }}>
            <Link className="btn primary" to="/contact">Contact us about this service</Link>
          </div>
        </article>
      </section>

      {/* FAQ */}
      {service.faqs?.length ? (
        <section className="card reveal" style={{ marginTop: "1.25rem" }} aria-label="Frequently asked questions">
          <h2 style={{ marginTop: 0 }}>FAQs</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {service.faqs.map((f) => (
              <details key={f.q}>
                <summary style={{ fontWeight: 900 }}>{f.q}</summary>
                <p className="muted" style={{ marginTop: ".5rem" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
