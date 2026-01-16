import React from 'react';
import './ApplicationCard.css';

const ApplicationCard = ({ application, onAccept, onReject }) => {
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
      applied: { text: 'Applied', class: 'status-applied' },
      accepted: { text: 'Accepted', class: 'status-accepted' },
      rejected: { text: 'Rejected', class: 'status-rejected' }
    };
    return badges[status] || badges.applied;
  };

  const status = getStatusBadge(application.status);

  return (
    <div className="application-card">
      <div className="application-header">
        <div className="applicant-info">
          <div className="applicant-avatar">
            {application.volunteerName.charAt(0)}
          </div>
          <div>
            <h3 className="applicant-name">{application.volunteerName}</h3>
            <p className="applicant-email">{application.volunteerEmail}</p>
          </div>
        </div>
        <span className={`status-badge ${status.class}`}>
          {status.text}
        </span>
      </div>

      <div className="application-details">
        <div className="detail-item">
          <span className="detail-label">School:</span>
          <span className="detail-value">{application.volunteerSchool}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Applied:</span>
          <span className="detail-value">{formatDate(application.appliedAt)}</span>
        </div>
        {application.reviewedAt && (
          <div className="detail-item">
            <span className="detail-label">Reviewed:</span>
            <span className="detail-value">{formatDate(application.reviewedAt)}</span>
          </div>
        )}
      </div>

      <div className="application-skills">
        <span className="skills-label">Skills:</span>
        <div className="skills-list">
          {application.volunteerSkills.map((skill, index) => (
            <span key={index} className="skill-badge">{skill}</span>
          ))}
        </div>
      </div>

      {application.status === 'applied' && (
        <div className="application-actions">
          <button
            className="btn btn-accept"
            onClick={() => onAccept(application.id)}
          >
            Accept
          </button>
          <button
            className="btn btn-reject"
            onClick={() => onReject(application.id)}
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default ApplicationCard;
