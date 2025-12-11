import React from "react";
import { useNavigate } from "react-router-dom";
import "./SpawHome.css";

const SpawHome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="spaw-home-modern">
      {/* NAVIGATION */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-text">SPaW</span>
          </div>

          <nav className="main-nav">
            <a href="#dashboard" className="nav-link">Dashboard</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
          </nav>

          <div className="auth-buttons">
            <button
              className="btn-secondary"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
            >
              Get started free
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Productivity that
              <span className="hero-title-accent">supports your life.</span>
            </h1>

            <div className="hero-description">
              <div className="description-block">
                <h3>Who are we?</h3>
                <p>
                  SPaW is your smart personal assistant for tasks, focus,
                  and time—built for students and busy people with big goals.
                </p>
              </div>

              <div className="description-block">
                <h3>What do we do?</h3>
                <p>
                  We keep your tasks, reminders, focus sessions, and commute
                  time in one clean, simple dashboard.
                </p>
              </div>

              <div className="description-block">
                <h3>How do we help?</h3>
                <p>
                  Capture to-dos, protect your focus, and know exactly when to
                  leave for what matters—without juggling five different apps.
                </p>
              </div>
            </div>

            <div className="hero-cta">
              <button
                className="cta-primary"
                onClick={() => navigate("/register")}
              >
                Start using SPaW
              </button>
              <button
                className="cta-secondary"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </button>
            </div>

            <p className="hero-note">No credit card. Just a clearer day in under 5 minutes.</p>
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section id="dashboard" className="dashboard-preview-section">
          <div className="preview-container">
            <div className="preview-header">
              <span>Today · Your Dashboard</span>
              <span className="preview-badge">Live preview</span>
            </div>

            <div className="preview-cards">
              {/* Tasks Card */}
              <div className="preview-card">
                <div className="card-header">
                  <h3>Tasks & Reminders</h3>
                  <span className="badge">3 due</span>
                </div>
                <ul className="task-list">
                  <li>
                    <span>Finish Econ homework</span>
                    <span className="time">6:00 PM</span>
                  </li>
                  <li>
                    <span>Prepare meeting notes</span>
                    <span className="time">2:00 PM</span>
                  </li>
                  <li>
                    <span>Grocery run</span>
                    <span className="time">5:30 PM</span>
                  </li>
                </ul>
              </div>

              {/* Weather Card */}
              <div className="preview-card">
                <h3>Today · Weather</h3>
                <div className="weather-display">
                  <div className="temp-badge">72°</div>
                  <div className="weather-desc">Sunny · 0% chance of rain</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="features-section">
          <h2 className="section-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h4>Tasks & Reminders</h4>
              <p>Never forget what matters with intelligent task management</p>
            </div>
            <div className="feature-card">
              <h4>Focus Sessions</h4>
              <p>Deep work made simple with built-in focus timers</p>
            </div>
            <div className="feature-card">
              <h4>Live Weather</h4>
              <p>Real-time weather data for better planning</p>
            </div>
            <div className="feature-card">
              <h4>Simple Analytics</h4>
              <p>Track your productivity without complexity</p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="how-section">
          <h2 className="section-title">How it works</h2>
          <p className="section-subtitle">A simple workflow: capture, prioritize, and act.</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Capture Everything</h4>
              <p>Add tasks, set reminders, and track your time in seconds</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Stay Focused</h4>
              <p>Use the built-in stopwatch to track deep work sessions</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Get It Done</h4>
              <p>Check off tasks and watch your productivity soar</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="home-footer">
          <div className="footer-content">
            <p>&copy; 2025 SPaW. Built with privacy-first principles and a focus on simplicity.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SpawHome;
