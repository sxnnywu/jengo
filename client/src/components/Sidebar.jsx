import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import jengoLogo from '../assets/jengologo.png';

const Sidebar = ({ activeTab, setActiveTab, role = 'volunteer' }) => {
  const navigate = useNavigate();

  const volunteerMenuItems = [
    { id: 'opportunities', label: 'Opportunities', icon: '' },
    { id: 'shortlist', label: 'Shortlist', icon: '' },
    { id: 'discover', label: 'Go Jengo', icon: '' },
    { id: 'matches', label: 'Matches', icon: '' }
  ];

  const nonprofitMenuItems = [
    { id: 'create', label: 'Create Opportunity', icon: '' },
    { id: 'my-postings', label: 'My Opportunities', icon: '' },
    { id: 'applicants', label: 'Applicants', icon: '' },
    { id: 'matches', label: 'Matches', icon: '' }
  ];

  const menuItems = role === 'volunteer' ? volunteerMenuItems : nonprofitMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container" aria-label="Jengo">
          <img className="hero-logo" src={jengoLogo} alt="Jengo" />
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon ? <span className="nav-icon">{item.icon}</span> : null}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
