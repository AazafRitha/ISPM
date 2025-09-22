// Author: Aazaf Ritha (plain CSS version, no Tailwind)
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./Home.css";
import IntroVideo from "../assets/Home/video.mp4";
// Optional: poster image for the video
// import VideoPoster from "../assets/Home/training.jpg";
import HeroSide from "../assets/Home/training.jpg";

const HERO_IMG  = import.meta.env.VITE_HOME_HERO_IMAGE || "";
const BG_VIDEO  = import.meta.env.VITE_HOME_BG_VIDEO_URL || "";
const HAS_BGVID = /\.mp4($|\?)/i.test(BG_VIDEO);

function Feature({ title, blurb, icon, to }) {
  return (
    <Link to={to} className="feature-card feature-link">
      <div className="feature-icon-tile">{icon}</div>
      <div className="feature-text">
        <h3 className="feature-title">{title}</h3>
        <p className="feature-blurb">{blurb}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  console.log("Home component is rendering...");
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const v = videoRef.current;
    if (v) {
      v.muted = !v.muted;
      setMuted(v.muted);
    } else {
      setMuted((m) => !m);
    }
  };
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
        <div className="hero-content hero-grid">
          <div className="hero-left">
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
          <div className="hero-right">
            <img src={HeroSide} alt="Security training illustration" className="hero-side-image" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <Feature
          title="Quizzes — sorted"
          blurb="Publish quizzes to teams and track results."
          icon={<span>✓</span>}
          to="/employee/quizzes"
        />
        <Feature
          title="Learning hub"
          blurb="YouTube, PDFs, write-ups — all in one feed."
          icon={<span>ⓘ</span>}
          to="/employee/learn"
        />
        <Feature
          title="Compliance ready"
          blurb="Read the AUP and e-sign in seconds."
          icon={<span>✍︎</span>}
          to="/aup"
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
            <video
              className="video-player"
              controls
              preload="metadata"
              // poster={VideoPoster}
              onError={() => console.log("Local video failed to load")}
              onLoadedData={() => console.log("Local video loaded successfully")}
              ref={videoRef}
              muted={muted}
              onVolumeChange={() => setMuted(videoRef.current?.muted ?? false)}
            >
              <source src={IntroVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="video-controls" style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                aria-pressed={muted}
                onClick={toggleMute}
                title={muted ? 'Unmute video' : 'Mute video'}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY RESOURCES */}
      <section className="resources">
        <h2 className="resources-title">Security Resources</h2>
        <p className="resources-subtitle">Stay updated with the latest security news and resources</p>
        <div className="resources-grid">
          <div className="resource-card">
            <div className="resource-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2H15L20 7V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4C4 2.89543 4.89543 2 6 2Z" stroke="#1f2937" strokeWidth="1.5"/>
                <path d="M15 2V7H20" stroke="#1f2937" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="resource-title">Policy Documents</h3>
            <p className="resource-desc">Access our organization&apos;s security policies and procedures</p>
            <Link to="/employee/policies" className="resource-link">View Policies</Link>
          </div>

          <div className="resource-card">
            <div className="resource-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 5H20M4 12H20M4 19H14" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="resource-title">Security Bulletin</h3>
            <p className="resource-desc">Monthly newsletter with security tips and updates</p>
            <Link to="/employee/learn" className="resource-link">Read Latest</Link>
          </div>

          <div className="resource-card">
            <div className="resource-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#1f2937" strokeWidth="1.5"/>
                <path d="M14 2V8H20" stroke="#1f2937" strokeWidth="1.5"/>
                <path d="M8 13H16M8 17H16M8 9H10" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="resource-title">Quick Guides</h3>
            <p className="resource-desc">Downloadable security checklists and quick reference guides</p>
            <Link to="/employee/learn" className="resource-link">Download</Link>
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

      {/* WHY SECURITY AWARENESS MATTERS (above footer) */}
      <section className="awareness">
        <h2 className="awareness-title">Why Security Awareness Matters</h2>
        <div className="awareness-grid">
          <div className="aw-card">
            <div className="aw-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L4 6V11C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 11V6L12 3Z" stroke="#1f2937" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="aw-card-title">Protect Our Organization</h3>
            <p className="aw-card-desc">Learn how your actions can help safeguard our organization&apos;s sensitive data and systems.</p>
          </div>

          <div className="aw-card">
            <div className="aw-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3H15L19 7V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V5C5 3.89543 5.89543 3 7 3Z" stroke="#1f2937" strokeWidth="1.5"/>
                <path d="M15 3V7H19" stroke="#1f2937" strokeWidth="1.5"/>
                <path d="M9 13H15M9 17H13" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="aw-card-title">Understand Policies</h3>
            <p className="aw-card-desc">Familiarize yourself with our security policies and compliance requirements.</p>
          </div>

          <div className="aw-card">
            <div className="aw-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.9021 8.09789L20 10L13.9021 11.9021L12 18L10.0979 11.9021L4 10L10.0979 8.09789L12 2Z" stroke="#1f2937" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="aw-card-title">Earn Certifications</h3>
            <p className="aw-card-desc">Complete training modules to earn internal certifications and track your progress.</p>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
