import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import logo from '../assets/jengologo.png';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src={logo} alt="Jengo" className="hero-logo" />
          <p className="hero-subtitle">
            Find volunteer tasks. Get accepted. Earn hours and experience.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Volunteers
            </Link>
            <Link to="/register?role=nonprofit" className="btn btn-secondary">
              Nonprofits
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Jengo?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>One-Click Apply</h3>
              <p>
                Apply to volunteer opportunities with just one click. 
                Share your profile and documents instantly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏢</div>
              <h3>Nonprofit Partners</h3>
              <p>
                Connect with verified nonprofits offering meaningful 
                volunteer experiences and skill development.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Your Impact</h3>
              <p>
                Monitor your volunteer hours, applications, and 
                build your experience portfolio.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Build Your Resume</h3>
              <p>
                Gain real-world experience and skills that matter 
                to future employers and educational institutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up as a volunteer or nonprofit and complete your profile</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse Opportunities</h3>
              <p>Explore volunteer opportunities that match your interests and skills</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Apply & Connect</h3>
              <p>Apply with one click and connect with nonprofits</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Make an Impact</h3>
              <p>Start volunteering and track your hours and achievements</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of volunteers and nonprofits making an impact</p>
          <Link to="/register" className="btn btn-primary btn-large">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
