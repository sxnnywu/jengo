import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div className="about-hero__copy">
            <p className="about-hero__eyebrow">About Jengo</p>
            <h1 className="about-hero__title">Volunteer matching that feels human.</h1>
            <p className="about-hero__subtitle">
              Jengo makes it simple to find one-time opportunities, while the Jengo Bird
              matches your skills to the nonprofits that need them most.
            </p>
            <div className="about-hero__pillars">
              <div>
                <span>Fast applications</span>
                <p>Apply in minutes, not days.</p>
              </div>
              <div>
                <span>Skill-based matches</span>
                <p>Real fit, not random.</p>
              </div>
            </div>
          </div>
          <div className="about-hero__visual">
            <div className="about-hero__badge">Jengo Bird Match</div>
            <div className="about-hero__card about-hero__card--primary">
              <h3>One-time opportunities</h3>
              <p>Clean, current, and easy to say yes to.</p>
            </div>
            <div className="about-hero__card about-hero__card--accent">
              <h3>Nonprofit-ready</h3>
              <p>Listings that are clear, real, and open right now.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cinematic">
        <div className="container about-cinematic__grid">
          <div className="about-cinematic__panel about-cinematic__panel--dark">
            <h2>Why we exist</h2>
            <p>
              People are ready to help, but the path to impact is often cluttered with
              long forms, vague listings, and slow replies. We built Jengo so volunteering
              feels personal and possible. When someone raises their hand to help, they
              should be met with clarity, warmth, and a real chance to show up.
            </p>
          </div>
          <div className="about-cinematic__panel about-cinematic__panel--light">
            <h2>How it works</h2>
            <ol>
              <li>Browse one-time opportunities that match your time and interests.</li>
              <li>Apply in minutes with a clean, lightweight flow.</li>
              <li>Let Jengo Bird match your skills to the right nonprofit needs.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container about-cta__content">
          <div>
            <h2>Ready to make an impact?</h2>
            <p>Find a one-time opportunity OR let Jengo Bird bring the right match to you.</p>
          </div>
          <div className="about-cta__actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/opportunities" className="btn btn-secondary btn-large">
              Browse Opportunities
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
