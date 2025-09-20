// Author: Aazaf Ritha (plain CSS version)
import { useState } from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./aup.css";

export default function AupSign() {
  const [checked, setChecked] = useState(false);
  const [savedAt, setSavedAt] = useState(localStorage.getItem("aupAcceptedAt") || "");

  function submit() {
    if (!checked) return;
    const ts = new Date().toISOString();
    localStorage.setItem("aupAcceptedAt", ts);
    setSavedAt(ts);
    alert("AUP acknowledged. Thank you!");
  }

  return (
    <>
      <Header />
      <div className="aup-wrap">
      <h1 className="aup-h1">AUP Acknowledgement</h1>

      <div className="aup-card">
        <label className="aup-checkbox">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>
            I have read and agree to follow the Guardians Acceptable Use Policy and User Guide.
          </span>
        </label>

        <button
          onClick={submit}
          disabled={!checked}
          className="aup-btn aup-btn-primary"
        >
          Sign AUP
        </button>

        {savedAt && (
          <p className="aup-meta">Last acknowledged: {new Date(savedAt).toLocaleString()}</p>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}
