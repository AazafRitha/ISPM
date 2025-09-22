// Author: Aazaf Ritha (plain CSS version, no Tailwind)
import { useState } from "react";
import { contactApi } from "../api/contact";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./contact.css";

export default function Contact() {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [message,   setMessage]   = useState("");
  const [busy,      setBusy]      = useState(false);
  const [ok,        setOk]        = useState(false);
  const [err,       setErr]       = useState("");

  async function submit(e){
    e.preventDefault();
    setErr(""); setOk(false); setBusy(true);
    try{
      await contactApi.submit({ firstName, lastName, email, message });
      setOk(true);
      setFirstName(""); setLastName(""); setEmail(""); setMessage("");
    }catch(ex){
      setErr(ex?.message || "Submit failed");
    }finally{
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <div className="contact-wrap">
      <div className="contact-grid">
        <section className="contact-info">
          <h1 className="h1">Contact us</h1>
          <p className="p">
            Need to get in touch? Fill the form and we’ll get back to you.
            You can also visit our{" "}
            <a href="https://guardians.lk/" target="_blank" rel="noopener noreferrer" className="link">
              site
            </a>{" "}
            for more info.
          </p>
        </section>

        <section className="card">
          <form onSubmit={submit} className="form">
            <div className="row-2">
              <label className="label">
                <span>First name*</span>
                <input
                  required
                  value={firstName}
                  onChange={(e)=>setFirstName(e.target.value)}
                  className="input"
                />
              </label>
              <label className="label">
                <span>Last name</span>
                <input
                  value={lastName}
                  onChange={(e)=>setLastName(e.target.value)}
                  className="input"
                />
              </label>
            </div>

            <label className="label block">
              <span>Email*</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="input"
              />
            </label>

            <label className="label block">
              <span>What can we help you with?*</span>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                className="textarea"
              />
            </label>

            {err && <div className="alert error">{err}</div>}
            {ok  && <div className="alert ok">Thanks! We’ll reply soon.</div>}

            <button type="submit" disabled={busy} className="btn">
              {busy ? "Sending…" : "Submit"}
            </button>
          </form>
        </section>
      </div>

      {/* Contact Security Team (above footer) */}
      <section className="contact-team">
        <h2 className="contact-team-title">Contact Security Team</h2>
        <div className="contact-cards-grid">
          <div className="contact-card">
            <div className="contact-icon-tile" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s7-4.438 7-11a7 7 0 10-14 0c0 6.562 7 11 7 11z" stroke="#0f172a" strokeWidth="1.5"/>
                <circle cx="12" cy="10" r="2.5" stroke="#0f172a" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Our Location</h3>
            <p className="contact-line">No:234,</p>
            <p className="contact-line">Weththewa Road, Madige, Galagedara</p>
            <p className="contact-line">Sri Lanka</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon-tile" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v2a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.92 4.18 2 2 0 014.86 2h2a2 2 0 012 1.72 12.65 12.65 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.65 12.65 0 002.81.7A2 2 0 0122 16.92z" stroke="#0f172a" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Phone</h3>
            <p className="contact-line"><strong>Security Desk:</strong> +94 77 878 9282</p>
            <p className="contact-line"><strong>Training Support:</strong> +94 78 778 9282</p>
            <p className="contact-line"><strong>Emergency:</strong> +94 77 314 2984</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon-tile" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16v16H4z" stroke="#0f172a" strokeWidth="1.5"/>
                <path d="M4 7l8 6 8-6" stroke="#0f172a" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Email</h3>
            <p className="contact-line"><strong>General:</strong> <a href="mailto:info@guardians.lk" className="contact-link">info@guardians.lk</a></p>
            <p className="contact-line"><strong>Training:</strong> <a href="mailto:info@guardians.lk" className="contact-link">info@guardians.lk</a></p>
            <p className="contact-line"><strong>Incidents:</strong> <a href="mailto:info@guardians.lk" className="contact-link">info@guardians.lk</a></p>
          </div>

          <div className="contact-card">
            <div className="contact-icon-tile" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#0f172a" strokeWidth="1.5"/>
                <path d="M12 7v5l3 3" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="contact-card-title">Support Hours</h3>
            <p className="contact-line">Monday - Friday: 9:00 AM - 5:00 PM</p>
            <p className="contact-line">Incident Response: 24/7</p>
            <p className="contact-line">Online Support: Always Available</p>
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
}
