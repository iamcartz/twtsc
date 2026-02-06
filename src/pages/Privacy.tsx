import { useSeo } from "../hooks/useSeo";

export default function Privacy() {
  useSeo({
    title: "Privacy Policy | Together We Thrive",
    description: "Privacy Policy for Together We Thrive Support Co.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>Privacy Policy</h1>
        <p className="muted">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <div className="card">
        <h2>Overview</h2>
        <p className="muted">
          Together We Thrive Support Co (“we”, “us”, “our”) respects your privacy.
          This policy explains what we collect and how we use it.
        </p>

        <h2>Information we collect</h2>
        <ul className="list">
          <li>Contact details you provide (e.g., name, email, phone).</li>
          <li>Message content you send via our contact form or email.</li>
          <li>Basic technical data (e.g., device/browser info) via standard logs.</li>
        </ul>

        <h2>How we use your information</h2>
        <ul className="list">
          <li>To respond to enquiries and provide requested information.</li>
          <li>To improve our website and services.</li>
          <li>To meet legal and regulatory requirements where applicable.</li>
        </ul>

        <h2>Sharing</h2>
        <p className="muted">
          We do not sell your information. We may share information with trusted
          service providers (e.g., hosting/email) only as needed to operate our services,
          or if required by law.
        </p>

        <h2>Security</h2>
        <p className="muted">
          We take reasonable steps to protect personal information. No method of
          transmission/storage is 100% secure.
        </p>

        <h2>Access & correction</h2>
        <p className="muted">
          You may request access to, or correction of, your personal information.
          Contact us at{" "}
          <a href="mailto:info@twt.com.au">info@twt.com.au</a>.
        </p>

        <h2>Contact</h2>
        <p className="muted">
          Email:{" "}
          <a href="mailto:info@twt.com.au">info@twt.com.au</a>
        </p>
      </div>
    </section>
  );
}
