import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content footer-content--clean">
          <div className="footer-section">
            <h4>Links</h4>
            <ul>
              <li><Link to="/opportunities">Browse Opportunities</Link></li>
              <li><Link to="/#how-it-works">How It Works</Link></li>
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/register">Get started</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@jengo.app">support@jengo.app</a></li>
              <li><Link to="/login">Post Opportunity</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Jengo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
