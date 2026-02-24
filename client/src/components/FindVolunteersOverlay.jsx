import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import './FindVolunteersOverlay.css';
import {
  likeVolunteerProfile,
  getPitchVideoUrl,
  getProfilePhotoUrl,
  setOutreachMessage,
  resolveMediaUrl
} from '../utils/matchmaking';
import { mockVolunteers } from '../utils/mockData';

const PlayIcon = () => (
  <svg className="btn-play-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
);

function extractKeywords(text, max = 20) {
  const stop = new Set([
    'a','an','and','are','as','at','be','but','by','for','from','has','have','i','in','is','it','its','of','on',
    'or','our','so','that','the','their','they','this','to','was','we','were','with','you','your'
  ]);
  const tokens = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k]) => k);
}

function getMatchingVolunteers(opportunity, allVolunteers, applicantVolunteerIds) {
  const keywords = opportunity.keywords && opportunity.keywords.length > 0
    ? opportunity.keywords
    : extractKeywords(
        [
          opportunity.description || '',
          (opportunity.skillsRequired || []).join(' '),
          opportunity.category || '',
          opportunity.title || ''
        ].join(' ')
      );

  return allVolunteers
    .filter((v) => !applicantVolunteerIds.has(v.id))
    .map((vol) => {
      const profileText = [
        (vol.skills || []).join(' '),
        (vol.interests || []).join(' '),
        vol.matchingText || ''
      ].join(' ').toLowerCase();
      const score = keywords.length === 0
        ? 1
        : keywords.reduce((acc, k) => {
            if (!k) return acc;
            if (profileText.includes(String(k).toLowerCase())) return acc + 1;
            return acc;
          }, 0);
      return { vol, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.vol);
}

const FindVolunteersOverlay = ({
  opportunity,
  applications,
  onClose,
  nonprofitId
}) => {
  const [activeSubTab, setActiveSubTab] = useState('applicants');
  const [reachOutVolunteer, setReachOutVolunteer] = useState(null);
  const [reachOutNote, setReachOutNote] = useState('');
  const [playingVideoVolunteerId, setPlayingVideoVolunteerId] = useState(null);

  const applicants = useMemo(
    () => applications.filter((app) => app.opportunityId === opportunity?.id),
    [applications, opportunity?.id]
  );

  const applicantVolunteerIds = useMemo(
    () => new Set(applicants.map((a) => a.volunteerId)),
    [applicants]
  );

  const allVolunteers = useMemo(() => {
    const fromApps = new Map();
    applications.forEach((app) => {
      if (!fromApps.has(app.volunteerId)) {
        fromApps.set(app.volunteerId, {
          id: app.volunteerId,
          name: app.volunteerName,
          email: app.volunteerEmail,
          school: app.volunteerSchool,
          skills: app.volunteerSkills || []
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

  const reachOutVolunteers = useMemo(
    () => opportunity ? getMatchingVolunteers(opportunity, allVolunteers, applicantVolunteerIds) : [],
    [opportunity, allVolunteers, applicantVolunteerIds]
  );

  const handleReachOutClick = (vol) => {
    setReachOutVolunteer(vol);
    setReachOutNote('');
  };

  const handleReachOutConfirm = () => {
    if (!reachOutVolunteer) return;
    likeVolunteerProfile(nonprofitId, reachOutVolunteer.id);
    setOutreachMessage(nonprofitId, reachOutVolunteer.id, opportunity.id, reachOutNote);
    setReachOutVolunteer(null);
    setReachOutNote('');
  };

  if (!opportunity) return null;

  const overlayContent = (
    <div className="find-volunteers-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="find-volunteers-panel" onClick={(e) => e.stopPropagation()}>
        <div className="find-volunteers-header">
          <h2>Find Volunteers: {opportunity.title}</h2>
          <button type="button" className="find-volunteers-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="find-volunteers-tabs">
          <button
            type="button"
            className={`find-volunteers-tab ${activeSubTab === 'applicants' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('applicants')}
          >
            Applicants ({applicants.length})
          </button>
          <button
            type="button"
            className={`find-volunteers-tab ${activeSubTab === 'reach-out' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('reach-out')}
          >
            Reach Out ({reachOutVolunteers.length})
          </button>
        </div>
        <div className="find-volunteers-content">
          {activeSubTab === 'applicants' ? (
            applicants.length > 0 ? (
              <div className="find-volunteers-list">
                {applicants.map((app) => {
                  const photoUrl = getProfilePhotoUrl(app.volunteerId);
                  const pitchUrl = getPitchVideoUrl(app.volunteerId);
                  return (
                    <div key={app.id} className="find-volunteer-card">
                      <div className="find-volunteer-avatar">
                        {photoUrl ? (
                          <img src={resolveMediaUrl(photoUrl)} alt="" className="find-volunteer-avatar-img" />
                        ) : (
                          <span className="find-volunteer-avatar-fallback">
                            {(app.volunteerName || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="find-volunteer-main">
                        <div className="find-volunteer-name">{app.volunteerName}</div>
                        <div className="find-volunteer-email">{app.volunteerEmail}</div>
                        <div className="find-volunteer-meta">{app.volunteerSchool} · Applied for {app.opportunityTitle}</div>
                        <div className="find-volunteer-skills">
                          {(app.volunteerSkills || []).map((s) => (
                            <span key={s} className="find-volunteer-skill">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="find-volunteer-actions">
                        <div className="find-volunteer-status">
                          <span className={`status-badge status-${app.status}`}>{app.status}</span>
                        </div>
                        {pitchUrl && (
                          <button
                            type="button"
                            className="btn-introduction"
                            onClick={() => setPlayingVideoVolunteerId(playingVideoVolunteerId === app.volunteerId ? null : app.volunteerId)}
                          >
                            Intro <PlayIcon />
                          </button>
                        )}
                      </div>
                      {playingVideoVolunteerId === app.volunteerId && pitchUrl && (
                        <div className="find-volunteer-video-wrap">
                          <video
                            src={resolveMediaUrl(pitchUrl)}
                            controls
                            autoPlay
                            className="find-volunteer-video"
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
                })}
              </div>
            ) : (
              <div className="find-volunteers-empty">
                <p>No applicants yet for this opportunity.</p>
              </div>
            )
          ) : (
            reachOutVolunteers.length > 0 ? (
              <div className="find-volunteers-list">
                {reachOutVolunteers.map((vol) => {
                  const pitchUrl = getPitchVideoUrl(vol.id);
                  const photoUrl = getProfilePhotoUrl(vol.id);
                  return (
                    <div key={vol.id} className="find-volunteer-card">
                      <div className="find-volunteer-avatar">
                        {photoUrl ? (
                          <img src={resolveMediaUrl(photoUrl)} alt="" className="find-volunteer-avatar-img" />
                        ) : (
                          <span className="find-volunteer-avatar-fallback">
                            {(vol.name || '?').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="find-volunteer-main">
                        <div className="find-volunteer-name">{vol.name}</div>
                        <div className="find-volunteer-email">{vol.email}</div>
                        <div className="find-volunteer-meta">{vol.school || 'No school'}</div>
                        <div className="find-volunteer-skills">
                          {(vol.skills || []).map((s) => (
                            <span key={s} className="find-volunteer-skill">{s}</span>
                          ))}
                          {(vol.interests || []).map((i) => (
                            <span key={i} className="find-volunteer-skill interest">{i}</span>
                          ))}
                        </div>
                      </div>
                      <div className="find-volunteer-actions">
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
                        <div className="find-volunteer-video-wrap">
                          <video
                            src={resolveMediaUrl(pitchUrl)}
                            controls
                            autoPlay
                            className="find-volunteer-video"
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
                })}
              </div>
            ) : (
              <div className="find-volunteers-empty">
                <p>No matching volunteers found who haven&apos;t applied. Try adding more detail to your opportunity description.</p>
              </div>
            )
          )}
        </div>
      </div>

      {reachOutVolunteer && (
        <div className="find-volunteers-inner-overlay" onClick={(e) => e.target === e.currentTarget && setReachOutVolunteer(null)}>
          <div className="find-volunteers-inner-panel" onClick={(e) => e.stopPropagation()}>
            <div className="find-volunteers-inner-header">
              <h3>Reach Out</h3>
              <button type="button" className="find-volunteers-close" onClick={() => setReachOutVolunteer(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="find-volunteers-inner-body">
              <div className="find-volunteer-inner-card">
                <div className="find-volunteer-avatar">
                  {getProfilePhotoUrl(reachOutVolunteer.id) ? (
                    <img src={resolveMediaUrl(getProfilePhotoUrl(reachOutVolunteer.id))} alt="" className="find-volunteer-avatar-img" />
                  ) : (
                    <span className="find-volunteer-avatar-fallback">
                      {(reachOutVolunteer.name || '?').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="find-volunteer-main">
                  <div className="find-volunteer-name">{reachOutVolunteer.name}</div>
                  <div className="find-volunteer-email">{reachOutVolunteer.email}</div>
                </div>
              </div>
              <div className="find-volunteers-note-group">
                <label htmlFor="reach-out-note">Add a note (optional)</label>
                <textarea
                  id="reach-out-note"
                  className="find-volunteers-note-input"
                  rows={4}
                  placeholder="Introduce yourself and why you're interested in this volunteer..."
                  value={reachOutNote}
                  onChange={(e) => setReachOutNote(e.target.value)}
                />
              </div>
              <div className="find-volunteers-inner-actions">
                <button type="button" className="btn-reach-out" onClick={handleReachOutConfirm}>
                  Reach Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(overlayContent, document.body);
};

export default FindVolunteersOverlay;
