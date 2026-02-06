import { Link, useParams } from "react-router-dom";
import services from "../data/services.json";
import { Seo } from "../components/Seo";

type Faq = { q: string; a: string };

type Service = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  note?: string;
  icon: string;
  image: string;
  faqs?: Faq[];
};

export default function ServiceDetail() {
  const { id } = useParams();
  const items = services as Service[];
  const service = items.find((s) => s.id === id);

  if (!service) {
    return (
      <main className="page" id="main-content">
        <header className="page-header">
          <h1>Service not found</h1>
          <p className="muted">Please go back to Services and choose a service.</p>
        </header>
        <Link className="btn primary" to="/services">Back to Services</Link>
      </main>
    );
  }

  const title = `${service.title} | Together We Thrive Support Co`;
  const description = service.summary;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/services/${service.id}`;

  // simple "related": everything except current, first 3
  const related = items.filter((s) => s.id !== service.id).slice(0, 3);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${origin}/` },
        { "@type": "ListItem", "position": 2, "name": "Services", "item": `${origin}/services` },
        { "@type": "ListItem", "position": 3, "name": service.title, "item": url }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.title,
      "description": service.summary,
      "areaServed": "NSW, Australia",
      "provider": { "@type": "Organization", "name": "Together We Thrive Support Co" },
      "url": url
    },
    ...(service.faqs?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": service.faqs.map((f) => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
          }
        ]
      : [])
  ];

  return (
    <main className="page" id="main-content">
      <Seo
        title={title}
        description={description}
        canonicalPath={`/services/${service.id}`}
        ogImage={service.image}
        jsonLd={jsonLd}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1rem" }}>
        <ol className="breadcrumbs">
          <li><Link to="/">Home</Link></li>
          <li><span aria-hidden="true">/</span></li>
          <li><Link to="/services">Services</Link></li>
          <li><span aria-hidden="true">/</span></li>
          <li aria-current="page">{service.title}</li>
        </ol>
      </nav>

      {/* Detail Hero */}
      <section className="detail-hero" aria-label="Service detail hero">
        <div className="detail-hero-text">
          <h1 style={{ marginTop: 0 }}>{service.title}</h1>
          <p className="lead" style={{ marginTop: ".25rem" }}>{service.summary}</p>

          {service.note ? (
            <p className="muted" style={{ marginTop: ".75rem" }}>
              <strong>Note:</strong> {service.note}
            </p>
          ) : null}

          <div className="cta-row">
            <Link className="btn primary" to="/contact">Enquire</Link>
            <Link className="btn ghost" to="/services">Back to Services</Link>
          </div>
        </div>

        <div className="detail-hero-image">
          <img src={service.image} alt="" loading="eager" />
        </div>
      </section>

      {/* Included supports */}
      <section className="card" style={{ marginTop: "1rem" }} aria-label="Included supports">
        <h2 style={{ marginTop: 0 }}>What’s included</h2>
        <ul className="list">
          {service.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      </section>

      {/* FAQs */}
      {service.faqs?.length ? (
        <section className="card" style={{ marginTop: "1rem" }} aria-label="Frequently asked questions">
          <h2 style={{ marginTop: 0 }}>Frequently asked questions</h2>

          <div className="faq">
            {service.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p className="muted" style={{ marginTop: ".5rem" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* ✅ Related services */}
      <section className="card" style={{ marginTop: "1rem" }} aria-label="Related services">
        <h2 style={{ marginTop: 0 }}>Related services</h2>
        <div className="related">
          {related.map((s) => (
            <Link key={s.id} to={`/services/${s.id}`} className="related-card">
              <img src={s.image} alt="" loading="lazy" />
              <div className="related-body">
                <strong>{s.title}</strong>
                <p className="muted" style={{ margin: ".35rem 0 0" }}>{s.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="note" aria-label="Next steps">
        <h2 style={{ marginTop: 0 }}>Next steps</h2>
        <p className="muted" style={{ marginTop: ".25rem" }}>
          If you’re not sure where to start, contact us and we’ll help you choose supports that match your goals.
        </p>
        <div className="cta-row">
          <Link className="btn primary" to="/contact">Contact Us</Link>
          <Link className="btn ghost" to="/about">About Us</Link>
        </div>
      </section>
    </main>
  );
}
