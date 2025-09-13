import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="mm-footer">
      <div className="mm-footer-wrap">
        <div className="mm-columns">
          <div className="mm-col">
            <div className="mm-brandline">
              <img className="mm-logo-sm" src="/logo192.png" alt="MannMitra logo" />
              <div className="mm-brandtext">
                <div className="mm-wordmark">MannMitra</div>
                <div className="mm-tagline">Walk together, heal together</div>
              </div>
            </div>
            <p className="mm-disclaimer">MannMitra provides support but is not a substitute for professional care.</p>
            <div className="mm-emergency-cards">
              <div className="mm-card"><div className="mm-card-title">Police</div><div className="mm-card-num">100</div></div>
              <div className="mm-card"><div className="mm-card-title">Ambulance</div><div className="mm-card-num">102</div></div>
              <div className="mm-card"><div className="mm-card-title">National Helpline</div><div className="mm-card-num">1800-599-0019</div></div>
            </div>
            <div className="mm-helpline-note">
              Need help now? Call 100 · <Link to="#">See local helplines</Link>
            </div>
          </div>

          <div className="mm-col">
            <div className="mm-section-title">Quick Actions</div>
            <ul className="mm-linklist">
              <li><Link to="/chat">Start Chat</Link></li>
              <li><Link to="/mood">Log Mood</Link></li>
              <li><Link to="/activities">3‑min Exercise</Link></li>
              <li><Link to="/profile">Find Counselors</Link></li>
              <li><Link to="/crisis">Crisis Resources</Link></li>
            </ul>

            <div className="mm-section-title">Local Helplines</div>
            <div className="mm-inputrow">
              <input className="mm-input" placeholder="Enter city (e.g., Mumbai)" aria-label="City" />
              <button className="mm-btn">Show</button>
            </div>
          </div>

          <div className="mm-col">
            <div className="mm-section-title">Stay Connected</div>
            <div className="mm-inputrow">
              <input className="mm-input" placeholder="Email address" aria-label="Email" />
              <button className="mm-btn">Subscribe</button>
            </div>
            <label className="mm-consent"><input type="checkbox" /> I agree to receive emails as per the Privacy Policy</label>

            <div className="mm-section-title">Language & Accessibility</div>
            <div className="mm-chips">
              <button className="mm-chip">हिंदी</button>
              <button className="mm-chip">English</button>
              <button className="mm-chip">A‑</button>
              <button className="mm-chip">A+</button>
              <button className="mm-chip">High Contrast</button>
            </div>
          </div>
        </div>

        <div className="mm-divider" />

        <div className="mm-meta">
          <div className="mm-impact">
            <span><strong>12,540</strong> conversations supported</span>
            <span><strong>4.7/5</strong> average session rating</span>
          </div>
          <div className="mm-privacy">Anonymous by default. We encrypt your data and respect your privacy.</div>
        </div>

        <div className="mm-footer-bottom">
          <div className="mm-legal-links">
            <Link to="#">Terms</Link>
            <Link to="#">Privacy</Link>
            <Link to="#">Data Use</Link>
            <Link to="#">Cookie settings</Link>
          </div>
          <div className="mm-copy">© {new Date().getFullYear()} MannMitra</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


