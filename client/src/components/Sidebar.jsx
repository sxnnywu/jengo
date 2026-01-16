import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, role = 'volunteer' }) => {
  const navigate = useNavigate();
  const userCredits = 179; // Mock credits

  const volunteerMenuItems = [
    { id: 'opportunities', label: 'Opportunities', icon: '⊞' },
    { id: 'saved', label: 'Opportunities', icon: '🔖' },
    { id: 'applications', label: 'My Applications', icon: '📋' },
    { id: 'contacts', label: 'My Contacts', icon: '👤' },
    { id: 'resources', label: 'Resources', icon: '💼' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const nonprofitMenuItems = [
    { id: 'create', label: 'Create Opportunity', icon: '➕' },
    { id: 'my-postings', label: 'My Opportunities', icon: '📝' },
    { id: 'applicants', label: 'Applicants', icon: '👥' },
    { id: 'resources', label: 'Resources', icon: '💼' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const menuItems = role === 'volunteer' ? volunteerMenuItems : nonprofitMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">🤖</div>
          <span className="logo-text">Jengo</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
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
