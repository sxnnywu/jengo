import React, { useState } from 'react';
import './OpportunityCard.css';

const OpportunityCard = ({ opportunity, onApply }) => {
  const [isSaved, setIsSaved] = useState(false);

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

  const getTimeAgo = (timeString) => {
    return timeString.toLowerCase();
  };

  return (
    <div className="opportunity-card">
      <div className="card-header">
        <div className="company-logo">
          {opportunity.logo || '🏢'}
        </div>
        <div className="card-meta">
          <span className="time-posted">{getTimeAgo(opportunity.postedTime)}</span>
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
          {opportunity.skills.map((skill, index) => (
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
              {isSaved ? '✓ Saved' : '🔖 Save'}
            </button>
            <button className="btn-apply" onClick={handleApply}>
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
