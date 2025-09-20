// Author: Aazaf Ritha (plain CSS version, no Tailwind)
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./Home.css";

const HERO_IMG  = import.meta.env.VITE_HOME_HERO_IMAGE || "";
const BG_VIDEO  = import.meta.env.VITE_HOME_BG_VIDEO_URL || "";
const HAS_BGVID = /\.mp4($|\?)/i.test(BG_VIDEO);

function Feature({ title, blurb, icon }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-blurb">{blurb}</p>
    </div>
  );
}

export default function Home() {
  console.log("Home component is rendering...");
  return (
    <>
      <Header />
      <div className="home-container">
      {/* HERO */}
      <section className="hero">
        {HERO_IMG && <img src={HERO_IMG} alt="" className="hero-media" />}
        {HAS_BGVID && (
          <video className="hero-media" autoPlay muted loop playsInline>
            <source src={BG_VIDEO} />
          </video>
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-kicker">Guardians Security Portal</p>
          <h1 className="hero-title">
            <span className="accent">Be good with your security</span><br />
            <span>so you can be confident at work</span>
          </h1>
          <p className="hero-sub">
            Learn, test, and stay compliant. Create and take quizzes, explore educational content,
            and acknowledge the AUP.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn btn-primary">Get Started</Link>
            <Link to="/employee/learn" className="btn btn-ghost">Browse Learning</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <Feature
          title="Quizzes — sorted"
          blurb="Publish quizzes to teams and track results."
          icon={<div className="badge badge-emerald">✓</div>}
        />
        <Feature
          title="Learning hub"
          blurb="YouTube, PDFs, write-ups — all in one feed."
          icon={<div className="badge badge-sky">ⓘ</div>}
        />
        <Feature
          title="Compliance ready"
          blurb="Read the AUP and e-sign in seconds."
          icon={<div className="badge badge-amber">✍︎</div>}
        />
      </section>

      {/* VIDEO SECTION */}
      <section className="video-section">
        <div className="video-container">
          <h2 className="video-title">Watch Our Introduction Video</h2>
          <p className="video-description">
            Learn more about our security awareness platform and how it helps protect your organization.
          </p>
          <div className="video-wrapper">
            <iframe
              src="https://mysliit-my.sharepoint.com/:v:/g/personal/it23151710_my_sliit_lk/EUIXxWu-xxNGro2V-e68MowBpRgTq7lI4quYRgdaT4f1Bw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=FDvuny&embed=true"
              title="Guardians Security Platform Introduction"
              allowFullScreen
              className="video-iframe"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onError={() => console.log("Video failed to load")}
              onLoad={() => console.log("Video loaded successfully")}
            />
            <div className="video-fallback" style={{ display: 'none' }}>
              <p>If the video doesn't load, you can <a href="https://mysliit-my.sharepoint.com/:v:/g/personal/it23151710_my_sliit_lk/EUIXxWu-xxNGro2V-e68MowBpRgTq7lI4quYRgdaT4f1Bw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=FDvuny" target="_blank" rel="noopener noreferrer">watch it directly on SharePoint</a>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AUP CTA */}
      <section className="aup">
        <div className="aup-text">
          <h3>Need the rules?</h3>
          <p>Read the AUP/User Guide and acknowledge it to complete onboarding.</p>
        </div>
        <div className="aup-actions">
          <Link to="/aup" className="btn btn-outline">Read AUP</Link>
          <Link to="/aup/sign" className="btn btn-blue">Sign AUP</Link>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
