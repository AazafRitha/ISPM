// Author: Aazaf Ritha
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "../../assets/guardians-logo.png";
import "./Header.css";

import { getAuth, isLoggedIn, getDashboardPath, logout, onAuthChange, login } from "../../lib/auth";

function cn(...a) { return a.filter(Boolean).join(" "); }

export default function Header() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  // auth -> toggles Login/Logout
  const [auth, setAuth] = useState(getAuth());
  useEffect(() => onAuthChange(() => setAuth(getAuth())), []);

  // underline on all /employee/learn/* and /employee/quizzes/*
  const eduActive = pathname.startsWith("/employee/learn");
  const quizActive = pathname.startsWith("/employee/quizzes");
  
  // underline when on admin dashboard routes
  const adminActive = pathname.startsWith("/admin");
  
  // Debug logging
  console.log("Current pathname:", pathname);
  console.log("Admin active:", adminActive);
  console.log("Dashboard button should be active:", adminActive);

  // mobile menu
  const [open, setOpen] = useState(false);

  const linkBase = "nav-link";
  const activeUnderline = "nav-link active";

  const goDashboard = () => {
    if (!isLoggedIn()) nav("/login");
    else nav(getDashboardPath());
  };

  const getStarted = () => {
    if (!isLoggedIn()) nav("/login");
    else nav(getDashboardPath());
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo (links out like the reference style) */}
        <a
          href="https://guardians.lk/"
          target="_blank"
          rel="noreferrer"
          className="logo-link"
          title="Guardians Solutions"
        >
          <img src={Logo} alt="Guardians Solutions" className="logo-img" />
        </a>

        {/* Desktop nav */}
        <nav className="nav-desktop">
          <NavLink
            to="/"
            end
            className={({ isActive }) => cn(linkBase, isActive && activeUnderline)}
          >
            Home
          </NavLink>

          {/* force underline when on /employee/learn/* */}
          <NavLink
            to="/employee/learn"
            className={({ isActive }) =>
              cn(
                linkBase,
                (isActive || eduActive) && activeUnderline
              )
            }
          >
            Educational Content
          </NavLink>

          {/* force underline when on /employee/quizzes/* */}
          <NavLink
            to="/employee/quizzes"
            className={({ isActive }) =>
              cn(
                linkBase,
                (isActive || quizActive) && activeUnderline
              )
            }
          >
            Training Quizzes
          </NavLink>

          <button
            type="button"
            onClick={goDashboard}
            className={cn("nav-button", adminActive && "active")}
            title="Dashboard"
          >
            Dashboard
          </button>

          <NavLink
            to="/contact"
            className={({ isActive }) => cn(linkBase, isActive && activeUnderline)}
          >
            Contact Us
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => cn(linkBase, isActive && activeUnderline)}
          >
            About Us
          </NavLink>
        </nav>

        {/* Right-side actions */}
        <div className="header-actions">
          <button
            onClick={getStarted}
            className="get-started-btn"
          >
            Get Started
          </button>

          {!auth.loggedIn ? (
            <button
              onClick={() => nav("/login")}
              className="login-btn"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => { logout(); nav("/"); }}
              className="logout-btn"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mobile-menu">
          <div className="mobile-menu-container">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn("mobile-nav-link", isActive && "active")}
            >
              Home
            </NavLink>
            <NavLink
              to="/employee/learn"
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn("mobile-nav-link", (isActive || eduActive) && "active")}
            >
              Educational Content
            </NavLink>
            <NavLink
              to="/employee/quizzes"
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn("mobile-nav-link", (isActive || quizActive) && "active")}
            >
              Training Quizzes
            </NavLink>
            <button
              onClick={() => { setOpen(false); goDashboard(); }}
              className={cn("mobile-nav-button", adminActive && "active")}
            >
              Dashboard
            </button>
            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn("mobile-nav-link", isActive && "active")}
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn("mobile-nav-link", isActive && "active")}
            >
              About Us
            </NavLink>

            <div className="mobile-actions">
              <button
                onClick={() => { setOpen(false); getStarted(); }}
                className="mobile-get-started-btn"
              >
                Get Started
              </button>

              {!auth.loggedIn ? (
                <button
                  onClick={() => { setOpen(false); nav("/login"); }}
                  className="mobile-login-btn"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => { setOpen(false); logout(); nav("/"); }}
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
