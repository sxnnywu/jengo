import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OpportunityCard.css';

const OpportunityCard = ({ opportunity, onApply, onClose, showApply = true, showStatus = true }) => {
  const [isSaved, setIsSaved] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
    return saved.includes(opportunity.id);
  });
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    const saved = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
    if (isSaved) {
      const updated = saved.filter(id => id !== opportunity.id);
      localStorage.setItem('savedOpportunities', JSON.stringify(updated));
    } else {
      localStorage.setItem('savedOpportunities', JSON.stringify([...saved, opportunity.id]));
    }
  };

  const handleApply = (e) => {
    e.stopPropagation();
    if (onApply) {
      onApply(opportunity.id);
    } else {
      alert(`Applied to ${opportunity.title} at ${opportunity.company}!`);
    }
  };

  const handleClose = (e) => {
    e.stopPropagation();
    if (onClose) {
      onClose(opportunity.id);
    }
  };

  const getTimeAgo = (timeString) => {
    return timeString.toLowerCase();
  };

  const skills = opportunity.skillsRequired || opportunity.skills || [];
  const isClosed = opportunity.status === 'closed';
  const workMode =
    opportunity.workMode ||
    (typeof opportunity.location === 'string' && opportunity.location.toLowerCase() === 'remote'
      ? 'Remote'
      : 'In person');

  return (
    <div className="opportunity-card" onClick={() => navigate(`/opportunities/${opportunity.id}`)}>
      <div className="card-header">
        <div className="company-logo">
          {opportunity.logo ? (
            <img src={opportunity.logo} alt="" className="company-logo-img" />
          ) : (
            <span className="company-logo-fallback">
              {(opportunity.company || '?').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="card-meta">
          <span className="time-posted">{getTimeAgo(opportunity.postedTime)}</span>
          {showStatus && (
            <span className={`status-pill ${isClosed ? 'closed' : 'open'}`}>
              {isClosed ? 'Closed' : workMode}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{opportunity.title}</h3>
        <p className="company-name">{opportunity.company}</p>
        <p className="card-location">{opportunity.location}</p>
        <p className="card-deadline">Deadline: {opportunity.deadline}</p>
        
        <p className="card-description">
          {opportunity.description}
        </p>

        <div className="card-skills">
          {skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>

        <div className="card-footer">
          <div className="card-hours">
            <span className="hours-label">Estimated Hours:</span>
            <span className="hours-value">{opportunity.estimatedHours}</span>
          </div>
          <div className="card-actions">
            <button 
              className={`btn-save ${isSaved ? 'saved' : ''}`}
              onClick={handleSave}
              title={isSaved ? 'Unsave' : 'Save'}
            >
              {isSaved ? 'Saved' : 'Save'}
            </button>
            {showApply && (
              <button className="btn-apply" onClick={handleApply} disabled={isClosed}>
                {isClosed ? 'Closed' : 'Apply'}
              </button>
            )}
            {!showApply && onClose && (
              <button className="btn-apply" onClick={handleClose} disabled={isClosed}>
                {isClosed ? 'Closed' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
