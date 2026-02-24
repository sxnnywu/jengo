import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OpportunityCard from '../components/OpportunityCard';
import CreateOpportunity from '../components/CreateOpportunity';
import VolunteerApplicationCard from '../components/VolunteerApplicationCard';
import RoleSwitcher from '../components/RoleSwitcher';
import SwipeDeck from '../components/SwipeDeck';
import TagInput from '../components/TagInput';
import { mockOpportunities, mockApplications } from '../utils/mockData';
import {
  computeMatchedNonprofits,
  getAllProfileLikes,
  getAllTaskLikes,
  getPitchVideoUrl,
  likeVolunteerProfile,
  resolveMediaUrl
} from '../utils/matchmaking';
import './Dashboard.css';
import { setPitchVideoUrl } from '../utils/matchmaking';
import api from '../services/api';
import jengoLogo from '../assets/jengologo.png';

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

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}${Date.now()}`;
}

const Dashboard = () => {
  const [opportunities, setOpportunities] = useState(() => {
    const storedOpportunities = JSON.parse(localStorage.getItem('opportunities') || 'null');
    return Array.isArray(storedOpportunities) && storedOpportunities.length > 0
      ? storedOpportunities
      : mockOpportunities;
  });

  const [applications, setApplications] = useState(() => {
    const storedApplications = JSON.parse(localStorage.getItem('applications') || 'null');
    return Array.isArray(storedApplications) && storedApplications.length > 0
      ? storedApplications
      : mockApplications;
  });
  const [activeTab, setActiveTab] = useState('opportunities');
  const [shortlistSubTab, setShortlistSubTab] = useState('saved'); // 'saved' | 'applications'
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem('currentUser') || 'null')
  );
  const [viewRole, setViewRole] = useState(() => currentUser?.role || 'volunteer'); // 'volunteer' or 'nonprofit'

  const [volunteerProfile, setVolunteerProfile] = useState(() => ({
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    location: currentUser?.location || '',
    age: currentUser?.age || '',
    school: currentUser?.school || '',
    skills: currentUser?.skills || [],
    interests: currentUser?.interests || [],
    matchingText: currentUser?.matchingProfile?.text || '',
    resume: currentUser?.resume || '',
    profilePhoto: currentUser?.profilePhoto || '',
    pitchVideoUrl: currentUser?.pitchVideoUrl || ''
  }));

  const [nonprofitProfile, setNonprofitProfile] = useState(() => ({
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    location: currentUser?.location || '',
    website: currentUser?.website || '',
    organizationDescription: currentUser?.organizationDescription || '',
    neededSkills: currentUser?.neededSkills || [],
    neededInterests: currentUser?.neededInterests || [],
    matchingText: currentUser?.matchingProfile?.text || '',
    typicalVolunteerHours: currentUser?.typicalVolunteerHours || '',
    logo: currentUser?.logo || ''
  }));
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const resumeInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);
  const [isResumeDragOver, setIsResumeDragOver] = useState(false);
  const [resumeStatus, setResumeStatus] = useState({ state: 'idle', fileName: '' }); // idle|uploading|done|error
  const [volJengoQuery, setVolJengoQuery] = useState('');
  const [volJengoStatus, setVolJengoStatus] = useState('idle'); // idle|searching|done
  const [volJengoResults, setVolJengoResults] = useState([]);
  const [npJengoQuery, setNpJengoQuery] = useState('');
  const [npJengoStatus, setNpJengoStatus] = useState('idle'); // idle|searching|done
  const [npJengoDeck, setNpJengoDeck] = useState([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!isMenuOpen) return;
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target)) return;
      setIsMenuOpen(false);
    };

    const onKeyDown = (e) => {
      if (!isMenuOpen) return;
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  // Keep localStorage in sync (external system) with latest state.
  useEffect(() => {
    localStorage.setItem('opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('applications', JSON.stringify(applications));
  }, [applications]);

  const currentUserId = currentUser?.id || currentUser?._id;
  const volunteerContextId = currentUser?.role === 'volunteer' && currentUserId ? currentUserId : 'vol1';
  const nonprofitContextId = currentUser?.role === 'nonprofit' && currentUserId ? currentUserId : 'np1';

  // Derived data
  const myApplications = currentUserId
    ? applications.filter((app) => app.volunteerId === currentUserId)
    : [];
  const myOpportunities = currentUserId
    ? opportunities.filter((opp) => opp.nonprofitId === currentUserId)
    : [];

  const handleRoleChange = (role) => {
    setViewRole(role);
    // Reset to appropriate default tab
    if (role === 'volunteer') {
      setActiveTab('opportunities');
    } else {
      setActiveTab('my-postings');
    }
  };

  const volunteerId = volunteerContextId;
  const nonprofitId = nonprofitContextId;

  const runVolunteerGoJengo = () => {
    setVolJengoStatus('searching');
    const kw = extractKeywords(
      [
        volunteerProfile.interests?.join(' ') || '',
        volunteerProfile.skills?.join(' ') || '',
        volunteerProfile.matchingText || '',
        volJengoQuery || ''
      ].join(' ')
    );

    const scored = opportunities
      .filter((o) => o.status !== 'closed')
      .map((opp) => {
        const text = `${opp.title} ${opp.company} ${opp.location} ${opp.category} ${opp.description} ${(opp.skillsRequired || []).join(' ')}`.toLowerCase();
        const score =
          kw.length === 0
            ? 1
            : kw.reduce((acc, k) => {
                if (!k) return acc;
                const needle = String(k).toLowerCase();
                if (text.includes(needle)) return acc + 1;
                return acc;
              }, 0);
        return { opp, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.opp);

    window.setTimeout(() => {
      setVolJengoResults(scored);
      setVolJengoStatus('done');
    }, 900);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleOpenProfile = () => {
    setIsMenuOpen(false);
    if (currentUser?.role) setViewRole(currentUser.role);
    setActiveTab('profile');
  };

  const handleApply = (opportunityId) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;
    if (opportunity.status === 'closed') {
      alert('This opportunity is closed.');
      return;
    }

    const volunteerId = currentUserId || 'vol1';
    const duplicate = applications.some(
      (app) => app.opportunityId === opportunityId && app.volunteerId === volunteerId
    );
    if (duplicate) {
      alert('You have already applied to this opportunity.');
      return;
    }

    const newApplication = {
      id: makeId('app'),
      opportunityId: opportunity.id,
      volunteerId,
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

    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    localStorage.setItem('applications', JSON.stringify(updatedApplications));
    alert(`Applied to ${opportunity.title}!`);
  };

  const handleOpportunityCreated = (newOpp) => {
    const updated = [...opportunities, newOpp];
    setOpportunities(updated);
    localStorage.setItem('opportunities', JSON.stringify(updated));
    setActiveTab('my-postings');
  };

  const handleCloseOpportunity = (opportunityId) => {
    const updated = opportunities.map((opp) =>
      opp.id === opportunityId ? { ...opp, status: 'closed' } : opp
    );
    setOpportunities(updated);
    localStorage.setItem('opportunities', JSON.stringify(updated));
    alert('Opportunity closed.');
  };

  const handleVolunteerProfileSave = () => {
    if (!currentUser) return;
    const userIdForUpdate = currentUser?.id || currentUser?._id;
    const updateData = {
      name: volunteerProfile.name,
      username: volunteerProfile.username,
      email: volunteerProfile.email,
      location: volunteerProfile.location,
      age: volunteerProfile.age ? Number(volunteerProfile.age) : undefined,
      school: volunteerProfile.school,
      skills: volunteerProfile.skills,
      interests: volunteerProfile.interests,
      matchingProfile: {
        text: volunteerProfile.matchingText,
        keywords: extractKeywords(volunteerProfile.matchingText)
      },
      resume: volunteerProfile.resume,
      profilePhoto: volunteerProfile.profilePhoto,
      pitchVideoUrl: volunteerProfile.pitchVideoUrl
    };

    const token = localStorage.getItem('token');
    if (token && userIdForUpdate) {
      api.updateUserProfile(userIdForUpdate, updateData)
        .then((data) => {
          const serverUser = data?.user || null;
          const merged = { ...currentUser, ...serverUser, id: serverUser?._id || currentUser?.id || currentUser?._id };
          localStorage.setItem('currentUser', JSON.stringify(merged));
          setCurrentUser(merged);
          alert('Profile updated.');
        })
        .catch(() => {
          localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updateData }));
          setCurrentUser({ ...currentUser, ...updateData });
          alert('Profile updated locally.');
        });
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updateData }));
    setCurrentUser({ ...currentUser, ...updateData });
    alert('Profile updated.');
  };

  const handlePitchVideoSelected = async (file) => {
    if (!file) return;

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    setPitchVideoUrl(volunteerId, localUrl);
    setVolunteerProfile({ ...volunteerProfile, pitchVideoUrl: localUrl });

    // Persist if logged in with backend token
    const userIdForUpload = currentUser?.id || currentUser?._id;
    const token = localStorage.getItem('token');
    if (!token || !userIdForUpload) return;

    try {
      const data = await api.uploadPitchVideo(userIdForUpload, file);
      if (data?.pitchVideoUrl) {
        setPitchVideoUrl(volunteerId, data.pitchVideoUrl);
        setVolunteerProfile((p) => ({ ...p, pitchVideoUrl: data.pitchVideoUrl }));
        const updatedUser = { ...(JSON.parse(localStorage.getItem('currentUser') || 'null') || {}), pitchVideoUrl: data.pitchVideoUrl };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch {
      // keep local preview if upload fails
    }
  };

  const handleResumeSelected = async (file) => {
    if (!file) return;
    setResumeStatus({ state: 'uploading', fileName: file.name || '' });

    const userIdForUpload = currentUser?.id || currentUser?._id;
    const token = localStorage.getItem('token');
    if (!token || !userIdForUpload) {
      setResumeStatus({ state: 'error', fileName: file.name || '' });
      return;
    }

    try {
      const data = await api.uploadResume(userIdForUpload, file);
      if (data?.resumeUrl) {
        setVolunteerProfile((p) => ({ ...p, resume: data.resumeUrl }));
        const updatedUser = {
          ...(JSON.parse(localStorage.getItem('currentUser') || 'null') || {}),
          resume: data.resumeUrl
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setResumeStatus({ state: 'done', fileName: file.name || '' });
      } else {
        setResumeStatus({ state: 'error', fileName: file.name || '' });
      }
    } catch {
      setResumeStatus({ state: 'error', fileName: file.name || '' });
    }
  };

  const handleProfilePhotoSelected = async (file) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setVolunteerProfile((p) => ({ ...p, profilePhoto: localUrl }));

    const userIdForUpload = currentUser?.id || currentUser?._id;
    const token = localStorage.getItem('token');
    if (!token || !userIdForUpload) return;

    try {
      const data = await api.uploadProfilePhoto(userIdForUpload, file);
      if (data?.profilePhoto) {
        setVolunteerProfile((p) => ({ ...p, profilePhoto: data.profilePhoto }));
        const updatedUser = {
          ...(JSON.parse(localStorage.getItem('currentUser') || 'null') || {}),
          profilePhoto: data.profilePhoto
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }
    } catch {
      // keep local preview if upload fails
    }
  };

  const handleNonprofitProfileSave = () => {
    if (!currentUser) return;
    const userIdForUpdate = currentUser?.id || currentUser?._id;
    const updateData = {
      name: nonprofitProfile.name,
      username: nonprofitProfile.username,
      email: nonprofitProfile.email,
      location: nonprofitProfile.location,
      organizationDescription: nonprofitProfile.organizationDescription,
      website: nonprofitProfile.website,
      neededSkills: nonprofitProfile.neededSkills,
      neededInterests: nonprofitProfile.neededInterests,
      matchingProfile: {
        text: nonprofitProfile.matchingText,
        keywords: extractKeywords(nonprofitProfile.matchingText)
      },
      typicalVolunteerHours: nonprofitProfile.typicalVolunteerHours,
      logo: nonprofitProfile.logo
    };

    const token = localStorage.getItem('token');
    if (token && userIdForUpdate) {
      api.updateUserProfile(userIdForUpdate, updateData)
        .then((data) => {
          const serverUser = data?.user || null;
          const merged = { ...currentUser, ...serverUser, id: serverUser?._id || currentUser?.id || currentUser?._id };
          localStorage.setItem('currentUser', JSON.stringify(merged));
          setCurrentUser(merged);
          alert('Organization profile updated.');
        })
        .catch(() => {
          localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updateData }));
          setCurrentUser({ ...currentUser, ...updateData });
          alert('Organization profile updated locally.');
        });
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...updateData }));
    setCurrentUser({ ...currentUser, ...updateData });
    alert('Organization profile updated.');
  };

  const renderVolunteerContent = () => {
    switch (activeTab) {
      case 'discover': {
        const isSearching = volJengoStatus === 'searching';
        return (
          <div className="jengo-page">
            <div className="jengo-hero">
              <div>
                <h2 className="jengo-title">Go Jengo</h2>
                <p className="jengo-subtitle">
                  Tell Jengo what you’re looking for. The messenger bird will return with opportunities that match your interests.
                </p>
              </div>
              <button type="button" className="dash-btn dash-btn--ghost" onClick={() => setActiveTab('matches')}>
                View Matches
              </button>
            </div>

            <div className="jengo-agent-card">
              <div className="jengo-agent-row">
                <img
                  src={jengoLogo}
                  alt="Jengo"
                  className={`jengo-bird ${isSearching ? 'jengo-bird--fly' : ''}`}
                />
                <div className="jengo-agent-main">
                  <label className="jengo-label" htmlFor="jengoQueryVol">
                    Ask Jengo
                  </label>
                  <textarea
                    id="jengoQueryVol"
                    rows={3}
                    value={volJengoQuery}
                    onChange={(e) => setVolJengoQuery(e.target.value)}
                    placeholder="Example: remote web development, social media, climate, fundraising…"
                    className="jengo-textarea"
                    disabled={isSearching}
                  />
                  <div className="jengo-actions">
                    <button type="button" className="dash-btn dash-btn--primary" onClick={runVolunteerGoJengo} disabled={isSearching}>
                      {isSearching ? 'Sending…' : 'Go Jengo'}
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn--ghost"
                      onClick={() => {
                        setVolJengoQuery('');
                        setVolJengoResults([]);
                        setVolJengoStatus('idle');
                      }}
                      disabled={isSearching}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="jengo-hint">
                    Uses your profile interests + skills automatically (you can add extra keywords above).
                  </div>
                </div>
              </div>
            </div>

            {volJengoStatus === 'done' ? (
              volJengoResults.length > 0 ? (
                <div className="opportunities-grid">
                  {volJengoResults.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      onApply={() => handleApply(opp.id)}
                      showStatus
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No opportunities found</h3>
                  <p>Try different keywords, or add interests/skills in your profile.</p>
                </div>
              )
            ) : (
              <div className="empty-state">
                <h3>Ready when you are</h3>
                <p>Click “Go Jengo” to get tailored opportunities.</p>
              </div>
            )}
          </div>
        );
      }
      case 'matches': {
        const likesByNonprofit = getAllProfileLikes();
        const receivedNonprofitIds = Object.entries(likesByNonprofit)
          .filter(([, volIds]) => Array.isArray(volIds) && volIds.includes(volunteerId))
          .map(([npId]) => npId);

        const taskLikesByVolunteer = getAllTaskLikes();
        const likedOppIds = Array.isArray(taskLikesByVolunteer?.[volunteerId]) ? taskLikesByVolunteer[volunteerId] : [];
        const sentNonprofitIds = [
          ...new Set(
            likedOppIds
              .map((oppId) => opportunities.find((o) => o.id === oppId))
              .filter(Boolean)
              .map((o) => o.nonprofitId)
          )
        ];

        const mutualNonprofitIds = computeMatchedNonprofits({ volunteerId, opportunities });
        const mutualOpps = opportunities.filter((opp) => mutualNonprofitIds.includes(opp.nonprofitId));

        const npName = (npId) => opportunities.find((o) => o.nonprofitId === npId)?.company || npId;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text)' }}>Matches</h2>
              <p style={{ marginTop: '6px', marginBottom: 0, color: 'var(--text-muted)' }}>
                Sent likes, received likes, and mutual matches.
              </p>
            </div>

            <div className="profile-section" style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Sent</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{sentNonprofitIds.length} nonprofits</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sentNonprofitIds.slice(0, 8).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {npName(id)}
                      </div>
                    ))}
                    {sentNonprofitIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No likes yet.</div> : null}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Received</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{receivedNonprofitIds.length} nonprofits</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {receivedNonprofitIds.slice(0, 8).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {npName(id)}
                      </div>
                    ))}
                    {receivedNonprofitIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No incoming likes yet.</div> : null}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Mutual</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{mutualNonprofitIds.length} matches</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {mutualNonprofitIds.slice(0, 8).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {npName(id)}
                      </div>
                    ))}
                    {mutualNonprofitIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No mutual matches yet.</div> : null}
                  </div>
                </div>
              </div>
            </div>

            {mutualOpps.length > 0 ? (
              <div className="opportunities-grid">
                {mutualOpps.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} onApply={() => handleApply(opp.id)} showStatus />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No mutual matches yet</h3>
                <p>Like a few tasks and wait for nonprofits to like your profile back.</p>
              </div>
            )}
          </div>
        );
      }
      case 'opportunities':
        return (
          <div className="opportunities-grid">
            {opportunities.map((opp) => (
              <OpportunityCard 
                key={opp.id} 
                opportunity={opp}
                onApply={() => handleApply(opp.id)}
                showStatus
              />
            ))}
          </div>
        );
      case 'shortlist': {
        const savedIds = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
        const savedOpps = opportunities.filter(opp => savedIds.includes(opp.id));
        return (
          <div className="shortlist-page">
            <div className="shortlist-tabs">
              <button
                type="button"
                className={`shortlist-tab ${shortlistSubTab === 'saved' ? 'active' : ''}`}
                onClick={() => setShortlistSubTab('saved')}
              >
                Saved
              </button>
              <button
                type="button"
                className={`shortlist-tab ${shortlistSubTab === 'applications' ? 'active' : ''}`}
                onClick={() => setShortlistSubTab('applications')}
              >
                Applications
              </button>
            </div>
            {shortlistSubTab === 'saved' ? (
              savedOpps.length > 0 ? (
                <div className="opportunities-grid">
                  {savedOpps.map((opp) => (
                    <OpportunityCard key={opp.id} opportunity={opp} onApply={() => handleApply(opp.id)} showStatus />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>No Saved Opportunities</h3>
                  <p>Save opportunities you're interested in to view them here.</p>
                </div>
              )
            ) : myApplications.length > 0 ? (
              <div className="applications-grid">
                {myApplications.map((app) => {
                  const opp = opportunities.find(o => o.id === app.opportunityId);
                  return (
                    <VolunteerApplicationCard
                      key={app.id}
                      application={app}
                      opportunity={opp}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No Applications Yet</h3>
                <p>Start applying to opportunities to track your applications here.</p>
              </div>
            )}
          </div>
        );
      }
      case 'profile':
        return (
          <div className="profile-section">
            <div className="profile-header">
              <h2>My Profile</h2>
              <button
                type="button"
                className="profile-avatar-btn"
                onClick={() => profilePhotoInputRef.current?.click()}
                aria-label="Edit profile photo"
              >
                {volunteerProfile.profilePhoto ? (
                  <img
                    className="profile-avatar-img"
                    src={resolveMediaUrl(volunteerProfile.profilePhoto)}
                    alt="Profile"
                  />
                ) : (
                  <div className="profile-avatar-fallback" aria-hidden="true">
                    {(volunteerProfile.name || currentUser?.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="profile-avatar-overlay">Edit</div>
              </button>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleProfilePhotoSelected(e.target.files?.[0])}
              />
            </div>
            <div className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={volunteerProfile.name}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={volunteerProfile.username}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, username: e.target.value })}
                  placeholder="Username"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={volunteerProfile.email}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={volunteerProfile.location}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={volunteerProfile.age}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, age: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div className="form-group">
                <label>School</label>
                <input
                  type="text"
                  value={volunteerProfile.school}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, school: e.target.value })}
                  placeholder="Enter your school"
                />
              </div>
              <div className="form-group">
                <TagInput
                  label="Skills"
                  values={volunteerProfile.skills}
                  onChange={(skills) => setVolunteerProfile({ ...volunteerProfile, skills })}
                  suggestions={['Communication', 'Project Management', 'Social Media', 'Content Writing', 'Graphic Design', 'UI/UX', 'Web Development', 'Data Analysis']}
                  placeholder="Type a skill and press Enter"
                />
              </div>
              <div className="form-group">
                <TagInput
                  label="Interests"
                  values={volunteerProfile.interests}
                  onChange={(interests) => setVolunteerProfile({ ...volunteerProfile, interests })}
                  suggestions={['Education', 'Environment', 'Healthcare', 'Technology', 'Community', 'Youth', 'Food Security', 'Human Rights']}
                  placeholder="Type an interest and press Enter"
                />
              </div>
              <div className="form-group">
                <label>Matching preferences (optional)</label>
                <textarea
                  rows="4"
                  value={volunteerProfile.matchingText}
                  onChange={(e) => setVolunteerProfile({ ...volunteerProfile, matchingText: e.target.value })}
                  placeholder="What kind of nonprofits do you want? What do you want to learn?"
                />
              </div>
              <div className="form-group">
                <label>Resume</label>
                <div
                  className={`file-dropzone ${isResumeDragOver ? 'file-dropzone--active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => resumeInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') resumeInputRef.current?.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsResumeDragOver(true);
                  }}
                  onDragLeave={() => setIsResumeDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsResumeDragOver(false);
                    handleResumeSelected(e.dataTransfer.files?.[0]);
                  }}
                  aria-label="Upload resume (PDF or Word)"
                >
                  <div className="file-dropzone__title">Drop your resume here</div>
                  <div className="file-dropzone__subtitle">or click to upload (PDF, DOC, DOCX)</div>
                  {resumeStatus.state === 'uploading' ? (
                    <div className="file-dropzone__meta">Uploading…</div>
                  ) : resumeStatus.state === 'done' ? (
                    <div className="file-dropzone__meta">Uploaded: {resumeStatus.fileName}</div>
                  ) : resumeStatus.state === 'error' ? (
                    <div className="file-dropzone__meta file-dropzone__meta--error">
                      Upload failed. Please try again.
                    </div>
                  ) : volunteerProfile.resume ? (
                    <div className="file-dropzone__meta">
                      Current:{" "}
                      <a href={resolveMediaUrl(volunteerProfile.resume)} target="_blank" rel="noreferrer">
                        View uploaded resume
                      </a>
                    </div>
                  ) : null}
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: 'none' }}
                  onChange={(e) => handleResumeSelected(e.target.files?.[0])}
                />
              </div>
              <div className="form-group">
                <label>Pitch video (upload)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handlePitchVideoSelected(e.target.files?.[0])}
                />
                {volunteerProfile.pitchVideoUrl ? (
                  <video
                    src={resolveMediaUrl(volunteerProfile.pitchVideoUrl)}
                    controls
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'black'
                    }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>
                    Upload a short video pitch so nonprofits can learn about you quickly.
                  </div>
                )}
              </div>
              <button className="btn btn-primary" onClick={handleVolunteerProfileSave}>
                Save Profile
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="empty-state">
            <h3>{activeTab}</h3>
            <p>This feature is coming soon.</p>
          </div>
        );
    }
  };

  const renderNonprofitContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateOpportunity onOpportunityCreated={handleOpportunityCreated} />;
      case 'my-postings':
        return myOpportunities.length > 0 ? (
          <div className="opportunities-grid">
            {myOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                showApply={false}
                onClose={handleCloseOpportunity}
                showStatus
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Opportunities Posted</h3>
            <p>Create your first opportunity to get started.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => setActiveTab('create')}
              style={{ marginTop: '16px' }}
            >
              Create Opportunity
            </button>
          </div>
        );
      case 'applicants': {
        // Show applications for nonprofit's opportunities
        const myOppIds = myOpportunities.map(opp => opp.id);
        const relevantApps = applications.filter(app => myOppIds.includes(app.opportunityId));
        const isSearching = npJengoStatus === 'searching';
        const deck = npJengoStatus === 'done' ? npJengoDeck : [];

        const runNonprofitGoJengo = () => {
          setNpJengoStatus('searching');
          const kw = extractKeywords(
            [
              nonprofitProfile.neededSkills?.join(' ') || '',
              nonprofitProfile.neededInterests?.join(' ') || '',
              nonprofitProfile.matchingText || '',
              npJengoQuery || ''
            ].join(' ')
          );

          const scored = relevantApps
            .map((app) => {
              const text = `${app.volunteerName} ${app.volunteerEmail} ${app.volunteerSchool} ${(app.volunteerSkills || []).join(' ')} ${app.opportunityTitle}`.toLowerCase();
              const score =
                kw.length === 0
                  ? 1
                  : kw.reduce((acc, k) => {
                      if (!k) return acc;
                      const needle = String(k).toLowerCase();
                      if (text.includes(needle)) return acc + 1;
                      return acc;
                    }, 0);
              return { app, score };
            })
            .filter((x) => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 50)
            .map((x) => x.app);

          window.setTimeout(() => {
            setNpJengoDeck(scored);
            setNpJengoStatus('done');
          }, 900);
        };

        return relevantApps.length > 0 ? (
          <div className="jengo-page">
            <div className="jengo-hero">
              <div>
                <h2 className="jengo-title">Go Jengo</h2>
                <p className="jengo-subtitle">
                  Tell Jengo what you want in a volunteer. The messenger bird will return with applicants that match.
                </p>
              </div>
              <button type="button" className="dash-btn dash-btn--ghost" onClick={() => setActiveTab('matches')}>
                View Matches
              </button>
            </div>

            <div className="jengo-agent-card">
              <div className="jengo-agent-row">
                <img
                  src={jengoLogo}
                  alt="Jengo"
                  className={`jengo-bird ${isSearching ? 'jengo-bird--fly' : ''}`}
                />
                <div className="jengo-agent-main">
                  <label className="jengo-label" htmlFor="jengoQueryNp">
                    What do you want in a volunteer?
                  </label>
                  <textarea
                    id="jengoQueryNp"
                    rows={3}
                    value={npJengoQuery}
                    onChange={(e) => setNpJengoQuery(e.target.value)}
                    placeholder="Example: grant writing, event planning, public speaking, youth outreach…"
                    className="jengo-textarea"
                    disabled={isSearching}
                  />
                  <div className="jengo-actions">
                    <button type="button" className="dash-btn dash-btn--primary" onClick={runNonprofitGoJengo} disabled={isSearching}>
                      {isSearching ? 'Sending…' : 'Go Jengo'}
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn--ghost"
                      onClick={() => {
                        setNpJengoQuery('');
                        setNpJengoDeck([]);
                        setNpJengoStatus('idle');
                      }}
                      disabled={isSearching}
                    >
                      Clear
                    </button>
                  </div>
                  <div className="jengo-hint">
                    Uses your “Skills you need” + “Focus areas” from your profile automatically.
                  </div>
                </div>
              </div>
            </div>

            {npJengoStatus === 'done' ? (
              deck.length > 0 ? (
                <SwipeDeck
                  items={deck}
                  getKey={(a) => a.id}
                  emptyTitle="No more applicants"
                  emptyBody="Try a different search to find more volunteers."
                  onLike={(app) => likeVolunteerProfile(nonprofitId, app.volunteerId)}
                  onPass={() => {}}
                  renderCard={(app) => {
                    const pitchUrl = getPitchVideoUrl(app.volunteerId);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--text)' }}>{app.volunteerName}</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{app.volunteerEmail}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              Applied for: <span style={{ color: 'var(--text)' }}>{app.opportunityTitle}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, color: 'var(--text)' }}>{app.status.toUpperCase()}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Swipe to like/pass</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(app.volunteerSkills || []).slice(0, 10).map((s) => (
                            <span
                              key={s}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 999,
                                background: 'var(--surface-subtle)',
                                border: '1px solid var(--border)',
                                fontWeight: 800,
                                fontSize: '0.85rem',
                                color: 'var(--text)'
                              }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ fontWeight: 900, color: 'var(--text)', marginBottom: '8px' }}>Pitch video</div>
                          {pitchUrl ? (
                            <video
                              src={pitchUrl}
                              controls
                              style={{ width: '100%', borderRadius: '14px', border: '1px solid var(--border)', background: 'black' }}
                            />
                          ) : (
                            <div style={{ color: 'var(--text-muted)' }}>No video uploaded yet.</div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              ) : (
                <div className="empty-state">
                  <h3>No applicants found</h3>
                  <p>Try different keywords, or wait for more applications.</p>
                </div>
              )
            ) : (
              <div className="empty-state">
                <h3>Ready when you are</h3>
                <p>Click “Go Jengo” to find applicants that match your needs.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Applications Yet</h3>
            <p>Applications for your opportunities will appear here.</p>
          </div>
        );
      }
      case 'matches': {
        const likesByNonprofit = getAllProfileLikes();
        const sentVolunteerIds = Array.isArray(likesByNonprofit?.[nonprofitId]) ? likesByNonprofit[nonprofitId] : [];

        const taskLikesByVolunteer = getAllTaskLikes();
        const myOppIdsSet = new Set(myOpportunities.map((o) => o.id));
        const receivedVolunteerIds = Object.entries(taskLikesByVolunteer)
          .filter(([, oppIds]) => Array.isArray(oppIds) && oppIds.some((id) => myOppIdsSet.has(id)))
          .map(([volId]) => volId);

        const sentSet = new Set(sentVolunteerIds);
        const mutualVolunteerIds = receivedVolunteerIds.filter((id) => sentSet.has(id));

        const byVolunteerId = new Map(applications.map((a) => [a.volunteerId, a]));
        const labelFor = (volId) => byVolunteerId.get(volId)?.volunteerName || volId;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text)' }}>Matches</h2>
              <p style={{ marginTop: '6px', marginBottom: 0, color: 'var(--text-muted)' }}>
                Sent likes, received likes, and mutual matches.
              </p>
            </div>

            <div className="profile-section" style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Sent</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{sentVolunteerIds.length} volunteers</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sentVolunteerIds.slice(0, 10).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {labelFor(id)}
                      </div>
                    ))}
                    {sentVolunteerIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No likes yet.</div> : null}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Received</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{receivedVolunteerIds.length} volunteers</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {receivedVolunteerIds.slice(0, 10).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {labelFor(id)}
                      </div>
                    ))}
                    {receivedVolunteerIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No incoming likes yet.</div> : null}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 900, color: 'var(--text)' }}>Mutual</div>
                  <div style={{ color: 'var(--text-muted)', fontWeight: 800 }}>{mutualVolunteerIds.length} matches</div>
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {mutualVolunteerIds.slice(0, 10).map((id) => (
                      <div key={id} style={{ fontWeight: 800, color: 'var(--text)' }}>
                        {labelFor(id)}
                      </div>
                    ))}
                    {mutualVolunteerIds.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No mutual matches yet.</div> : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'profile':
        return (
          <div className="profile-section">
            <h2>Organization Profile</h2>
            <div className="profile-form">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={nonprofitProfile.name}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={nonprofitProfile.username}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, username: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={nonprofitProfile.email}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={nonprofitProfile.location}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, location: e.target.value })}
                  placeholder="City, State"
                />
              </div>
              <div className="form-group">
                <label>Organization Description</label>
                <textarea
                  rows="4"
                  value={nonprofitProfile.organizationDescription}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, organizationDescription: e.target.value })}
                  placeholder="Describe your organization..."
                />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={nonprofitProfile.website}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <TagInput
                  label="Skills you need"
                  values={nonprofitProfile.neededSkills}
                  onChange={(neededSkills) => setNonprofitProfile({ ...nonprofitProfile, neededSkills })}
                  suggestions={['Communication', 'Project Management', 'Social Media', 'Content Writing', 'Graphic Design', 'UI/UX', 'Web Development', 'Data Analysis']}
                  placeholder="Type a needed skill and press Enter"
                />
              </div>
              <div className="form-group">
                <TagInput
                  label="Tasks / focus areas"
                  values={nonprofitProfile.neededInterests}
                  onChange={(neededInterests) => setNonprofitProfile({ ...nonprofitProfile, neededInterests })}
                  suggestions={['Education', 'Environment', 'Healthcare', 'Technology', 'Community', 'Youth', 'Food Security', 'Human Rights']}
                  placeholder="Type a task/focus area and press Enter"
                />
              </div>
              <div className="form-group">
                <label>What you’re looking for (optional)</label>
                <textarea
                  rows="4"
                  value={nonprofitProfile.matchingText}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, matchingText: e.target.value })}
                  placeholder="Describe the ideal volunteer, tasks, and timeline..."
                />
              </div>
              <div className="form-group">
                <label>Typical Volunteer Hours</label>
                <input
                  type="text"
                  value={nonprofitProfile.typicalVolunteerHours}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, typicalVolunteerHours: e.target.value })}
                  placeholder="e.g., 10-20 hours per week"
                />
              </div>
              <div className="form-group">
                <label>Organization Logo URL</label>
                <input
                  type="url"
                  value={nonprofitProfile.logo}
                  onChange={(e) => setNonprofitProfile({ ...nonprofitProfile, logo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <button className="btn btn-primary" onClick={handleNonprofitProfileSave}>
                Save Profile
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="empty-state">
            <h3>{activeTab}</h3>
            <p>This feature is coming soon.</p>
          </div>
        );
    }
  };

  const getTitle = () => {
    if (viewRole === 'volunteer') {
      switch (activeTab) {
        case 'discover': return 'Go Jengo';
        case 'matches': return 'Matches';
        case 'opportunities': return 'Volunteer Opportunities';
        case 'shortlist': return 'Shortlist';
        case 'profile': return 'My Profile';
        default: return 'Dashboard';
      }
    } else {
      switch (activeTab) {
        case 'create': return 'Create Opportunity';
        case 'my-postings': return 'My Opportunities';
        case 'applicants': return 'Applicants';
        case 'matches': return 'Matches';
        case 'profile': return 'Organization Profile';
        default: return 'Dashboard';
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        role={viewRole}
      />
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <Link to="/" className="dashboard-logo" aria-label="Jengo">
              <img className="hero-logo" src={jengoLogo} alt="Jengo" />
            </Link>
            <h1 className="dashboard-title">{getTitle()}</h1>
          </div>
          <div className="header-right">
            <RoleSwitcher 
              currentRole={viewRole} 
              onRoleChange={handleRoleChange}
            />
            <div className="user-menu-wrapper" ref={menuRef}>
              <button
                type="button"
                className="user-menu"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((v) => !v)}
              >
                <div className="user-avatar">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span className="dropdown-arrow" aria-hidden="true">{isMenuOpen ? '^' : 'v'}</span>
              </button>

              {isMenuOpen ? (
                <div className="user-dropdown" role="menu" aria-label="Account menu">
                  <div className="user-dropdown__header">
                    <div className="user-dropdown__name">{currentUser?.name || 'Signed in'}</div>
                    <div className="user-dropdown__email">{currentUser?.email || ''}</div>
                  </div>
                  <div className="user-dropdown__divider" />
                  <button
                    type="button"
                    className="user-dropdown__item"
                    role="menuitem"
                    onClick={handleOpenProfile}
                  >
                    <span>My profile</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                  <button
                    type="button"
                    className="user-dropdown__item danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <span>Log out</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="dashboard-content">
          {viewRole === 'volunteer' ? renderVolunteerContent() : renderNonprofitContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
