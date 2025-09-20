// Author: Aazaf Ritha (plain CSS version)
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "./aup.css";

export default function Aup() {
  return (
    <>
      <Header />
      <div className="aup-wrap">
      <h1 className="aup-h1">Acceptable Use Policy (AUP) &amp; User Guide</h1>

      <p className="aup-p">
        This guide outlines how to use Guardians systems responsibly. Please read carefully
        before using the portal and corporate resources.
      </p>

      <div className="aup-card">
        <h2 className="aup-h2">Key points</h2>
        <ul className="aup-list">
          <li>Protect company and customer data at all times.</li>
          <li>Use strong, unique passwords and enable MFA where available.</li>
          <li>Only install approved software and report suspicious emails.</li>
          <li>Do not share credentials or access tokens.</li>
          <li>Follow all local laws and company security standards.</li>
        </ul>
      </div>

      <p className="aup-p">
        After reading, please{" "}
        <Link to="/aup/sign" className="aup-link">sign/acknowledge the AUP</Link>.
      </p>
      </div>
      <Footer />
    </>
  );
}
