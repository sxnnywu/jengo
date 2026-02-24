import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  likeVolunteerProfile,
  getPitchVideoUrl,
  getProfilePhotoUrl,
  setOutreachMessage,
  resolveMediaUrl
} from '../utils/matchmaking';
import { mockVolunteers } from '../utils/mockData';
import './NetworkView.css';

const PlayIcon = () => (
  <svg className="btn-play-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const SKILL_OPTIONS = [
  'Writing', 'Research', 'Communication', 'Grant Writing', 'Nonprofit', 'Social Media',
  'Content Creation', 'Design', 'Marketing', 'Outreach', 'Event Planning', 'Public Speaking',
  'Community Engagement', 'Organization', 'Web Development', 'HTML/CSS', 'JavaScript',
  'WordPress', 'Data Analysis', 'Excel', 'Analytics', 'Reporting', 'Project Management',
  'Fundraising', 'Networking'
];

const INTEREST_OPTIONS = [
  'Education', 'Healthcare', 'Community', 'Youth', 'Technology', 'Environment',
  'Food Security', 'Human Rights', 'Arts', 'Culture'
];

const NetworkView = ({ applications, myOpportunities, nonprofitId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');
  const [reachOutVolunteer, setReachOutVolunteer] = useState(null);
  const [reachOutOpportunityId, setReachOutOpportunityId] = useState('');
  const [reachOutNote, setReachOutNote] = useState('');
  const [playingVideoVolunteerId, setPlayingVideoVolunteerId] = useState(null);

  const allVolunteers = useMemo(() => {
    const fromApps = new Map();
    applications.forEach((app) => {
      if (!fromApps.has(app.volunteerId)) {
        fromApps.set(app.volunteerId, {
          id: app.volunteerId,
          name: app.volunteerName,
          email: app.volunteerEmail,
          school: app.volunteerSchool,
          skills: app.volunteerSkills || [],
          interests: []
        });
      }
    });
    const combined = [...mockVolunteers];
    fromApps.forEach((v) => {
      if (!combined.some((c) => c.id === v.id)) {
        combined.push(v);
      }
    });
    return combined;
  }, [applications]);

  const filteredVolunteers = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    const skill = (skillFilter || '').toLowerCase().trim();
    const interest = (interestFilter || '').toLowerCase().trim();

    return allVolunteers.filter((vol) => {
      if (q) {
        const searchText = [
          vol.name || '',
          vol.email || '',
          vol.school || '',
          (vol.skills || []).join(' '),
          (vol.interests || []).join(' ')
        ].join(' ').toLowerCase();
        if (!searchText.includes(q)) return false;
      }
      if (skill) {
        const skills = (vol.skills || []).map((s) => String(s).toLowerCase());
        if (!skills.some((s) => s === skill)) return false;
      }
      if (interest) {
        const interests = (vol.interests || []).map((i) => String(i).toLowerCase());
        if (!interests.some((i) => i === interest)) return false;
      }
      return true;
    });
  }, [allVolunteers, searchQuery, skillFilter, interestFilter]);

  const handleReachOutClick = (vol) => {
    setReachOutVolunteer(vol);
    setReachOutOpportunityId(myOpportunities[0]?.id || '');
    setReachOutNote('');
  };

  const handleReachOutConfirm = () => {
    if (!reachOutVolunteer || !reachOutOpportunityId) return;
    likeVolunteerProfile(nonprofitId, reachOutVolunteer.id);
    setOutreachMessage(nonprofitId, reachOutVolunteer.id, reachOutOpportunityId, reachOutNote);
    setReachOutVolunteer(null);
    setReachOutOpportunityId('');
    setReachOutNote('');
  };

  return (
    <div className="network-view">
      <div className="network-search-toolbar">
        <div className="network-search-row">
          <div className="network-search-input-wrap">
            <span className="network-search-icon" aria-hidden>🔍</span>
            <input
              type="search"
              className="network-search-input"
              placeholder="Search by name, email, school, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search volunteers"
            />
          </div>
        </div>
        <div className="network-filters-row">
          <div className="network-filter-group">
            <label htmlFor="network-skill-filter">Skill</label>
            <select
              id="network-skill-filter"
              className="network-filter-select"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="">All skills</option>
              {SKILL_OPTIONS.map((s) => (
                <option key={s} value={s.toLowerCase()}>{s}</option>
              ))}
            </select>
          </div>
          <div className="network-filter-group">
            <label htmlFor="network-interest-filter">Interest</label>
            <select
              id="network-interest-filter"
              className="network-filter-select"
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
            >
              <option value="">All interests</option>
              {INTEREST_OPTIONS.map((i) => (
                <option key={i} value={i.toLowerCase()}>{i}</option>
              ))}
            </select>
          </div>
          {(searchQuery || skillFilter || interestFilter) && (
            <button
              type="button"
              className="network-clear-filters"
              onClick={() => {
                setSearchQuery('');
                setSkillFilter('');
                setInterestFilter('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="network-results-header">
        <span className="network-results-count">
          {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="network-volunteers-list">
        {filteredVolunteers.length > 0 ? (
          filteredVolunteers.map((vol) => {
            const pitchUrl = getPitchVideoUrl(vol.id);
            const photoUrl = getProfilePhotoUrl(vol.id);
            return (
              <div key={vol.id} className="network-volunteer-card">
                <div className="network-volunteer-avatar">
                  {photoUrl ? (
                    <img src={resolveMediaUrl(photoUrl)} alt="" className="network-volunteer-avatar-img" />
                  ) : (
                    <span className="network-volunteer-avatar-fallback">
                      {(vol.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="network-volunteer-main">
                  <div className="network-volunteer-name">{vol.name}</div>
                  <div className="network-volunteer-email">{vol.email}</div>
                  <div className="network-volunteer-meta">{vol.school || 'No school'}</div>
                  <div className="network-volunteer-skills">
                    {(vol.skills || []).map((s) => (
                      <span key={s} className="network-volunteer-skill">{s}</span>
                    ))}
                    {(vol.interests || []).map((i) => (
                      <span key={i} className="network-volunteer-skill interest">{i}</span>
                    ))}
                  </div>
                </div>
                <div className="network-volunteer-actions">
                  <button
                    type="button"
                    className="btn-reach-out"
                    onClick={() => handleReachOutClick(vol)}
                  >
                    Reach Out
                  </button>
                  {pitchUrl && (
                    <button
                      type="button"
                      className="btn-introduction"
                      onClick={() => setPlayingVideoVolunteerId(playingVideoVolunteerId === vol.id ? null : vol.id)}
                    >
                      Intro <PlayIcon />
                    </button>
                  )}
                </div>
                {playingVideoVolunteerId === vol.id && pitchUrl && (
                  <div className="network-volunteer-video-wrap">
                    <video
                      src={resolveMediaUrl(pitchUrl)}
                      controls
                      autoPlay
                      className="network-volunteer-video"
                      onEnded={() => setPlayingVideoVolunteerId(null)}
                    />
                    <button
                      type="button"
                      className="btn-close-video"
                      onClick={() => setPlayingVideoVolunteerId(null)}
                      aria-label="Close video"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="network-empty">
            <p>No volunteers match your search. Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {reachOutVolunteer &&
        createPortal(
          <div
            className="network-reach-out-overlay"
            onClick={(e) => e.target === e.currentTarget && setReachOutVolunteer(null)}
          >
            <div className="network-reach-out-panel" onClick={(e) => e.stopPropagation()}>
              <div className="network-reach-out-header">
                <h3>Reach Out</h3>
                <button
                  type="button"
                  className="network-reach-out-close"
                  onClick={() => setReachOutVolunteer(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="network-reach-out-body">
                <div className="network-reach-out-card">
                  <div className="network-volunteer-avatar">
                    {getProfilePhotoUrl(reachOutVolunteer.id) ? (
                      <img
                        src={resolveMediaUrl(getProfilePhotoUrl(reachOutVolunteer.id))}
                        alt=""
                        className="network-volunteer-avatar-img"
                      />
                    ) : (
                      <span className="network-volunteer-avatar-fallback">
                        {(reachOutVolunteer.name || '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="network-volunteer-main">
                    <div className="network-volunteer-name">{reachOutVolunteer.name}</div>
                    <div className="network-volunteer-email">{reachOutVolunteer.email}</div>
                  </div>
                </div>
                <div className="network-reach-out-form-group">
                  <label htmlFor="reach-out-opportunity">Opportunity</label>
                  <select
                    id="reach-out-opportunity"
                    className="network-reach-out-select"
                    value={reachOutOpportunityId}
                    onChange={(e) => setReachOutOpportunityId(e.target.value)}
                  >
                    {myOpportunities.map((opp) => (
                      <option key={opp.id} value={opp.id}>{opp.title}</option>
                    ))}
                    {myOpportunities.length === 0 && (
                      <option value="">No opportunities posted</option>
                    )}
                  </select>
                </div>
                <div className="network-reach-out-form-group">
                  <label htmlFor="reach-out-note">Add a note (optional)</label>
                  <textarea
                    id="reach-out-note"
                    className="network-reach-out-note"
                    rows={4}
                    placeholder="Introduce yourself and why you're interested in this volunteer..."
                    value={reachOutNote}
                    onChange={(e) => setReachOutNote(e.target.value)}
                  />
                </div>
                <div className="network-reach-out-actions">
                  <button
                    type="button"
                    className="btn-reach-out"
                    onClick={handleReachOutConfirm}
                    disabled={!reachOutOpportunityId || myOpportunities.length === 0}
                  >
                    Reach Out
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default NetworkView;
