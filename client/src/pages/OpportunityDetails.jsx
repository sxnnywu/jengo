import React, { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './OpportunityDetails.css';
import { mockOpportunities, mockApplications } from '../utils/mockData';

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}${Date.now()}`;
}

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  const opportunity = useMemo(() => {
    const storedOpportunities = JSON.parse(localStorage.getItem('opportunities') || 'null');
    const allOpportunities = Array.isArray(storedOpportunities) && storedOpportunities.length > 0
      ? storedOpportunities
      : mockOpportunities;
    return allOpportunities.find((opp) => opp.id === id) || null;
  }, [id]);

  const [, setSavedTick] = useState(0);
  const saved = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
  const isSaved = saved.includes(id);

  if (!opportunity) {
    return (
      <div className="opportunity-details-page">
        <div className="opportunity-details-card">
          <h2>Opportunity not found</h2>
          <p>We couldn't find that opportunity.</p>
          <button className="btn btn-primary" onClick={() => navigate('/opportunities')}>
            Back to Opportunities
          </button>
        </div>
      </div>
    );
  }

  const skills = opportunity.skillsRequired || opportunity.skills || [];
  const isClosed = opportunity.status === 'closed';
  const isVolunteer = currentUser?.role === 'volunteer';
  const workMode =
    opportunity.workMode ||
    (typeof opportunity.location === 'string' && opportunity.location.toLowerCase() === 'remote'
      ? 'Remote'
      : 'In person');

  const handleSave = () => {
    if (saved.includes(opportunity.id)) {
      const updated = saved.filter((savedId) => savedId !== opportunity.id);
      localStorage.setItem('savedOpportunities', JSON.stringify(updated));
    } else {
      localStorage.setItem('savedOpportunities', JSON.stringify([...saved, opportunity.id]));
    }
    setSavedTick((t) => t + 1);
  };

  const handleApply = () => {
    if (!isVolunteer) {
      navigate('/login');
      return;
    }
    if (isClosed) {
      alert('This opportunity is closed.');
      return;
    }

    const storedApplications = JSON.parse(localStorage.getItem('applications') || 'null');
    const allApplications = Array.isArray(storedApplications) && storedApplications.length > 0
      ? storedApplications
      : mockApplications;
    const duplicate = allApplications.some(
      (app) => app.opportunityId === opportunity.id && app.volunteerId === currentUser?.id
    );

    if (duplicate) {
      alert('You have already applied to this opportunity.');
      return;
    }

    const newApplication = {
      id: makeId('app'),
      opportunityId: opportunity.id,
      volunteerId: currentUser?.id || 'vol1',
      volunteerName: currentUser?.name || 'You',
      volunteerEmail: currentUser?.email || 'you@example.com',
      volunteerSchool: currentUser?.school || 'Your School',
      volunteerSkills: currentUser?.skills || ['General'],
      volunteerResume: currentUser?.resume || '',
      volunteerForm: currentUser?.volunteerForm || '',
      status: 'applied',
      appliedAt: nowIso(),
      opportunityTitle: opportunity.title
    };

    const updatedApplications = [...allApplications, newApplication];
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    alert(`Applied to ${opportunity.title}!`);
  };

  return (
    <div className="opportunity-details-page">
      <div className="opportunity-details-card">
        <div className="details-header">
          <div className="details-logo">
            {opportunity.logo ? (
              <img src={opportunity.logo} alt="" className="details-logo-img" />
            ) : (
              <span className="details-logo-fallback">
                {(opportunity.company || '?').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1>{opportunity.title}</h1>
            <p className="details-company">{opportunity.company}</p>
            <p className="details-location">{opportunity.location}</p>
          </div>
        </div>

        <div className="details-meta">
          <span className={`status-pill ${isClosed ? 'closed' : 'open'}`}>
            {isClosed ? 'Closed' : workMode}
          </span>
          <span>Category: {opportunity.category}</span>
          <span>Estimated hours: {opportunity.estimatedHours}</span>
          <span>Deadline: {opportunity.deadline}</span>
        </div>

        <div className="details-description">
          <h3>About this opportunity</h3>
          <p>{opportunity.description}</p>
        </div>

        <div className="details-skills">
          <h3>Skills required</h3>
          <div className="skills-tags">
            {skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="details-actions">
          <button className={`btn-save ${isSaved ? 'saved' : ''}`} onClick={handleSave}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="btn-apply" onClick={handleApply} disabled={isClosed}>
            {isClosed ? 'Closed' : isVolunteer ? 'Apply Now' : 'Sign in to Apply'}
          </button>
          <Link to="/opportunities" className="btn btn-secondary">
            Back to Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;
