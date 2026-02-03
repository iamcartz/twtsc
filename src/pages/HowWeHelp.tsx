import { useSeo } from "../hooks/useSeo";

export default function HowWeHelp() {
  useSeo({
    title: "How We Help | Together We Thrive",
    description:
      "Our simple support process: contact us, we listen, we match supports, and begin at your pace.",
  });

  return (
    <section className="page">
      <header className="page-header">
        <h1>How We Help</h1>
        <p className="muted">We keep it simple and clear.</p>
      </header>

      <div className="card">
        <ol className="steps">
          <li>
            <strong>Contact us</strong>
            <span>Call or send a message.</span>
          </li>
          <li>
            <strong>We listen</strong>
            <span>We learn what you need and what matters to you.</span>
          </li>
          <li>
            <strong>We match supports</strong>
            <span>We plan supports that suit your goals and routine.</span>
          </li>
          <li>
            <strong>Support begins</strong>
            <span>We start at your pace, with clear communication.</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
