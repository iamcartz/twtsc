import { useSeo } from "../hooks/useSeo";

const EMAIL = "info@twt.net.au";

export default function Terms() {
  useSeo({
    title: "Terms of Use | Together We Thrive",
    description: "Website Terms of Use for Together We Thrive Support Co.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Terms of Use</h1>
        <p className="muted">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="card">
        <h2>Using this website</h2>
        <p className="muted">
          By using this website, you agree to these terms. If you do not agree,
          please do not use the website.
        </p>

        <h2>Information on this site</h2>
        <p className="muted">
          We aim to keep information accurate and up to date. However, content is
          general in nature and may change. Please contact us to confirm details.
        </p>

        <h2>Links to other websites</h2>
        <p className="muted">
          We may link to external sites. We are not responsible for the content
          or privacy practices of those sites.
        </p>

        <h2>Limitation of liability</h2>
        <p className="muted">
          To the extent permitted by law, we are not liable for any loss arising
          from use of this website.
        </p>

        <h2>Contact</h2>
        <p className="muted">
          Email:{" "}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </p>
      </div>
    </section>
  );
}
