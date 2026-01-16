import React from 'react';
import './VolunteerApplicationCard.css';

const VolunteerApplicationCard = ({ application, opportunity }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      applied: { text: 'Applied', class: 'status-applied', icon: '⏳' },
      accepted: { text: 'Accepted', class: 'status-accepted', icon: '✓' },
      rejected: { text: 'Rejected', class: 'status-rejected', icon: '✗' }
    };
    return badges[status] || badges.applied;
  };

  const status = getStatusBadge(application.status);

  return (
    <div className="volunteer-application-card">
      <div className="card-header">
        <div className="opportunity-info">
          <h3 className="opportunity-title">{application.opportunityTitle || opportunity?.title}</h3>
          <p className="company-name">{opportunity?.company || 'Company'}</p>
          <p className="location">{opportunity?.location || 'Location'}</p>
        </div>
        <span className={`status-badge ${status.class}`}>
          <span className="status-icon">{status.icon}</span>
          {status.text}
        </span>
      </div>

      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">Applied:</span>
          <span className="detail-value">{formatDate(application.appliedAt)}</span>
        </div>
        {application.reviewedAt && (
          <div className="detail-row">
            <span className="detail-label">Reviewed:</span>
            <span className="detail-value">{formatDate(application.reviewedAt)}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Estimated Hours:</span>
          <span className="detail-value">{opportunity?.estimatedHours || 'N/A'} hours</span>
        </div>
      </div>

      {application.status === 'accepted' && (
        <div className="acceptance-message">
          <p>🎉 Congratulations! You've been accepted for this opportunity.</p>
        </div>
      )}

      {application.status === 'rejected' && (
        <div className="rejection-message">
          <p>Unfortunately, you were not selected for this opportunity. Keep applying!</p>
        </div>
      )}
    </div>
  );
};

export default VolunteerApplicationCard;
