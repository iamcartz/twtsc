import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import services from "../data/services.json";
import { serviceIcons } from "../components/ServiceIcons";
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

const CATEGORY_ORDER = [
  "All",
  "Daily Living",
  "Home Support",
  "Community",
  "Capacity Building",
  "Transport",
  "Other"
] as const;

export default function Services() {
  useReveal();

  const items = services as Service[];
  const [category, setCategory] =
    useState<(typeof CATEGORY_ORDER)[number]>("All");

  const iconFor = (key: string): ReactNode =>
    serviceIcons[key] || serviceIcons["people"];

  const categories = useMemo(() => {
    const set = new Set<string>(items.map((s) => s.category || "Other"));
    const list = CATEGORY_ORDER.filter((c) => c === "All" || set.has(c));
    const extras = Array.from(set).filter((c) => !list.includes(c as any));
    return [...list, ...extras];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const cat = s.category || "Other";
      if (category !== "All" && cat !== category) return false;
      return true;
    });
  }, [items, category]);

  const pageTitle = "Services | Together We Thrive Support Co";
  const pageDesc =
    "Explore our supports including personal care, in-home support, and social & community participation.";

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
            Simple, caring supports designed to be easy to understand and access — at home and in the community.
          </p>

          <p className="muted" style={{ marginTop: ".5rem" }}>
            <strong>Registration status:</strong> NDIS registration is currently pending.
          </p>

          {/* Category pills only (search removed) */}
          <div className="pill-row" aria-label="Filter services by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={c === category ? "pill pill-active" : "pill"}
                onClick={() => setCategory(c as any)}
                aria-pressed={c === category}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/images/services-hero.jpg"
            alt="Support worker with participant in a welcoming community setting"
            loading="eager"
          />
        </div>
      </section>

      {/* GRID */}
      <section className="svc-grid" aria-label="Our services" style={{ marginTop: "1.25rem" }}>
        {filtered.map((service) => (
          <article className="svc-card reveal" key={service.id}>
            {/* Image: show FULL image without cropping */}
            <div className="svc-media" aria-hidden="true">
              <img className="svc-img" src={service.image} alt="" loading="lazy" />
            </div>

            <div className="svc-body">
              <div className="svc-head">
                <span className="svc-ico" aria-hidden="true">
                  <span className="svc-ico-inner">{iconFor(service.icon)}</span>
                </span>

                <div className="svc-head-text">
                  <div className="svc-cat">{service.category || "Other"}</div>
                  <h2 className="svc-title">{service.title}</h2>
                  <p className="svc-summary">{service.summary}</p>
                </div>
              </div>

              <ul className="svc-list">
                {service.bullets.slice(0, 4).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              {service.note ? (
                <p className="muted" style={{ marginTop: "0.75rem" }}>
                  <strong>Note:</strong> {service.note}
                </p>
              ) : null}

              {/* ONLY LEARN MORE */}
              <div className="cta-row" style={{ marginTop: "1rem" }}>
                <Link className="btn primary" to={`/services/${service.id}`}>
                  Learn more
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* HELP STRIP */}
      <section className="note reveal" aria-label="Need help choosing a service?">
        <h2 style={{ marginTop: 0 }}>Not sure what you need?</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          Tell us a little about your situation and goals. We’ll help you understand your options and the next steps.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to="/contact">Contact Us</Link>
        </div>
      </section>
    </main>
  );
}
