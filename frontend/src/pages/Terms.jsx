import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./legal.css";

export default function Terms() {
  return (
    <>
      <Header />
      <main className="legal-container">
        <div className="legal-hero">
          <h1>Terms of Use</h1>
          <p>These terms govern your use of the Security Awareness platform.</p>
        </div>

        <section className="legal-section">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using the platform, you agree to abide by these Terms of Use and any
            applicable organizational policies.
          </p>
        </section>

        <section className="legal-section">
          <h2>Permitted Use</h2>
          <ul>
            <li>Access training content and quizzes for learning purposes.</li>
            <li>Respect intellectual property and do not redistribute content.</li>
            <li>Follow your organization's Acceptable Use Policy (AUP).</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Termination</h2>
          <p>
            We may suspend or terminate access for violations of these terms or other policies. Your
            organization may also manage access as needed.
          </p>
        </section>

        <section className="legal-section">
          <h2>Changes to Terms</h2>
          <p>
            We may update these terms periodically. Continued use after changes constitutes
            acceptance of the updated terms.
          </p>
        </section>

        <div className="legal-meta">Last updated: {new Date().toLocaleDateString()}</div>
      </main>
      <Footer />
    </>
  );
}
