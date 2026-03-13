import React, { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../utils/matchmaking';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { normalizeOpportunity } from '../utils/apiTransform';
import './OpportunityDetails.css';

const OpportunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [, setSavedTick] = useState(0);
  const saved = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
  const isSaved = saved.includes(id);

  useEffect(() => {
    if (!id) return;
    api.getOpportunity(id)
      .then((data) => {
        if (data.opportunity) {
          setOpportunity(normalizeOpportunity(data.opportunity));
        } else {
          setOpportunity(null);
        }
      })
      .catch(() => setOpportunity(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!currentUser?.id || currentUser?.role !== 'volunteer' || !id) return;
    api.getMyApplications()
      .then((data) => {
        const apps = data.applications || [];
        const applied = apps.some((a) => {
          const oppId = a.opportunity?._id || a.opportunity || a.opportunityId;
          return oppId?.toString() === id;
        });
        setHasApplied(applied);
      })
      .catch(() => {});
  }, [currentUser?.id, currentUser?.role, id]);

  if (loading) {
    return (
      <div className="opportunity-details-page">
        <div className="opportunity-details-card">
          <p>Loading…</p>
        </div>
      </div>
    );
  }

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

  const handleApply = async () => {
    if (!isVolunteer) {
      navigate('/login');
      return;
    }
    if (isClosed) {
      alert('This opportunity is closed.');
      return;
    }
    if (hasApplied) {
      alert('You have already applied to this opportunity.');
      return;
    }
    try {
      const data = await api.applyToOpportunity(opportunity.id);
      if (data.application) {
        setHasApplied(true);
        alert(`Applied to ${opportunity.title}!`);
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (err) {
      alert(err?.message || 'Failed to apply');
    }
  };

  return (
    <div className="opportunity-details-page">
      <div className="opportunity-details-card">
        <div className="details-header">
          <div className="details-logo">
            {opportunity.logo ? (
              <img src={resolveMediaUrl(opportunity.logo)} alt="" className="details-logo-img" />
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
          <button className="btn-apply" onClick={handleApply} disabled={isClosed || hasApplied}>
            {isClosed ? 'Closed' : hasApplied ? 'Applied' : isVolunteer ? 'Apply Now' : 'Sign in to Apply'}
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
