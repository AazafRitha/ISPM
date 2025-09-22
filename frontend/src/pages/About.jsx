import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./About.css";

import TeamAazaf from "../assets/aazaf-ritha.jpg";
import TeamHana from "../assets/hana.jpg";
import TeamSahan from "../assets/sahan.jpeg";
import TeamTharaka from "../assets/Tharaka.jpg"; 
import TeamFarhan from "../assets/Farhan.jpg"; 
import AboutHero from "../assets/meeting.jpg";

export default function About() {
  const teamMembers = [
    {
      name: "Aazaf Ritha.J",
      role: "Team Lead, Content Developer",
      image: TeamAazaf,
      description: "Leading the development team and creating educational content for the platform.",
      social: {
        instagram: "#",
        linkedin: "#",
        email: "mailto:security@guardians.local"
      }
    },
    {
      name: "Farhan",
      role: "Employee Part Developer",
      image: TeamFarhan,
      description: "Developing employee-facing features and user experience components.",
      social: {
        instagram: "#",
        linkedin: "#",
        email: "mailto:security@guardians.local"
      }
    },
    {
      name: "Hana Saleed",
      role: "Admin & Phishing Part Developer",
      image: TeamHana,
      description: "Building admin dashboard and phishing simulation features.",
      social: {
        instagram: "#",
        linkedin: "#",
        email: "mailto:security@guardians.local"
      }
    },
    {
      name: "Sahan Wijerathna",
      role: "Authentication Developer",
      image: TeamSahan,
      description: "Implementing secure authentication and authorization systems.",
      social: {
        instagram: "#",
        linkedin: "#",
        email: "mailto:security@guardians.local"
      }
    },
    {
      name: "Thraka Rasnayaka",
      role: "Static Page Developer",
      image: TeamTharaka,
      description: "Creating and maintaining static pages and UI components.",
      social: {
        instagram: "#",
        linkedin: "#",
        email: "mailto:security@guardians.local"
      }
    }
  ];

  return (
    <>
      <Header />
      
        {/* Hero Section */}
        <section className="about-hero" style={{ backgroundImage: `url(${AboutHero})` }}>
          <div className="about-hero-overlay" />
          <div className="about-hero-content">
            <h1 className="about-hero-title">ABOUT US</h1>
            <p className="about-hero-sub">We help teams build a strong security culture through engaging training, practical simulations, and measurable outcomes.</p>
          </div>
        </section>
        <div className="about-page">
        {/* Intro Section (title + subtitle + underline) */}
        <section className="about-intro" aria-label="Guardian Awareness intro">
          <h1 className="about-intro-title">Guardian Awareness</h1>
          <p className="about-intro-sub">
            Empowering individuals and organizations with the knowledge and skills needed to
            stay secure in today's digital world
          </p>
          <span className="about-intro-divider" aria-hidden="true" />
        </section>

        <div className="about-container">
          {/* What We Do */}
          <section className="what-section">
            <div className="what-grid">
              <div className="what-images">
                <img src={AboutHero} alt="Workshop" className="img-1" loading="lazy" />
                
              </div>
              <div className="what-text">
                
                <p>
                  Guardians Awareness is a comprehensive security education platform designed to help organizations
                  and individuals stay informed about cybersecurity best practices. We deliver modern learning
                  experiences that are accessible, practical, and measurable.
                </p>
                <p>
                  Our mission is to make security awareness engaging and effective through interactive quizzes,
                  educational content, and real-world simulations. We partner with teams to improve behavior,
                  reduce risk, and build long-term resilience.
                </p>
                <p className="signature">— Guardians Team</p>
              </div>
            </div>
          </section>

            {/* What We Do (cards) */}
            <section className="what-we-do" aria-label="What we do">
              <div className="wwd-header">
                <h2 className="wwd-title">What We Do</h2>
                <span className="wwd-divider" aria-hidden="true" />
                <p className="wwd-sub">
                  Through our platform, we provide an interactive learning environment that goes
                  beyond theory
                </p>
              </div>

              <div className="wwd-grid">
                <div className="wwd-card">
                  <div className="wwd-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11.5 19H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h5.5v15Z"/>
                      <path d="M12.5 4H18a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-5.5V4Z"/>
                      <path d="M11.5 7H7.5"/>
                      <path d="M11.5 10H8.5"/>
                    </svg>
                  </div>
                  <h3 className="wwd-card-title">Educational Content</h3>
                  <p className="wwd-card-text">
                    Easy-to-understand modules covering essential cybersecurity concepts, designed to make
                    complex topics accessible to everyone.
                  </p>
                </div>

                <div className="wwd-card">
                  <div className="wwd-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9.5 6.5a3 3 0 0 0-3 3v.5a3 3 0 0 0-1 2.25 3 3 0 0 0 3 3H10"/>
                      <path d="M14.5 6.5a3 3 0 0 1 3 3v.5a3 3 0 0 1 1 2.25 3 3 0 0 1-3 3H14"/>
                      <path d="M10 6.5v9.5"/>
                      <path d="M14 6.5v9.5"/>
                      <path d="M10 10h4"/>
                    </svg>
                  </div>
                  <h3 className="wwd-card-title">Quizzes & Assessments</h3>
                  <p className="wwd-card-text">
                    Reinforcing knowledge with interactive challenges and knowledge checks that ensure
                    learning retention and understanding.
                  </p>
                </div>

                <div className="wwd-card">
                  <div className="wwd-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="8"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                    </svg>
                  </div>
                  <h3 className="wwd-card-title">Hands-On Experience</h3>
                  <p className="wwd-card-text">
                    Real-world simulations and exercises that let learners practice identifying, preventing,
                    and responding to threats.
                  </p>
                </div>
              </div>
            </section>


            {/* Developer Team Section */}
          <div className="team-section">
            <h2>Our Development Team</h2>
            <p className="team-description">
              Meet the talented developers who brought Guardians Awareness to life. 
              Each team member brings unique expertise to create a comprehensive security education platform.
            </p>
            
            <div className="team-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-member-card">
                  <div className="member-image-container">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="member-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="member-info">
                      <p className="member-role">{member.role}</p>
                      <h3 className="member-name">{member.name}</h3>
                    <p className="member-description">{member.description}</p>
                      <div className="member-social" aria-label={`Social links for ${member.name}`}>
                        <a href={member.social?.instagram || "#"} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                            <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.055 1.95.24 2.57.51.62.27 1.15.63 1.66 1.14.51.51.87 1.04 1.14 1.66.27.62.45 1.4.51 2.57.058 1.27.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.24 1.95-.51 2.57a4.7 4.7 0 0 1-1.14 1.66 4.7 4.7 0 0 1-1.66 1.14c-.62.27-1.4.45-2.57.51-1.27.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.95-.24-2.57-.51a4.7 4.7 0 0 1-1.66-1.14 4.7 4.7 0 0 1-1.14-1.66c-.27-.62-.45-1.4-.51-2.57C2.212 15.584 2.2 15.2 2.2 12s.012-3.584.07-4.85c.055-1.17.24-1.95.51-2.57.27-.62.63-1.15 1.14-1.66.51-.51 1.04-.87 1.66-1.14.62-.27 1.4-.45 2.57-.51C8.416 2.212 8.8 2.2 12 2.2Zm0 3.6a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 2a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4Zm5.7-1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/>
                          </svg>
                        </a>
                        <a href={member.social?.linkedin || "#"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                            <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8.98h4.99V24H0V8.98zM8.98 8.98h4.79v2.05h.07c.67-1.27 2.32-2.6 4.78-2.6 5.11 0 6.06 3.36 6.06 7.74V24h-5V17.2c0-1.62-.03-3.71-2.26-3.71-2.27 0-2.62 1.77-2.62 3.6V24h-5V8.98z"/>
                          </svg>
                        </a>
                        <a href={member.social?.email || "mailto:security@guardians.local"} aria-label="Email" title="Email">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/>
                          </svg>
                        </a>
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


       
      </div>
      <Footer />
    </>
  );
}
