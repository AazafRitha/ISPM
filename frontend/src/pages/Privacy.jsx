import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./legal.css";

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="legal-container">
        <div className="legal-hero">
          <h1>Privacy Policy</h1>
          <p>Your privacy matters. This policy explains what we collect and how we use it.</p>
        </div>

        <section className="legal-section">
          <h2>Information We Collect</h2>
          <p>
            We collect the minimum personal information necessary to provide our security awareness
            services. This may include your name, email address, and activity related to training
            content and quizzes.
          </p>
        </section>

        <section className="legal-section">
          <h2>How We Use Information</h2>
          <ul>
            <li>To deliver educational content and track progress.</li>
            <li>To improve our security awareness program.</li>
            <li>To comply with legal or organizational requirements.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Data Security</h2>
          <p>
            We use reasonable administrative and technical measures to protect your information,
            including access controls and encrypted connections where applicable.
          </p>
        </section>

        <section className="legal-section">
          <h2>Contact</h2>
          <p>
            If you have questions about this policy or your data, please contact the Security Team
            using the details on the Contact page.
          </p>
        </section>

        <div className="legal-meta">Last updated: {new Date().toLocaleDateString()}</div>
      </main>
      <Footer />
    </>
  );
}
