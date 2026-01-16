import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import OpportunityCard from '../components/OpportunityCard';
import CreateOpportunity from '../components/CreateOpportunity';
import ApplicationCard from '../components/ApplicationCard';
import VolunteerApplicationCard from '../components/VolunteerApplicationCard';
import RoleSwitcher from '../components/RoleSwitcher';
import { mockOpportunities, mockApplications } from '../utils/mockData';
import './Dashboard.css';

const Dashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [myOpportunities, setMyOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('opportunities');
  const [viewRole, setViewRole] = useState('volunteer'); // 'volunteer' or 'nonprofit'
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load user role
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.role) {
      setViewRole(currentUser.role);
    }

    // Load mock data
    setOpportunities(mockOpportunities);
    setApplications(mockApplications);
    
    // Load saved opportunities and applications from localStorage
    const saved = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
    const myApps = JSON.parse(localStorage.getItem('myApplications') || '[]');
    const myOpps = JSON.parse(localStorage.getItem('myOpportunities') || '[]');
    
    setMyApplications(myApps);
    setMyOpportunities(myOpps);
  }, [navigate]);

  const handleRoleChange = (role) => {
    setViewRole(role);
    // Reset to appropriate default tab
    if (role === 'volunteer') {
      setActiveTab('opportunities');
    } else {
      setActiveTab('my-postings');
    }
  };

  const handleApply = (opportunityId) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    const newApplication = {
      id: `app${Date.now()}`,
      opportunityId: opportunity.id,
      volunteerId: JSON.parse(localStorage.getItem('currentUser'))?.id || 'vol1',
      volunteerName: JSON.parse(localStorage.getItem('currentUser'))?.name || 'You',
      volunteerEmail: JSON.parse(localStorage.getItem('currentUser'))?.email || 'you@example.com',
      volunteerSchool: JSON.parse(localStorage.getItem('currentUser'))?.school || 'Your School',
      volunteerSkills: JSON.parse(localStorage.getItem('currentUser'))?.skills || ['General'],
      status: 'applied',
      appliedAt: new Date().toISOString(),
      opportunityTitle: opportunity.title
    };

    const updated = [...myApplications, newApplication];
    setMyApplications(updated);
    localStorage.setItem('myApplications', JSON.stringify(updated));
    alert(`Applied to ${opportunity.title}!`);
  };

  const handleOpportunityCreated = (newOpp) => {
    const updated = [...myOpportunities, newOpp];
    setMyOpportunities(updated);
    setOpportunities([...opportunities, newOpp]);
    localStorage.setItem('myOpportunities', JSON.stringify(updated));
    setActiveTab('my-postings');
  };

  const handleAccept = (applicationId) => {
    const updated = myApplications.map(app => 
      app.id === applicationId 
        ? { ...app, status: 'accepted', reviewedAt: new Date().toISOString() }
        : app
    );
    setMyApplications(updated);
    localStorage.setItem('myApplications', JSON.stringify(updated));
    alert('Application accepted!');
  };

  const handleReject = (applicationId) => {
    const updated = myApplications.map(app => 
      app.id === applicationId 
        ? { ...app, status: 'rejected', reviewedAt: new Date().toISOString() }
        : app
    );
    setMyApplications(updated);
    localStorage.setItem('myApplications', JSON.stringify(updated));
    alert('Application rejected.');
  };

  const renderVolunteerContent = () => {
    switch (activeTab) {
      case 'opportunities':
        return (
          <div className="opportunities-grid">
            {opportunities.map((opp) => (
              <OpportunityCard 
                key={opp.id} 
                opportunity={opp}
                onApply={() => handleApply(opp.id)}
              />
            ))}
          </div>
        );
      case 'saved':
        const savedIds = JSON.parse(localStorage.getItem('savedOpportunities') || '[]');
        const savedOpps = opportunities.filter(opp => savedIds.includes(opp.id));
        return savedOpps.length > 0 ? (
          <div className="opportunities-grid">
            {savedOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Opportunities</h3>
            <p>Save opportunities you're interested in to view them here.</p>
          </div>
        );
      case 'applications':
        return myApplications.length > 0 ? (
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
        );
      case 'profile':
        return (
          <div className="profile-section">
            <h2>My Profile</h2>
            <div className="profile-form">
              <div className="form-group">
                <label>School</label>
                <input type="text" placeholder="Enter your school" />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <input type="text" placeholder="Add your skills (comma separated)" />
              </div>
              <div className="form-group">
                <label>Resume (PDF Link)</label>
                <input type="url" placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Volunteer Form (PDF Link)</label>
                <input type="url" placeholder="https://..." />
              </div>
              <button className="btn btn-primary">Save Profile</button>
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
        const allMyOpps = [...myOpportunities, ...opportunities.filter(opp => 
          opp.nonprofitId === JSON.parse(localStorage.getItem('currentUser'))?.id
        )];
        return allMyOpps.length > 0 ? (
          <div className="opportunities-grid">
            {allMyOpps.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
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
      case 'applicants':
        // Show applications for nonprofit's opportunities
        const myOppIds = myOpportunities.map(opp => opp.id);
        const relevantApps = applications.filter(app => myOppIds.includes(app.opportunityId));
        return relevantApps.length > 0 ? (
          <div className="applications-grid">
            {relevantApps.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Applications Yet</h3>
            <p>Applications for your opportunities will appear here.</p>
          </div>
        );
      case 'profile':
        return (
          <div className="profile-section">
            <h2>Organization Profile</h2>
            <div className="profile-form">
              <div className="form-group">
                <label>Organization Description</label>
                <textarea rows="4" placeholder="Describe your organization..." />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input type="url" placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Typical Volunteer Hours</label>
                <input type="text" placeholder="e.g., 10-20 hours per week" />
              </div>
              <button className="btn btn-primary">Save Profile</button>
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
        case 'opportunities': return 'Volunteer Opportunities';
        case 'saved': return 'Opportunities';
        case 'applications': return 'My Applications';
        case 'profile': return 'My Profile';
        default: return 'Dashboard';
      }
    } else {
      switch (activeTab) {
        case 'create': return 'Create Opportunity';
        case 'my-postings': return 'My Opportunities';
        case 'applicants': return 'Applicants';
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
            <h1 className="dashboard-title">{getTitle()}</h1>
          </div>
          <div className="header-right">
            <RoleSwitcher 
              currentRole={viewRole} 
              onRoleChange={handleRoleChange}
            />
            <div className="user-menu">
              <div className="user-avatar">S</div>
              <span className="dropdown-arrow">▼</span>
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
