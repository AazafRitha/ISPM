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
      </div>
      <Footer />
    </>
  );
}
