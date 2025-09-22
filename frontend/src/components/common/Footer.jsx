
// Author: Aazaf Ritha
import { Link } from "react-router-dom";
import Logo from "../../assets/guardians-logo.png";
import "./Footer.css";


export default function Footer() {
  const year = new Date().getFullYear();

  const social = [
    { name: "Facebook", href: "#", svg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 2 6.48 2 12.06c0 5.03 3.66 9.2 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.78-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.9h-2.32V22c4.78-.74 8.44-4.91 8.44-9.94z"/>
      </svg>
    )},
    { name: "X (Twitter)", href: "#", svg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2H21l-6.55 7.49L22 22h-6.73l-5.26-6.86L3.82 22H1l7.15-8.18L2 2h6.83l4.74 6.23L18.244 2Zm-1.18 18h2.02L8.02 4H5.93l11.134 16Z"/>
      </svg>
    )},
    { name: "Instagram", href: "#", svg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.055 1.95.24 2.57.51.62.27 1.15.63 1.66 1.14.51.51.87 1.04 1.14 1.66.27.62.45 1.4.51 2.57.058 1.27.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.95-.51 2.57a4.7 4.7 0 0 1-1.14 1.66 4.7 4.7 0 0 1-1.66 1.14c-.62.27-1.4.45-2.57.51-1.27.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.95-.24-2.57-.51a4.7 4.7 0 0 1-1.66-1.14 4.7 4.7 0 0 1-1.14-1.66c-.27-.62-.45-1.4-.51-2.57C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.055-1.17.24-1.95.51-2.57.27-.62.63-1.15 1.14-1.66.51-.51 1.04-.87 1.66-1.14.62-.27 1.4-.45 2.57-.51C8.416 2.212 8.8 2.2 12 2.2Zm0 1.8c-3.16 0-3.532.012-4.776.069-1.03.047-1.59.219-1.96.364-.49.19-.84.42-1.21.79-.37.37-.6.72-.79 1.21-.145.37-.317.93-.364 1.96-.057 1.244-.069 1.616-.069 4.776s.012 3.532.069 4.776c.047 1.03.219 1.59.364 1.96.19.49.42.84.79 1.21.37.37.72.6 1.21.79.37.145.93.317 1.96.364 1.244.057 1.616.069 4.776.069s3.532-.012 4.776-.069c1.03-.047 1.59-.219 1.96-.364.49-.19.84-.42 1.21-.79.37-.37.6-.72.79-1.21.145-.37.317-.93.364-1.96.057-1.244.069-1.616.069-4.776s-.012-3.532-.069-4.776c-.047-1.03-.219-1.59-.364-1.96-.19-.49-.42-.84-.79-1.21-.37-.37-.72-.6-1.21-.79-.37-.145-.93-.317-1.96-.364C15.532 4.012 15.16 4 12 4Zm0 2.8a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4Zm0 1.8a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8ZM17.7 6.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/>
      </svg>
    )},
    { name: "YouTube", href: "https://www.youtube.com/@guardiansawareness", svg: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.7 4 12 4 12 4s-6.7 0-8.7.4A4 4 0 0 0 .5 7.2 41.8 41.8 0 0 0 0 12c0 1.6.1 3.2.5 4.8a4 4 0 0 0 2.8 2.8C4.7 20 12 20 12 20s6.7 0 8.7-.4a4 4 0 0 0 2.8-2.8c.4-1.6.5-3.2.5-4.8 0-1.6-.1-3.2-.5-4.8ZM9.6 15.2V8.8L15.8 12l-6.2 3.2Z"/>
      </svg>
    )},
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* top */}
        <div className="footer-top">
          {/* Brand + Social */}
          <div className="footer-brand">
            <img src={Logo} alt="Guardians" className="footer-logo" />
            <div className="footer-social">
              {social.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name}>
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <div className="footer-links-title">Quick Links</div>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/employee/learn">Educational Content</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
            </ul>
          </div>

          {/* Newsletter / placeholder */}
          <div className="footer-newsletter">
            <div className="footer-newsletter-title">Stay Updated</div>
            <p className="footer-newsletter-text">Enter your e-mail to receive updates.</p>
            <div className="footer-newsletter-form">
              <input
                type="email"
                placeholder="Enter your e-mail address"
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-button">
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* bottom */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <span>© {year} Security Team. All rights reserved.</span>
            <span className="footer-sep">|</span>
            <Link to="/privacy" className="footer-legal-link">Privacy Policy</Link>
            <span className="footer-sep">|</span>
            <Link to="/terms" className="footer-legal-link">Terms of Use</Link>
          </div>
          <div className="opacity-80">Built by <b>Aazaf Ritha</b>.</div>
        </div>
      </div>
    </footer>
  );
}

